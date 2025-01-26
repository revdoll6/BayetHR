'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/auth';
import { FiUser, FiBriefcase, FiMail, FiPhone, FiCalendar, FiBook, FiDownload, FiGlobe } from 'react-icons/fi';
import { format, isValid } from 'date-fns';

interface Education {
  type: string;
  level?: string;
  institution: string;
  fieldOfStudy: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  isCurrentRole?: boolean;
}

interface Language {
  name: string;
  level: string;
}

interface Application {
  id: string;
  status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  dateOfBirth?: string;
  address?: string;
  wilaya?: string;
  jobPosition: {
    name: string;
    ar_name: string;
  };
  educations: Education[];
  experience: string;
  languages: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/applications/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch application');
        const data = await response.json();
        if (data.application) {
          setApplication(data.application);
        } else {
          throw new Error('No application data found');
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        router.push('/candidate/applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [user, params.id, router]);

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/applications/${params.id}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `application-${application?.firstName}-${application?.lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMMM dd, yyyy') : null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Application Not Found</h3>
        <button
          onClick={() => router.push('/candidate/applications')}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Details</h1>
          <p className="text-sm text-gray-500">
            Created on {formatDate(application.createdAt) || 'N/A'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              application.status === 'REVIEWING' ? 'bg-blue-100 text-blue-800' :
              application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'}`}
          >
            {application.status}
          </span>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiDownload className="mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Personal Information */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <FiUser className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-sm text-gray-900">{application.firstName} {application.lastName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiMail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{application.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiPhone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{application.mobile}</p>
              </div>
            </div>
            {application.dateOfBirth && formatDate(application.dateOfBirth) && (
              <div className="flex items-center space-x-3">
                <FiCalendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(application.dateOfBirth)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Position */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Position Details</h2>
          <div className="flex items-center space-x-3">
            <FiBriefcase className="h-5 w-5 text-gray-400" />
            <div>
              {application.jobPosition ? (
                <>
                  <p className="text-sm font-medium text-gray-900">{application.jobPosition.name}</p>
                  <p className="text-sm text-gray-500">{application.jobPosition.ar_name}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Position information not available</p>
              )}
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Languages</h2>
          <div className="flex items-start space-x-3">
            <FiGlobe className="h-5 w-5 text-gray-400 mt-1" />
            <div className="flex flex-wrap gap-2">
              {application.languages && typeof application.languages === 'string' ? (
                JSON.parse(application.languages).map((language: { name: string; level: string }, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    {language.name} - {language.level}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No languages specified</span>
              )}
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Experience</h2>
          <div className="space-y-6">
            {application.experience && typeof application.experience === 'string' ? (
              JSON.parse(application.experience).map((experience: {
                title: string;
                company: string;
                location?: string;
                startDate?: string;
                endDate?: string;
                description?: string;
                isCurrentRole?: boolean;
              }, index: number) => (
                <div key={index} className="ml-8">
                  <h3 className="text-sm font-medium text-gray-900">{experience.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{experience.company}</p>
                  {experience.location && (
                    <p className="text-sm text-gray-500">{experience.location}</p>
                  )}
                  {experience.startDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(experience.startDate)?.replace('MMMM', 'MMM')} - {
                        experience.isCurrentRole 
                          ? 'Present'
                          : experience.endDate 
                            ? formatDate(experience.endDate)?.replace('MMMM', 'MMM')
                            : 'Present'
                      }
                    </p>
                  )}
                  {experience.description && (
                    <p className="text-sm text-gray-500 mt-2">{experience.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No experience records found</div>
            )}
          </div>
        </div>

        {/* Education */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Education</h2>
          <div className="space-y-6">
            {application.educations && Array.isArray(application.educations) ? (
              application.educations.map((education, index) => (
                <div key={index} className="ml-8">
                  <h3 className="text-sm font-medium text-gray-900">
                    {education.type} {education.level && `- ${education.level}`}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {education.fieldOfStudy} at {education.institution}
                  </p>
                  {education.startDate && education.endDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(education.startDate)?.replace('MMMM', 'MMM')} - {formatDate(education.endDate)?.replace('MMMM', 'MMM')}
                    </p>
                  )}
                  {education.description && (
                    <p className="text-sm text-gray-500 mt-1">{education.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No education records found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 