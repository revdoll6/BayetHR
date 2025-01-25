import { mkdir } from 'fs/promises';
import { join } from 'path';

export async function initUploadDirectories() {
  const baseDir = join(process.cwd(), 'public', 'uploads', 'applications');
  
  try {
    // Create image uploads directory
    await mkdir(join(baseDir, 'images'), { recursive: true });
    
    // Create document uploads directory
    await mkdir(join(baseDir, 'documents'), { recursive: true });
    
    console.log('Upload directories initialized successfully');
  } catch (error) {
    console.error('Error initializing upload directories:', error);
  }
} 