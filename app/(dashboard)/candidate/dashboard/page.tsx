'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/auth';
import { useQuery } from '@tanstack/react-query';
import { FiUser, FiBriefcase, FiMail, FiPhone, FiCalendar, FiBook } from 'react-icons/fi';
import { format } from 'date-fns';

interface Skill {
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
  domain: string;
  specialization: string;
  jobPosition: {
    name: string;
    ar_name: string;
  };
  education: Array<{
    type: string;
    level?: string;
    institution: string;
    fieldOfStudy: string;
  }>;
  experience: string;
  languages: Array<Skill>;
  createdAt: string;
  updatedAt: string;
}

const fetchLatestApplication = async (candidateId: string): Promise<Application | null> => {
  const response = await fetch(`/api/applications?candidateId=${candidateId}`);
  if (!response.ok) throw new Error('Failed to fetch application');
  const data = await response.json();
  const application = data.applications[0];

  if (!application) return null;

  // Parse JSON strings into arrays
  return {
    ...application,
    languages: typeof application.languages === 'string'
      ? JSON.parse(application.languages)
      : application.languages || [],
    education: typeof application.education === 'string'
      ? JSON.parse(application.education)
      : application.education || [],
    experience: typeof application.experience === 'string'
      ? JSON.parse(application.experience)
      : application.experience || []
  };
};

interface ApplicationStatusCardProps {
  application: Application | null;
}

export function ApplicationStatusCard({ application }: ApplicationStatusCardProps) {
  if (!application) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Application Yet</h3>
        <p className="text-gray-500">Start your application process by clicking the button above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header with Name and Status */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiUser className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">
              {application.firstName} {application.lastName}
            </h3>
          </div>
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
            {application.status}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-4 space-y-4">
        {/* Job Position */}
        <div className="flex items-center space-x-3">
          <FiBriefcase className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">{application.jobPosition?.name || application.domain}</p>
            <p className="text-sm text-gray-500">{application.jobPosition?.ar_name || application.specialization}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center space-x-3">
            <FiMail className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600">{application.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <FiPhone className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600">{application.mobile}</span>
          </div>
        </div>

        {/* Last Modified */}
        <div className="flex items-center space-x-3">
          <FiCalendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-600">
            Last modified: {format(new Date(application.updatedAt), 'MMM dd, yyyy')}
          </span>
        </div>

        {/* Education & Experience Section */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <FiBook className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <h4 className="text-sm font-medium text-gray-900">Education & Experience</h4>
          </div>
          <div className="ml-8 text-sm text-gray-600">
            <p>
              {Array.isArray(application.education) ? application.education.length : 0} Education entries | {' '}
              {(() => {
                try {
                  if (Array.isArray(application.experience)) {
                    return application.experience.length;
                  }
                  if (typeof application.experience === 'string' && application.experience) {
                    return JSON.parse(application.experience).length;
                  }
                  return 0;
                } catch (error) {
                  console.error('Error parsing experience:', error);
                  return 0;
                }
              })()} Experience entries
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 rounded-b-lg">
        <button 
          onClick={() => window.location.href = `/candidate/applications/${application.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View Application Details
        </button>
      </div>
    </div>
  );
}

export default function CandidateDashboard() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  // Fetch latest application
  const { data: application, isLoading } = useQuery({
    queryKey: ['latest-application', user?.id],
    queryFn: () => fetchLatestApplication(user?.id as string),
    enabled: !!user?.id,
    retry: 1,
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  React.useEffect(() => {
    const checkAuth = () => {
      if (isHydrated) {
        setIsInitialLoad(false);
        if (!user) {
          router.replace('/candidate/login');
        }
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 100);
    return () => clearInterval(interval);
  }, [isHydrated, user, router]);

  if (isInitialLoad || !isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Initializing...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="mt-2 text-gray-600">
            {application
              ? 'Continue your application process below'
              : 'Start your application process today'}
          </p>
        </div>

        {/* Main Action Button */}
        <div className="mb-8">
          <button
            onClick={() =>
              router.push(
                application
                  ? `/candidate/applications/${application.id}/edit`
                  : '/candidate/application'
              )
            }
            className="w-full py-4 px-6 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transition-colors duration-200"
          >
            {application ? 'Edit Application' : 'Continue Application'}
          </button>
        </div>

        {/* Application Preview */}
        <ApplicationStatusCard application={application || null} />
      </div>
    </div>
  );
}
