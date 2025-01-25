'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type AuthState } from '@/app/lib/store/auth';
import { useQuery } from '@tanstack/react-query';

interface Skill {
  name: string;
  level: string;
}

interface Application {
  id: string;
  status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
  domain: string;
  specialization: string;
  education: string;
  experience: string;
  softSkills: string;
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
    languages:
      typeof application.languages === 'string'
        ? JSON.parse(application.languages)
        : application.languages || [],
  };
};

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
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  React.useEffect(() => {
    // Only run this effect once after initial mount
    const checkAuth = () => {
      if (isHydrated) {
        setIsInitialLoad(false);
        if (!user) {
          router.replace('/candidate/login');
        }
      }
    };

    // Check immediately
    checkAuth();

    // Set up an interval to check periodically
    const interval = setInterval(checkAuth, 100);

    // Clear interval on cleanup
    return () => clearInterval(interval);
  }, [isHydrated, user, router]);

  // Show loading state during initial load
  if (isInitialLoad || !isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Initializing...</div>
      </div>
    );
  }

  // Show redirect message when not authenticated
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
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Application Status</h2>
            {application && (
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  application.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : application.status === 'ACCEPTED'
                      ? 'bg-green-100 text-green-800'
                      : application.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {application?.status || 'NO APPLICATION'}
              </span>
            )}
          </div>

          {application ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Domain</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {application.domain} - {application.specialization}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Languages</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {application.languages?.map((language, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {language.name} - {language.level}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Education & Experience</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {application.education?.length} Education entries |{' '}
                  {application.experience?.length} Experience entries
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Application Yet</h3>
              <p className="text-gray-500">
                Start your application process by clicking the button above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
