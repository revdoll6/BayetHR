'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Dialog } from '@headlessui/react';
import { FiPrinter, FiBriefcase, FiMapPin, FiCalendar, FiDownload, FiClock, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { wilayas } from '@/app/data/wilayas';
import { utils, writeFile } from 'xlsx';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Pagination from './components/Pagination';
import ApplicationStats from './components/ApplicationStats';

interface Application {
  id: string;
  jobPosition: {
    name: string;
    ar_name: string;
  };
  status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
  birthDate: string;
  wilayaId: string;
  updatedAt: string;
  candidate: {
    name: string;
    email: string;
  };
  firstName: string;
  lastName: string;
  mobile: string;
  birthCertificateNumber: string;
  communeId: string;
  photo: string | null;
  experience: any[];
  certifications: any[];
  softSkills: any[];
  languages: any[];
  profileImage: string | null;
  cv: string | null;
  certificates: any[];
  createdAt: string;
  educations: Array<{
    id: string;
    degree: string;
    field: string;
    institution: string;
    startDate: string;
    endDate: string | null;
    grade: string | null;
  }>;
}

interface JobPosition {
  id: string;
  name: string;
  ar_name: string;
}

interface Filters {
  status: string;
  wilaya: string;
  jobPosition: string;
  ageRange: string;
  dateRange: string;
}

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Language {
  name: string;
  level: string;
}

interface Certification {
  name: string;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Filters>({
    status: searchParams.get('status') || '',
    wilaya: searchParams.get('wilaya') || '',
    jobPosition: searchParams.get('jobPosition') || '',
    ageRange: searchParams.get('ageRange') || '',
    dateRange: searchParams.get('dateRange') || '',
  });
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [reviewingCount, setReviewingCount] = useState(0);

  // Effect to update filters when URL status changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      status: searchParams.get('status') || '',
      page: 1, // Reset to first page when status changes
    }));
  }, [searchParams.get('status')]);

  // Effect to invalidate queries when status changes
  useEffect(() => {
    if (searchParams.get('status')) {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applicationCounts'] });
    }
  }, [searchParams.get('status'), queryClient]);

  const { data: jobPositions } = useQuery<JobPosition[]>({
    queryKey: ['jobPositions'],
    queryFn: async () => {
      const response = await axios.get('/api/job-positions');
      return response.data;
    },
  });

  const { data, isLoading: dataLoading } = useQuery<{
    applications: Application[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }>({
    queryKey: ['applications', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.jobPosition) params.append('jobPosition', filters.jobPosition);
      if (filters.ageRange) params.append('ageRange', filters.ageRange);
      if (filters.wilaya) params.append('wilaya', filters.wilaya);
      if (filters.status) params.append('status', filters.status);
      params.append('page', filters.page.toString());
      params.append('limit', '10');

      const response = await axios.get('/api/admin/applications?' + params.toString());
      return response.data;
    },
  });

  const { data: applicationCounts } = useQuery({
    queryKey: ['applicationCounts'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/applications/counts');
      return response.data;
    },
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await axios.put(`/api/admin/applications?id=${id}`, { status: newStatus });

      // Update the local state immediately
      queryClient.setQueryData(['applications'], (oldData: Application[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((app) => (app.id === id ? response.data.application : app));
      });

      // Then invalidate to ensure consistency with server
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application status updated');
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handlePrint = () => {
    if (!selectedApplication) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Application Details - ${selectedApplication.candidate.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2563eb; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Application Details</h1>
          <div class="section">
            <p><span class="label">Candidate:</span> ${selectedApplication.candidate.name}</p>
            <p><span class="label">Email:</span> ${selectedApplication.candidate.email}</p>
            <p><span class="label">Job Position:</span> ${selectedApplication.jobPosition.name} - ${selectedApplication.jobPosition.ar_name}</p>
            <p><span class="label">Age:</span> ${calculateAge(selectedApplication.birthDate)} years</p>
            <p><span class="label">Wilaya:</span> ${wilayas.find((w) => w.id === selectedApplication.wilayaId)?.name || 'N/A'}</p>
            <p><span class="label">Status:</span> ${selectedApplication.status}</p>
            <p><span class="label">Last Updated:</span> ${format(new Date(selectedApplication.updatedAt), 'PPP')}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExport = (type: 'csv' | 'excel') => {
    if (!applications) return;

    const data = applications.map(app => {
      // Parse JSON strings if needed
      const parseIfString = (value: any) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      };

      const experience = parseIfString(app.experience) || [];
      const softSkills = parseIfString(app.softSkills) || [];
      const languages = parseIfString(app.languages) || [];
      const certifications = parseIfString(app.certifications) || [];

      // Base application data
      const baseData = {
        'First Name': app.firstName,
        'Last Name': app.lastName,
        'Email': app.candidate.email,
        'Mobile': app.mobile,
        'Birth Date': format(new Date(app.birthDate), 'PPP'),
        'Age': calculateAge(app.birthDate),
        'Birth Certificate Number': app.birthCertificateNumber,
        'Job Position': `${app.jobPosition.name} - ${app.jobPosition.ar_name}`,
        'Wilaya': wilayas.find(w => w.id === app.wilayaId)?.name || 'N/A',
        'Status': app.status,
        'Created At': format(new Date(app.createdAt), 'PPP'),
        'Last Updated': format(new Date(app.updatedAt), 'PPP'),
      };

      // Education data
      const educationData = app.educations.reduce((acc: Record<string, string>, edu, index) => ({
        ...acc,
        [`Education ${index + 1} - Degree`]: edu.degree,
        [`Education ${index + 1} - Field`]: edu.field,
        [`Education ${index + 1} - Institution`]: edu.institution,
        [`Education ${index + 1} - Start Date`]: format(new Date(edu.startDate), 'PPP'),
        [`Education ${index + 1} - End Date`]: edu.endDate ? format(new Date(edu.endDate), 'PPP') : 'Present',
        [`Education ${index + 1} - Grade`]: edu.grade || 'N/A',
      }), {});

      // Experience data
      const experienceData = Array.isArray(experience) ? experience.reduce((acc: Record<string, string>, exp: Experience, index: number) => ({
        ...acc,
        [`Experience ${index + 1} - Title`]: exp.title || '',
        [`Experience ${index + 1} - Company`]: exp.company || '',
        [`Experience ${index + 1} - Start Date`]: exp.startDate || '',
        [`Experience ${index + 1} - End Date`]: exp.endDate || 'Present',
        [`Experience ${index + 1} - Description`]: exp.description || '',
      }), {}) : {};

      // Skills and languages
      const skillsData = {
        'Soft Skills': Array.isArray(softSkills) ? softSkills.join(', ') : '',
        'Languages': Array.isArray(languages) ? languages.map(lang => `${lang.name || ''} (${lang.level || ''})`).join(', ') : '',
        'Certifications': Array.isArray(certifications) ? certifications.map(cert => cert.name || '').join(', ') : '',
      };

      // Combine all data
      return {
        ...baseData,
        ...educationData,
        ...experienceData,
        ...skillsData,
      };
    });

    if (type === 'csv') {
      const headers = Object.keys(data[0]).join(',');
      const csvData = data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      ).join('\n');
      const blob = new Blob([`${headers}\n${csvData}`], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const wb = utils.book_new();
      const ws = utils.json_to_sheet(data);
      utils.book_append_sheet(wb, ws, 'Applications');
      writeFile(wb, `applications-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    }

    toast.success(`Applications exported as ${type.toUpperCase()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('page', page.toString());
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDateRange = e.target.value;
    setFilters((prev) => ({ ...prev, dateRange: newDateRange }));
    setCurrentPage(1); // Reset to first page when filter changes
    
    // Update URL with new filter
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (newDateRange) {
      newSearchParams.set('dateRange', newDateRange);
    } else {
      newSearchParams.delete('dateRange');
    }
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    console.log('Changing filter:', filterName, 'to:', value);
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
    
    // Update URL with new filter
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newSearchParams.set(filterName, value);
    } else {
      newSearchParams.delete(filterName);
    }
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();
        
        // Add filters to query params
        if (filters.status) queryParams.set('status', filters.status);
        if (filters.wilaya) queryParams.set('wilaya', filters.wilaya);
        if (filters.jobPosition) queryParams.set('jobPosition', filters.jobPosition);
        if (filters.ageRange) queryParams.set('ageRange', filters.ageRange);
        if (filters.dateRange) queryParams.set('dateRange', filters.dateRange);
        
        // Add pagination params
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', itemsPerPage.toString());

        console.log('Fetching with params:', Object.fromEntries(queryParams.entries()));

        const response = await fetch(`/api/admin/applications?${queryParams.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setApplications(data.applications);
          setTotalPages(Math.ceil(data.total / itemsPerPage));
          setTotalItems(data.total);
        } else {
          console.error('Failed to fetch applications:', data.error);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/admin/applications/counts');
        const data = await response.json();
        if (response.ok) {
          setPendingCount(data.pending);
          setAcceptedCount(data.accepted);
          setReviewingCount(data.reviewing);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchApplications();
    fetchCounts();
  }, [currentPage, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWING':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ApplicationStats
        pendingCount={pendingCount}
        acceptedCount={acceptedCount}
        reviewingCount={reviewingCount}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {filters.status ? `${filters.status.charAt(0) + filters.status.slice(1).toLowerCase()} Applications` : 'All Applications'}
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiDownload className="mr-2 -ml-1 h-5 w-5" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiDownload className="mr-2 -ml-1 h-5 w-5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {/* Job Filter Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiBriefcase className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="text-sm font-medium text-gray-500">Job Position</div>
                <select
                  value={filters.jobPosition}
                  onChange={(e) => handleFilterChange('jobPosition', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Positions</option>
                  {jobPositions?.map((position) => (
                    <option key={position.id} value={position.id}>
                      {position.name} - {position.ar_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Age Filter Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCalendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="text-sm font-medium text-gray-500">Age Range</div>
                <select
                  value={filters.ageRange}
                  onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Any Age</option>
                  <option value="18-25">18-25 years</option>
                  <option value="26-30">26-30 years</option>
                  <option value="31-35">31-35 years</option>
                  <option value="36-40">36-40 years</option>
                  <option value="41+">41+ years</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Wilaya Filter Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiMapPin className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="text-sm font-medium text-gray-500">Wilaya</div>
                <select
                  value={filters.wilaya}
                  onChange={(e) => handleFilterChange('wilaya', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Wilayas</option>
                  {wilayas.map((wilaya) => (
                    <option key={wilaya.id} value={wilaya.id}>
                      {wilaya.name} - {wilaya.ar_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCalendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="text-sm font-medium text-gray-500">Date Range</div>
                <select
                  value={filters.dateRange}
                  onChange={handleDateRangeChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wilaya
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No applications found
                  </td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr
                    key={application.id}
                    onClick={() => setSelectedApplication(application)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.firstName} {application.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.jobPosition?.name} - {application.jobPosition?.ar_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {calculateAge(application.birthDate)} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {wilayas.find((w) => w.id === application.wilayaId)?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(application.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Application Details Modal */}
      <Dialog
        open={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        className="relative z-10"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative bg-white rounded-lg max-w-3xl w-full p-6">
            <button
              onClick={() => setSelectedApplication(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {selectedApplication && (
              <div className="space-y-4">
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  Application Details
                </Dialog.Title>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Candidate</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedApplication.candidate.name}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedApplication.candidate.email}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Job Position</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedApplication.jobPosition.name} -{' '}
                      {selectedApplication.jobPosition.ar_name}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Age</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {calculateAge(selectedApplication.birthDate)} years
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Wilaya</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {wilayas.find((w) => w.id === selectedApplication.wilayaId)?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.status}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FiPrinter className="mr-2 -ml-1 h-5 w-5" />
                    Print
                  </button>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
