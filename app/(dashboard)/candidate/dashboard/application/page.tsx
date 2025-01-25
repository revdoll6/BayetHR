'use client';

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/app/lib/store/auth';
import { DomainStep } from '@/app/components/application/DomainStep';

// Step schemas
const domainSchema = z.object({
  domain: z.string().min(1, 'Please select a domain'),
  specialization: z.string().min(1, 'Please select a specialization'),
});

const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
});

const educationSchema = z.object({
  education: z
    .array(
      z.object({
        degree: z.string().min(1, 'Degree is required'),
        institution: z.string().min(1, 'Institution is required'),
        year: z.string().min(1, 'Year is required'),
      })
    )
    .min(1, 'At least one education entry is required'),
  experience: z.array(
    z.object({
      position: z.string().min(1, 'Position is required'),
      company: z.string().min(1, 'Company is required'),
      duration: z.string().min(1, 'Duration is required'),
    })
  ),
});

const skillsSchema = z.object({
  technicalSkills: z.array(z.string()).min(1, 'At least one technical skill is required'),
  softSkills: z.array(z.string()).min(1, 'At least one soft skill is required'),
  languages: z
    .array(
      z.object({
        language: z.string().min(1, 'Language is required'),
        level: z.string().min(1, 'Proficiency level is required'),
      })
    )
    .min(1, 'At least one language is required'),
});

const documentsSchema = z.object({
  profileImage: z.any(),
  cv: z.any(),
  certificates: z.array(z.any()),
});

// Combined schema for all steps
const applicationSchema = z.object({
  domain: z.string().min(1, 'Please select a domain'),
  specialization: z.string().min(1, 'Please select a specialization'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  education: z
    .array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.string(),
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        position: z.string(),
        company: z.string(),
        duration: z.string(),
      })
    )
    .optional(),
  technicalSkills: z.array(z.string()).optional(),
  softSkills: z.array(z.string()).optional(),
  languages: z
    .array(
      z.object({
        language: z.string(),
        level: z.string(),
      })
    )
    .optional(),
  profileImage: z.any().optional(),
  cv: z.any().optional(),
  certificates: z.array(z.any()).optional(),
});

type ApplicationData = z.infer<typeof applicationSchema>;

export default function ApplicationForm() {
  const [step, setStep] = React.useState(1);
  const { user } = useAuthStore();

  const methods = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      education: [],
      experience: [],
      technicalSkills: [],
      softSkills: [],
      languages: [],
      certificates: [],
    },
  });

  const onSubmit = (data: ApplicationData) => {
    console.log(data);
    // TODO: Submit to backend
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <DomainStep />;
      case 2:
        return <h2>Personal Information</h2>;
      case 3:
        return <h2>Education & Experience</h2>;
      case 4:
        return <h2>Skills</h2>;
      case 5:
        return <h2>Documents</h2>;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Application Form</h1>
          <p className="text-gray-600">Step {step} of 5</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        {/* Step Content */}
        <div className="mt-6">{renderStep()}</div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type={step === 5 ? 'submit' : 'button'}
            onClick={() => step < 5 && setStep((prev) => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {step === 5 ? 'Submit' : 'Next'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
