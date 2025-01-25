import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const applicationId = formData.get('applicationId') as string;

    if (!file || !type || !applicationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (type === 'image' && !['jpg', 'jpeg', 'png'].includes(extension || '')) {
      return NextResponse.json(
        { error: 'Invalid image format. Only JPG and PNG are allowed.' },
        { status: 400 }
      );
    }
    if (type === 'document' && extension !== 'pdf') {
      return NextResponse.json(
        { error: 'Invalid document format. Only PDF is allowed.' },
        { status: 400 }
      );
    }

    // Create unique filename
    const uniqueFilename = `${applicationId}-${Date.now()}.${extension}`;

    // Determine upload directory path
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'applications', type === 'image' ? 'images' : 'documents');
    const filePath = join(uploadDir, uniqueFilename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create directory if it doesn't exist
    await writeFile(filePath, buffer);

    // Return the URL path
    const urlPath = `/uploads/applications/${type === 'image' ? 'images' : 'documents'}/${uniqueFilename}`;

    return NextResponse.json({ 
      filename: uniqueFilename,
      url: urlPath 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 