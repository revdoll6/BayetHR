import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { Application, Prisma } from '@prisma/client';

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobPositionId = searchParams.get('jobPositionId');
    const ageRange = searchParams.get('ageRange');
    const wilayaId = searchParams.get('wilayaId');

    const where: Prisma.ApplicationWhereInput = {};

    // Filter by job position
    if (jobPositionId) {
      where.jobPositionId = jobPositionId;
    }

    // Filter by wilaya
    if (wilayaId) {
      where.wilayaId = wilayaId;
    }

    // Filter by age range
    if (ageRange) {
      const [minAge, maxAge] = ageRange.split('-').map(Number);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate());
      const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());

      where.birthDate = {
        gte: minDate,
        lt: maxDate,
      };
    }

    const applications = (await db.application.findMany({
      where,
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
      orderBy: {
        updatedAt: 'desc',
      },
    })) as unknown as (ExtendedApplication & {
      jobPosition: any;
      educations: any[];
      candidate: { email: string };
    })[];

    // Transform the data to handle JSON fields
    const transformedApplications = applications.map((app) => ({
      ...app,
      experience: JSON.parse(app.experience),
      certifications: JSON.parse(app.certifications),
      softSkills: JSON.parse(app.softSkills),
      languages: JSON.parse(app.languages),
      certificates: app.certificates ? JSON.parse(app.certificates) : [],
    })) as TransformedApplication[];

    return NextResponse.json(transformedApplications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
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
