'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/auth';
import { useQuery } from '@tanstack/react-query';
import { FiEdit2 } from 'react-icons/fi';

interface Application {
  id: string;
  status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
  domain: string;
  specialization: string;
  createdAt: string;
  updatedAt: string;
}

const fetchApplications = async (candidateId: string) => {
  console.log('Fetching applications for candidate:', candidateId);
  try {
    const response = await fetch(`/api/applications?candidateId=${candidateId}`);
    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch applications');
    }

    const data = await response.json();
    console.log('Applications data:', data);
    return data.applications;
  } catch (error) {
    console.error('Error fetching applications:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

export default function ApplicationsList() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  console.log('Current user:', user);

  // Use React Query for data fetching
  const {
    data: applications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: () => fetchApplications(user?.id as string),
    enabled: !!user?.id, // Only fetch when we have a user ID
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Protect the route
  React.useEffect(() => {
    if (isHydrated && !user) {
      router.replace('/candidate/login');
    }
  }, [isHydrated, user, router]);

  const getStatusColor = (status: Application['status']) => {
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

  const handleEditApplication = (applicationId: string) => {
    router.push(`/candidate/applications/${applicationId}/edit`);
  };

  if (!isHydrated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    console.error('Applications error:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">Failed to load applications</div>
        <pre className="text-sm text-gray-600 mb-4">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading applications...</div>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 mb-4">No applications found</div>
        <button
          onClick={() => router.push('/candidate/dashboard/application')}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Create New Application
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        </div>

        <div className="space-y-4">
          {applications.map((application: Application) => (
            <div
              key={application.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{application.domain}</h3>
                  <p className="text-sm text-gray-500">{application.specialization}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {application.status}
                  </span>
                  <button
                    onClick={() => handleEditApplication(application.id)}
                    disabled={
                      application.status === 'ACCEPTED' || application.status === 'REJECTED'
                    }
                    title={
                      application.status === 'ACCEPTED' || application.status === 'REJECTED'
                        ? "Can't edit applications that are accepted or rejected"
                        : 'Edit your application'
                    }
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                      ${
                        application.status === 'ACCEPTED' || application.status === 'REJECTED'
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'text-white bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    <FiEdit2 className="w-4 h-4 mr-1.5" />
                    Edit Application
                  </button>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Applied on: {new Date(application.createdAt).toLocaleDateString()}
                {application.updatedAt !== application.createdAt && (
                  <span className="ml-4">
                    Last updated: {new Date(application.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
