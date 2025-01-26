'use client';

import { FiUser, FiBriefcase, FiMail, FiPhone, FiCalendar, FiBook } from 'react-icons/fi';
import { format } from 'date-fns';

interface ApplicationCardProps {
  application: {
    firstName: string;
    lastName: string;
    jobPosition: {
      name: string;
      ar_name: string;
    };
    candidate?: {
      email: string;
    };
    mobile: string;
    updatedAt: string;
    educations: Array<{
      type: string;
      level?: string;
      institution: string;
      fieldOfStudy: string;
    }>;
    experience: string; // JSON string of experience array
  };
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  // Parse experience JSON string
  let experiences = [];
  try {
    experiences = JSON.parse(application.experience || '[]');
  } catch (error) {
    console.error('Error parsing experience:', error);
  }

  // Get email from either candidate object or direct property
  const email = application.candidate?.email || '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header with Status */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiUser className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">
              {application.firstName} {application.lastName}
            </h3>
          </div>
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
            PENDING
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-4 space-y-4">
        {/* Job Position */}
        <div className="flex items-center space-x-3">
          <FiBriefcase className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">{application.jobPosition.name}</p>
            <p className="text-sm text-gray-500">{application.jobPosition.ar_name}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
          {email && (
            <div className="flex items-center space-x-3">
              <FiMail className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600">{email}</span>
            </div>
          )}
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
          
          {/* Education */}
          {application.educations && application.educations.length > 0 ? (
            <div className="ml-8 space-y-2">
              {application.educations.map((education, index) => (
                <div key={index} className="text-sm">
                  <p className="text-gray-900 font-medium">
                    {education.level ? `${education.type} - ${education.level}` : education.type}
                  </p>
                  <p className="text-gray-600">
                    {education.fieldOfStudy} at {education.institution}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="ml-8 text-sm text-gray-500">No education information provided</p>
          )}

          {/* Experience */}
          {experiences.length > 0 ? (
            <div className="mt-3 ml-8 space-y-2">
              {experiences.map((exp: any, index: number) => (
                <div key={index} className="text-sm">
                  <p className="text-gray-900 font-medium">{exp.title}</p>
                  <p className="text-gray-600">{exp.company}</p>
                  {exp.description && <p className="text-gray-500 text-sm">{exp.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 ml-8 text-sm text-gray-500">No experience information provided</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 rounded-b-lg">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
          View Application Details
        </button>
      </div>
    </div>
  );
} 