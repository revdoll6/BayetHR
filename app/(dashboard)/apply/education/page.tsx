'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronRight } from 'react-icons/fi';

interface EducationOption {
  id: string;
  title: string;
  subOptions?: string[];
}

const educationOptions: EducationOption[] = [
  {
    id: 'universitaire',
    title: 'Universitaire',
    subOptions: ['Licence', 'Master', 'Doctorat'],
  },
  {
    id: 'formation-professionnelle',
    title: 'Formation Professionnelle',
  },
  {
    id: 'formation',
    title: 'Formation',
  },
];

export default function EducationPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedSubOption, setSelectedSubOption] = useState<string | null>(null);

  const handleOptionSelect = (optionId: string) => {
    if (selectedOption === optionId) {
      setSelectedOption(null);
      setSelectedSubOption(null);
    } else {
      setSelectedOption(optionId);
      setSelectedSubOption(null);
    }
  };

  const handleSubOptionSelect = (subOption: string) => {
    setSelectedSubOption(subOption);
  };

  const handleNext = () => {
    // Save the selected options and navigate to the next step
    const educationData = {
      type: selectedOption,
      level: selectedSubOption,
    };
    // Save to local storage or state management
    localStorage.setItem('educationData', JSON.stringify(educationData));
    router.push('/apply/experience');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Education</h1>

      <div className="grid gap-6 mb-8">
        {educationOptions.map((option) => (
          <div key={option.id} className="space-y-4">
            <div
              onClick={() => handleOptionSelect(option.id)}
              className={`bg-white rounded-lg shadow-sm border p-6 cursor-pointer transition-colors
                ${selectedOption === option.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-200'}
              `}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{option.title}</h3>
                <FiChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform
                    ${selectedOption === option.id ? 'transform rotate-90' : ''}
                  `}
                />
              </div>
            </div>

            {/* Sub-options for Universitaire */}
            {selectedOption === option.id && option.subOptions && (
              <div className="ml-8 grid gap-4">
                {option.subOptions.map((subOption) => (
                  <div
                    key={subOption}
                    onClick={() => handleSubOptionSelect(subOption)}
                    className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-colors
                      ${selectedSubOption === subOption ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-200'}
                    `}
                  >
                    <h4 className="text-md text-gray-900">{subOption}</h4>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Form fields for the selected option */}
      {selectedOption && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter institution name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Field of Study</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your field of study"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Brief description of your studies and achievements"
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => router.back()}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedOption || (selectedOption === 'universitaire' && !selectedSubOption)}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
