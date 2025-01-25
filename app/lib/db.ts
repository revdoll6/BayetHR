import { PrismaClient } from '.prisma/client';
import { initUploadDirectories } from './initUploadDirs';

declare global {
  var prisma: any | undefined;
}

const prisma =
  global.prisma ||
  // @ts-ignore
  new (require('@prisma/client').PrismaClient)({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Initialize database and upload directories
Promise.all([
  // Test database connection
  prisma.$connect()
    .then(() => {
      console.log('Successfully connected to the database');
    })
    .catch((error: Error) => {
      console.error('Failed to connect to the database:', error);
      process.exit(1);
    }),
  
  // Initialize upload directories
  initUploadDirectories()
]);

export const db = prisma;
