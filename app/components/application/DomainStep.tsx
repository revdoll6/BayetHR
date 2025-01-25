'use client';

import React from 'react';
import { useJobPositions } from '@/app/hooks/useJobPositions';

interface JobPosition {
  id: string;
  name: string;
  ar_name: string;
}

interface DomainStepProps {
  formData: {
    jobPositionId: string;
  };
  onUpdate: (data: Partial<{ jobPositionId: string }>) => void;
}

export function DomainStep({ formData, onUpdate }: DomainStepProps) {
  const { data: jobPositions, isLoading } = useJobPositions();

  console.log('DomainStep render:', {
    formData,
    jobPositions,
    isLoading,
  });

  const handleChange = (value: string) => {
    console.log('Selected job position:', value);
    onUpdate({ jobPositionId: value });
  };

  if (isLoading) {
    console.log('DomainStep: Loading...');
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!jobPositions || jobPositions.length === 0) {
    console.log('DomainStep: No job positions available');
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No job positions available.</p>
      </div>
    );
  }

  console.log('DomainStep: Rendering job positions:', jobPositions);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Poste Demandé</h2>
        <p className="text-gray-600 mb-6">
          Veuillez sélectionner le poste pour lequel vous souhaitez postuler.
        </p>

        <div className="relative">
          <select
            value={formData.jobPositionId || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="block w-full px-4 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg appearance-none bg-white border shadow-sm"
          >
            <option value="" disabled>
              Sélectionnez un Poste
            </option>
            {jobPositions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name} - {position.ar_name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {formData.jobPositionId && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Position sélectionnée:{' '}
              {jobPositions.find((p) => p.id === formData.jobPositionId)?.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
