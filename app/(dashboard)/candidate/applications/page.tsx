'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/auth';
import { ApplicationCard } from '@/app/components/application/ApplicationCard';

interface Application {
  id: string;
  status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  updatedAt: string;
  jobPosition: {
    name: string;
    ar_name: string;
  };
  educations: Array<{
    type: string;
    level?: string;
    institution: string;
    fieldOfStudy: string;
  }>;
  experience: string;
}

export default function ApplicationsList() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/applications?candidateId=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch applications');
        const data = await response.json();
        // Get the first (and should be only) application
        const applicationData = data.applications?.[0] || null;
        console.log('Application data:', applicationData); // Debug log
        setApplication(applicationData);
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [user]);

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
        <h3 className="text-lg font-medium text-gray-900 mb-4">No Application Found</h3>
        <p className="text-gray-600 mb-6">You haven't submitted an application yet.</p>
        <button
          onClick={() => router.push('/candidate/application')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Application
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">My Application</h1>
        <button
          onClick={() => router.push(`/candidate/applications/${application.id}/edit`)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit Application
        </button>
      </div>

      <div className="grid gap-6">
        <ApplicationCard
          key={application.id}
          application={application}
        />
      </div>
    </div>
  );
}
