import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { Application, Prisma, ApplicationStatus } from '@prisma/client';
import { startOfToday, endOfToday, startOfYesterday, endOfYesterday, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// Extended Application type to include JSON fields
interface ExtendedApplication extends Application {
  experience: string;
  certifications: string;
  softSkills: string;
  languages: string;
  certificates: string | null;
}

// Type for transformed application with parsed JSON
interface TransformedApplication
  extends Omit<
    ExtendedApplication,
    'experience' | 'certifications' | 'softSkills' | 'languages' | 'certificates'
  > {
  experience: any[];
  certifications: any[];
  softSkills: any[];
  languages: any[];
  certificates: any[];
}

interface ApplicationWithRelations extends Omit<Application, 'jobPosition'> {
  candidate: {
    email: string;
  };
  jobPosition: {
    id: string;
    name: string;
    ar_name: string;
  };
  educations: any[];
}

interface ApplicationWithJobPosition extends Omit<Application, 'jobPosition'> {
  jobPosition: {
    id: string;
    name: string;
    ar_name: string;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Log all received parameters
    console.log('Received parameters:', Object.fromEntries(searchParams.entries()));

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as ApplicationStatus | null;
    const wilaya = searchParams.get('wilaya');
    const jobPosition = searchParams.get('jobPosition');
    const ageRange = searchParams.get('ageRange');
    const dateRange = searchParams.get('dateRange');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ApplicationWhereInput = {};
    const AND: Prisma.ApplicationWhereInput[] = [];

    // Handle date range filter
    if (dateRange) {
      const now = new Date();
      let dateFilter: Prisma.DateTimeFilter = {};
      
      switch (dateRange) {
        case 'today':
          dateFilter = {
            gte: startOfToday(),
            lte: endOfToday(),
          };
          break;
        case 'yesterday':
          dateFilter = {
            gte: startOfYesterday(),
            lte: endOfYesterday(),
          };
          break;
        case 'last7days':
          dateFilter = {
            gte: subDays(now, 7),
            lte: now,
          };
          break;
        case 'last30days':
          dateFilter = {
            gte: subDays(now, 30),
            lte: now,
          };
          break;
        case 'thisMonth':
          dateFilter = {
            gte: startOfMonth(now),
            lte: endOfMonth(now),
          };
          break;
        case 'lastMonth':
          const lastMonth = subMonths(now, 1);
          dateFilter = {
            gte: startOfMonth(lastMonth),
            lte: endOfMonth(lastMonth),
          };
          break;
      }

      AND.push({ createdAt: dateFilter });
    }

    // Add status filter
    if (status) {
      AND.push({ status: status as ApplicationStatus });
    }

    // Add wilaya filter
    if (wilaya) {
      AND.push({ wilayaId: wilaya });
    }

    // Add job position filter
    if (jobPosition) {
      AND.push({ jobPositionId: jobPosition });
    }

    // Handle age range filter
    if (ageRange) {
      const [minAge, maxAge] = ageRange.split('-').map(Number);
      const today = new Date();
      
      if (maxAge) {
        // For ranges like "18-25"
        const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
        const minDate = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate());
        AND.push({
          birthDate: {
            lte: maxDate,
            gte: minDate,
          }
        });
      } else {
        // For "46+" range
        const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
        AND.push({
          birthDate: {
            lte: maxDate,
          }
        });
      }
    }

    // Combine all filters
    if (AND.length > 0) {
      where.AND = AND;
    }

    // Log the final query
    console.log('Final query:', {
      where: JSON.stringify(where, null, 2),
      skip,
      take: limit
    });

    // Get total count
    const total = await db.application.count({ where });

    // Get paginated applications
    const applications = await db.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        jobPosition: {
          select: {
            id: true,
            name: true,
            ar_name: true,
          },
        },
      },
    }) as ApplicationWithJobPosition[];

    // Log results
    console.log('Query results:', {
      totalFound: applications.length,
      totalCount: total,
      sampleApplication: applications[0] ? {
        id: applications[0].id,
        status: applications[0].status,
        jobPosition: applications[0].jobPosition.name,
        wilaya: applications[0].wilayaId,
        createdAt: applications[0].createdAt
      } : 'No applications found'
    });

    return NextResponse.json({
      applications,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Application ID and status are required' },
        { status: 400 }
      );
    }

    const updatedApplication = (await db.application.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        wilayaId: true,
        mobile: true,
        birthCertificateNumber: true,
        communeId: true,
        photo: true,
        experience: true,
        certifications: true,
        softSkills: true,
        languages: true,
        profileImage: true,
        cv: true,
        certificates: true,
        createdAt: true,
        updatedAt: true,
        candidate: {
          select: {
            email: true,
          },
        },
        jobPosition: true,
        educations: true,
      },
    })) as unknown as ExtendedApplication & {
      jobPosition: any;
      educations: any[];
      candidate: { email: string };
    };

    // Transform the data to handle JSON fields
    const transformedApplication = {
      ...updatedApplication,
      experience: JSON.parse(updatedApplication.experience),
      certifications: JSON.parse(updatedApplication.certifications),
      softSkills: JSON.parse(updatedApplication.softSkills),
      languages: JSON.parse(updatedApplication.languages),
      certificates: updatedApplication.certificates
        ? JSON.parse(updatedApplication.certificates)
        : [],
    } as TransformedApplication;

    return NextResponse.json({ application: transformedApplication });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

