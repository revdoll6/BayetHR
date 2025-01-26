import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { Application, Education, Prisma } from '@prisma/client';

type ApplicationWithRelations = Application & {
  jobPosition: any;
  educations: Education[];
  candidate?: {
    name: string;
    email: string;
  };
};

// Type for transformed application with parsed JSON
interface TransformedApplication
  extends Omit<
    ApplicationWithRelations,
    'experience' | 'certifications' | 'softSkills' | 'languages' | 'certificates'
  > {
  experience: any[];
  certifications: any[];
  softSkills: any[];
  languages: any[];
  certificates: any[];
}

export async function GET(request: NextRequest) {
  console.log('GET /api/applications - Start');
  try {
    const searchParams = request.nextUrl.searchParams;
    const candidateId = searchParams.get('candidateId');
    console.log('Candidate ID:', candidateId);

    if (!candidateId) {
      console.error('No candidateId provided');
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    // Check if candidate exists
    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      console.error('Candidate not found:', candidateId);
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    console.log('Fetching applications for candidate:', candidateId);
    const applications = await db.application.findMany({
      where: { candidateId },
      include: {
        jobPosition: true,
        educations: true,
        candidate: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Found applications:', applications.length);

    // Transform JSON fields
    const transformedApplications = applications.map((app: Application) => ({
      ...app,
      experience: JSON.parse(app.experience || '[]'),
      certifications: JSON.parse(app.certifications || '[]'),
      softSkills: JSON.parse(app.softSkills || '[]'),
      languages: JSON.parse(app.languages || '[]'),
      certificates: app.certificates ? JSON.parse(app.certificates) : [],
    })) as unknown as TransformedApplication[];

    console.log('GET /api/applications - Success');
    return NextResponse.json({ applications: transformedApplications });
  } catch (error) {
    console.error('GET /api/applications - Error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Received application data:', data);

    // Validate required fields
    const requiredFields = [
      'candidateId',
      'jobPositionId',
      'firstName',
      'lastName',
      'mobile',
      'birthCertificateNumber',
      'birthDate',
      'wilayaId',
      'communeId',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Check if user already has a pending application
    const existingApplication = await db.application.findFirst({
      where: {
        candidateId: data.candidateId,
        status: 'PENDING',
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          error:
            'You already have a pending application. Please wait for the current application to be processed.',
        },
        { status: 400 }
      );
    }

    // Format education data
    const formattedEducations = data.educations?.map((edu: any) => ({
      type: edu.type,
      level: edu.level,
      institution: edu.institution,
      fieldOfStudy: edu.fieldOfStudy,
      startDate: new Date(edu.startDate),
      endDate: edu.endDate ? new Date(edu.endDate) : null,
      isActive: edu.isActive,
      description: edu.description || null,
    }));

    // Create the application with all fields
    const createData: Prisma.ApplicationCreateInput = {
      candidate: { connect: { id: data.candidateId } },
      jobPosition: { connect: { id: data.jobPositionId } },
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      birthCertificateNumber: data.birthCertificateNumber,
      birthDate: new Date(data.birthDate),
      wilayaId: data.wilayaId,
      communeId: data.communeId,
      status: 'PENDING',
      photo: data.photo || null,
      experience: JSON.stringify(data.experience || []),
      certifications: JSON.stringify(data.certifications || []),
      softSkills: JSON.stringify(data.softSkills || []),
      languages: JSON.stringify(data.languages || []),
      profileImage: data.profileImage || null,
      cv: data.cv || null,
      certificates: JSON.stringify(data.certificates || []),
      educations: formattedEducations?.length
        ? {
            create: formattedEducations,
          }
        : undefined,
    };

    const application = await db.application.create({
      data: createData,
      include: {
        jobPosition: true,
        educations: true,
      },
    });

    // Transform JSON fields for response
    const transformedApplication = {
      ...application,
      experience: JSON.parse(application.experience || '[]'),
      certifications: JSON.parse(application.certifications || '[]'),
      softSkills: JSON.parse(application.softSkills || '[]'),
      languages: JSON.parse(application.languages || '[]'),
      certificates: application.certificates ? JSON.parse(application.certificates) : [],
    };

    console.log('Created application:', transformedApplication);
    return NextResponse.json({ application: transformedApplication });
  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit application' },
      { status: 500 }
    );
  }
}
