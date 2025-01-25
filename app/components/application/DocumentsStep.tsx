import React from 'react';
import Image from 'next/image';
import { uploadFile } from '@/app/lib/uploadFile';

interface DocumentsStepProps {
  formData: {
    profileImage: string | null;
    cv: string | null;
    certificates: string[];
  };
  onUpdate: (
    data: Partial<{
      profileImage: string | null;
      cv: string | null;
      certificates: string[];
    }>
  ) => void;
  applicationId: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_DOC_TYPES = ['application/pdf'];

export function DocumentsStep({ formData, onUpdate, applicationId }: DocumentsStepProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const validateFile = (file: File, type: 'image' | 'document'): boolean => {
    setError(null);

    if (file.size > MAX_FILE_SIZE) {
      setError('File size should not exceed 5MB');
      return false;
    }

    const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOC_TYPES;
    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleFileUpload = async (file: File, type: 'profileImage' | 'cv' | 'certificates') => {
    try {
      if (!validateFile(file, type === 'profileImage' ? 'image' : 'document')) {
        return;
      }

      setIsUploading(true);
      setError(null);

      const uploadedFile = await uploadFile(
        file,
        type === 'profileImage' ? 'image' : 'document',
        applicationId
      );

      if (type === 'certificates') {
        onUpdate({
          certificates: [...(formData.certificates || []), uploadedFile.url],
        });
      } else {
        onUpdate({
          [type]: uploadedFile.url,
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (type: 'profileImage' | 'cv' | 'certificates', index?: number) => {
    if (type === 'certificates' && typeof index === 'number') {
      onUpdate({
        certificates: formData.certificates.filter((_, i) => i !== index),
      });
    } else {
      onUpdate({
        [type]: null,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Documents</h2>
        <p className="text-gray-600 mb-6">
          Please upload your profile image, CV, and any relevant certificates.
        </p>
      </div>

      {/* Profile Image */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Image</h3>
        <div className="flex items-center space-x-4">
          {formData.profileImage ? (
            <div className="relative">
              <Image
                src={formData.profileImage}
                alt="Profile"
                width={128}
                height={128}
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemove('profileImage')}
                className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg">
              <label className="cursor-pointer text-center p-4">
                <span className="text-sm text-gray-600">Upload Image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, 'profileImage');
                    }
                  }}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* CV Upload */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">CV/Resume</h3>
        <div className="flex items-center space-x-4">
          {formData.cv ? (
            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-600">CV uploaded</span>
              <button
                type="button"
                onClick={() => handleRemove('cv')}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <span>Upload CV</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, 'cv');
                    }
                  }}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Certificates */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Certificates</h3>
        <div className="space-y-4">
          <div>
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <span>Add Certificate</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, 'certificates');
                  }
                }}
              />
            </label>
          </div>

          {formData.certificates.map((certificate, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
            >
              <span className="text-sm text-gray-600">Certificate {index + 1}</span>
              <button
                type="button"
                onClick={() => handleRemove('certificates', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Uploading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
