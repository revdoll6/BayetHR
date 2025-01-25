'use client';

import React from 'react';

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

interface EducationStepProps {
  formData: {
    educations: Education[];
  };
  onUpdate: (data: { educations: Education[] }) => void;
}

const maxEducationEntries = {
  universitaire: 3,
  'formation-professionnelle': 2,
  formation: 5,
};

export function EducationStep({ formData, onUpdate }: EducationStepProps) {
  const [selectedType, setSelectedType] = React.useState<EducationType | null>(null);
  const [selectedLevel, setSelectedLevel] = React.useState<UniversityLevel | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [currentEducation, setCurrentEducation] = React.useState<Partial<Education>>({
    isActive: false,
  });

  const handleAddEducation = () => {
    setError(null);

    // Validate required fields
    if (
      !selectedType ||
      !currentEducation.institution ||
      !currentEducation.fieldOfStudy ||
      !currentEducation.startDate
    ) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate university level if type is 'universitaire'
    if (selectedType === 'universitaire' && !selectedLevel) {
      setError('Please select a university level');
      return;
    }

    // Check maximum entries for the selected type
    const typeEntries = (formData.educations || []).filter((edu) => edu.type === selectedType);
    const maxAllowed = maxEducationEntries[selectedType];
    if (typeEntries.length >= maxAllowed) {
      setError(`You can only add up to ${maxAllowed} ${selectedType} entries`);
      return;
    }

    const newEducation: Education = {
      type: selectedType,
      level: selectedType === 'universitaire' ? selectedLevel! : undefined,
      institution: currentEducation.institution!,
      fieldOfStudy: currentEducation.fieldOfStudy!,
      startDate: currentEducation.startDate!,
      endDate: currentEducation.endDate,
      isActive: currentEducation.isActive || false,
      description: currentEducation.description,
    };

    onUpdate({
      educations: [...(formData.educations || []), newEducation],
    });

    // Reset form
    setCurrentEducation({ isActive: false });
    setSelectedLevel(null);
  };

  const handleRemoveEducation = (index: number) => {
    if (!formData.educations) return;
    onUpdate({
      educations: formData.educations.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Education</h3>
        <p className="mt-1 text-sm text-gray-500">Add your educational background</p>
      </div>

      {/* Education Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={selectedType || ''}
          onChange={(e) => setSelectedType(e.target.value as EducationType)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select type</option>
          <option value="universitaire">Universitaire</option>
          <option value="formation-professionnelle">Formation Professionnelle</option>
          <option value="formation">Formation</option>
        </select>
      </div>

      {/* University Level Selection (only for universitaire) */}
      {selectedType === 'universitaire' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Level</label>
          <select
            value={selectedLevel || ''}
            onChange={(e) => setSelectedLevel(e.target.value as UniversityLevel)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select level</option>
            <option value="Licence">Licence</option>
            <option value="Master">Master</option>
            <option value="Doctorat">Doctorat</option>
          </select>
        </div>
      )}

      {/* Education Details Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Institution</label>
          <input
            type="text"
            value={currentEducation.institution || ''}
            onChange={(e) =>
              setCurrentEducation((prev) => ({ ...prev, institution: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Field of Study</label>
          <input
            type="text"
            value={currentEducation.fieldOfStudy || ''}
            onChange={(e) =>
              setCurrentEducation((prev) => ({ ...prev, fieldOfStudy: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={currentEducation.startDate || ''}
              onChange={(e) =>
                setCurrentEducation((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={currentEducation.endDate || ''}
              onChange={(e) =>
                setCurrentEducation((prev) => ({ ...prev, endDate: e.target.value }))
              }
              disabled={currentEducation.isActive}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={currentEducation.isActive || false}
              onChange={(e) =>
                setCurrentEducation((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">Currently studying here</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={currentEducation.description || ''}
            onChange={(e) =>
              setCurrentEducation((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleAddEducation}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Education
        </button>
      </div>

      {/* Education List */}
      <div className="space-y-4">
        {formData.educations?.map((education, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{education.institution}</h4>
                <p className="text-sm text-gray-600">{education.fieldOfStudy}</p>
                <p className="text-sm text-gray-500">
                  {education.startDate} - {education.isActive ? 'Present' : education.endDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveEducation(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
