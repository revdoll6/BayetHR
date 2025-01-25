import fs from 'fs';
import path from 'path';

export type FileType = 'image' | 'document';

export interface UploadedFile {
  filename: string;
  url: string;
}

export async function uploadFile(
  file: File,
  type: FileType,
  applicationId: string
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('applicationId', applicationId);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  return response.json();
}
