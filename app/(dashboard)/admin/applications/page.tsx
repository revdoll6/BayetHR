'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns/format';
import { Dialog } from '@headlessui/react';
import { FiPrinter, FiBriefcase, FiMapPin, FiCalendar } from 'react-icons/fi';
import { wilayas } from '@/app/data/wilayas';

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
}

interface JobPosition {
  id: string;
  name: string;
  ar_name: string;
}

interface Filters {
  jobPositionId: string;
  ageRange: string;
  wilayaId: string;
}

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Filters>({
    jobPositionId: '',
    ageRange: '',
    wilayaId: '',
  });
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const { data: jobPositions } = useQuery<JobPosition[]>({
    queryKey: ['jobPositions'],
    queryFn: async () => {
      const response = await axios.get('/api/job-positions');
      return response.data;
    },
  });

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ['applications', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.jobPositionId) params.append('jobPositionId', filters.jobPositionId);
      if (filters.ageRange) params.append('ageRange', filters.ageRange);
      if (filters.wilayaId) params.append('wilayaId', filters.wilayaId);

      const response = await axios.get('/api/admin/applications?' + params.toString());
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>

      {/* Filters Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
                  value={filters.jobPositionId}
                  onChange={(e) => setFilters({ ...filters, jobPositionId: e.target.value })}
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
                  onChange={(e) => setFilters({ ...filters, ageRange: e.target.value })}
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
                  value={filters.wilayaId}
                  onChange={(e) => setFilters({ ...filters, wilayaId: e.target.value })}
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
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications?.map((application) => (
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={application.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(application.id, e.target.value);
                    }}
                    className={`text-sm font-medium rounded-full px-3 py-1
                      ${application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${application.status === 'REVIEWING' ? 'bg-blue-100 text-blue-800' : ''}
                      ${application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : ''}
                      ${application.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
                    `}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWING">Reviewing</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
