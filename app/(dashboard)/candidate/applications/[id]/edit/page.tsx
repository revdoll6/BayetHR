'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DomainStep } from '@/app/components/application/DomainStep';
import { PersonalInfoStep } from '@/app/components/application/PersonalInfoStep';
import { EducationStep } from '@/app/components/application/EducationStep';
import { SkillsStep } from '@/app/components/application/SkillsStep';
import { DocumentsStep } from '@/app/components/application/DocumentsStep';
import toast from 'react-hot-toast';

type EducationType = 'universitaire' | 'formation-professionnelle' | 'formation';
type UniversityLevel = 'Licence' | 'Master' | 'Doctorat';

interface Education {
  id?: string;
  type: EducationType;
  level?: UniversityLevel;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  description?: string;
}

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  description: string;
}

interface Skill {
  name: string;
  level: 'Basic' | 'Intermediate' | 'Fluent' | 'Expert';
}

interface Language {
  name: string;
  level: 'Basic' | 'Intermediate' | 'Fluent' | 'Native';
}

interface ApplicationData {
  jobPositionId: string;
  firstName: string;
  lastName: string;
  mobile: string;
  birthCertificateNumber: string;
  birthDate: string;
  wilayaId: string;
  communeId: string;
  photo: string | null;
  educations: Education[];
  experience: Experience[];
  certifications: Certification[];
  softSkills: Skill[];
  languages: Language[];
  profileImage: string | null;
  cv: string | null;
  certificates: string[];
}

interface StringifiedApplicationData {
  jobPositionId: string;
  firstName: string;
  lastName: string;
  mobile: string;
  birthCertificateNumber: string;
  birthDate: string;
  wilayaId: string;
  communeId: string;
  photo: string | null;
  educations: string;
  experience: string;
  certifications: string;
  softSkills: string;
  languages: string;
  profileImage: string | null;
  cv: string | null;
  certificates: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

// Fetch application data
const fetchApplication = async (id: string): Promise<ApplicationData> => {
  console.log('Fetching application with ID:', id);
  try {
    const response = await fetch(`/api/applications/${id}`);
    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch application');
    }

    const data = await response.json();
    console.log('Raw response data:', data);

    if (!data.application) {
      console.error('No application data in response');
      throw new Error('No application data found');
    }

    // Parse JSON strings into arrays/objects
    const parsedData = {
      ...data.application,
      educations: Array.isArray(data.application.educations) ? data.application.educations : [],
      experience: Array.isArray(data.application.experience) ? data.application.experience : [],
      certifications: Array.isArray(data.application.certifications)
        ? data.application.certifications
        : [],
      softSkills: Array.isArray(data.application.softSkills) ? data.application.softSkills : [],
      languages: Array.isArray(data.application.languages) ? data.application.languages : [],
      certificates: Array.isArray(data.application.certificates)
        ? data.application.certificates
        : [],
    };

    console.log('Parsed application data:', parsedData);
    return parsedData;
  } catch (error) {
    console.error('Error in fetchApplication:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

// Update application data
async function updateApplication({ id, data }: { id: string; data: StringifiedApplicationData }) {
  const response = await fetch(`/api/applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update application');
  }

  return response.json();
}

export default function EditApplication({ params }: PageProps) {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [currentStep, setCurrentStep] = React.useState(0);

  console.log('Page params:', params);
  console.log('User:', user);

  const [formData, setFormData] = React.useState<ApplicationData>({
    jobPositionId: '',
    firstName: '',
    lastName: '',
    mobile: '',
    birthCertificateNumber: '',
    birthDate: '',
    wilayaId: '',
    communeId: '',
    photo: null,
    educations: [],
    experience: [],
    certifications: [],
    softSkills: [],
    languages: [],
    profileImage: null,
    cv: null,
    certificates: [],
  });

  // Fetch application data
  const {
    data: application,
    isLoading: isLoadingApplication,
    error: applicationError,
  } = useQuery({
    queryKey: ['application', params.id],
    queryFn: () => {
      console.log('Fetching application with ID:', params.id);
      return fetchApplication(params.id);
    },
    enabled: !!params.id && !!user?.id,
    retry: 1,
    staleTime: 0,
  });

  // Update form data when application is loaded
  React.useEffect(() => {
    console.log('Application data received:', application);
    if (application) {
      try {
        // Parse JSON strings into objects/arrays
        const parsedData = {
          ...application,
          educations: Array.isArray(application.educations) ? application.educations : [],
          experience: Array.isArray(application.experience) ? application.experience : [],
          certifications: Array.isArray(application.certifications)
            ? application.certifications
            : [],
          softSkills: Array.isArray(application.softSkills) ? application.softSkills : [],
          languages: Array.isArray(application.languages) ? application.languages : [],
          certificates: Array.isArray(application.certificates) ? application.certificates : [],
        };
        console.log('Parsed application data:', parsedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error parsing application data:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
          console.error('Error stack:', error.stack);
        }
      }
    }
  }, [application]);

  // Update application mutation
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', params.id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application updated successfully');
      router.push('/candidate/applications');
    },
    onError: (error) => {
      toast.error('Failed to update application');
      console.error('Update error:', error);
    },
  });

  // Handle loading and error states
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Checking authentication...</div>
      </div>
    );
  }

  if (!user) {
    router.replace('/candidate/login');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Redirecting to login...</div>
      </div>
    );
  }

  if (isLoadingApplication) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading application data...</div>
      </div>
    );
  }

  if (applicationError) {
    console.error('Application error:', applicationError);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">Failed to load application</div>
        <pre className="text-sm text-gray-600 mb-4">
          {JSON.stringify(applicationError, null, 2)}
        </pre>
        <button
          onClick={() => router.push('/candidate/applications')}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Return to Applications
        </button>
      </div>
    );
  }

  const handleUpdateStep = (stepData: Partial<ApplicationData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  const handleSubmit = async () => {
    // Convert arrays/objects to JSON strings before sending
    const dataToSend = {
      ...formData,
      educations: JSON.stringify(formData.educations),
      experience: JSON.stringify(formData.experience),
      certifications: JSON.stringify(formData.certifications),
      softSkills: JSON.stringify(formData.softSkills),
      languages: JSON.stringify(formData.languages),
      certificates: JSON.stringify(formData.certificates),
    };
    mutation.mutate({ id: params.id, data: dataToSend });
  };

  const steps = [
    {
      title: 'Domain',
      component: <DomainStep formData={formData} onUpdate={handleUpdateStep} />,
    },
    {
      title: 'Personal Info',
      component: <PersonalInfoStep formData={formData} onUpdate={handleUpdateStep} />,
    },
    {
      title: 'Education & Experience',
      component: <EducationStep formData={formData} onUpdate={handleUpdateStep} />,
    },
    {
      title: 'Skills',
      component: <SkillsStep formData={formData} onUpdate={handleUpdateStep} />,
    },
    {
      title: 'Documents',
      component: <DocumentsStep formData={formData} onUpdate={handleUpdateStep} />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Application</h1>
          <p className="mt-2 text-gray-600">Update your application information below</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <button
                key={step.title}
                onClick={() => setCurrentStep(index)}
                className={`flex-1 text-center py-2 border-b-2 ${
                  currentStep === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-gray-200 text-gray-500 hover:text-gray-700'
                }`}
              >
                {step.title}
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">{steps[currentStep].component}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Updating...' : 'Save Changes'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
