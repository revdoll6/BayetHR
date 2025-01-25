'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/auth';

// Step components
import { DomainStep } from '@/app/components/application/DomainStep';
import { PersonalInfoStep } from '@/app/components/application/PersonalInfoStep';
import { EducationStep } from '@/app/components/application/EducationStep';
import { SkillsStep } from '@/app/components/application/SkillsStep';
import { DocumentsStep } from '@/app/components/application/DocumentsStep';

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

interface FormData {
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

export default function ApplicationForm() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasExistingApplication, setHasExistingApplication] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({
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

  const steps = [
    { id: 1, title: 'Domain Selection', component: DomainStep },
    { id: 2, title: 'Personal Information', component: PersonalInfoStep },
    { id: 3, title: 'Education & Experience', component: EducationStep },
    { id: 4, title: 'Skills', component: SkillsStep },
    { 
      id: 5, 
      title: 'Documents', 
      component: ({ formData, onUpdate }: any) => (
        <DocumentsStep 
          formData={formData} 
          onUpdate={onUpdate} 
          applicationId={user?.id || ''} 
        />
      )
    },
  ];

  // Check for existing application
  React.useEffect(() => {
    const checkExistingApplication = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/applications?candidateId=${user.id}`);
          if (!response.ok) throw new Error('Failed to check application status');
          const data = await response.json();
          if (data.applications && data.applications.length > 0) {
            setHasExistingApplication(true);
            router.replace('/candidate/applications');
          }
        } catch (error) {
          console.error('Error checking application status:', error);
        }
      }
    };

    checkExistingApplication();
  }, [user, router]);

  // Protect the route
  React.useEffect(() => {
    if (isHydrated && !user) {
      router.replace('/candidate/login');
    }
  }, [isHydrated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Upload photo first if it exists
      let photoUrl = null;
      if (formData.photo) {
        const photoFormData = new FormData();
        photoFormData.append('file', dataURLtoFile(formData.photo, 'photo.jpg'));
        photoFormData.append('type', 'images');
        photoFormData.append('applicationId', user?.id || '');
        
        const photoRes = await fetch('/api/upload', {
          method: 'POST',
          body: photoFormData,
        });
        
        if (!photoRes.ok) {
          throw new Error('Failed to upload photo');
        }
        
        const photoData = await photoRes.json();
        photoUrl = photoData.url;
      }

      // Submit application with photo URL instead of base64 data
      const applicationData = {
        ...formData,
        photo: photoUrl,
        candidateId: user?.id,
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!res.ok) {
        throw new Error('Failed to submit application');
      }

      router.push('/candidate/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to convert data URL to File object
  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // If we're on the last step, submit the form
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleUpdateFormData = (stepData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  // Show loading state while checking authentication
  if (!isHydrated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show message if user already has an application
  if (hasExistingApplication) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            You already have an active application
          </h2>
          <p className="text-gray-600 mb-4">
            Please wait for your current application to be processed before submitting a new one.
          </p>
          <button
            onClick={() => router.push('/candidate/applications')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Your Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-sm font-medium ${
                  step.id === currentStep
                    ? 'text-blue-600'
                    : step.id < currentStep
                      ? 'text-green-600'
                      : 'text-gray-500'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Current step */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <CurrentStepComponent formData={formData} onUpdate={handleUpdateFormData} />
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {currentStep === steps.length ? (isSubmitting ? 'Submitting...' : 'Submit') : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
