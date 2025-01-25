import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { Application, Education, Prisma } from '@prisma/client';
import { uploadFile } from '@/app/lib/uploadFile';

interface RouteParams {
  params: {
    id: string;
  };
}

type ApplicationWithRelations = Application & {
  jobPosition: any;
  educations: Education[];
  candidate?: {
    name: string;
    email: string;
  };
};

// Type for transformed application with parsed JSON fields
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

interface EducationInput {
  type: string;
  level: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  description?: string | null;
}

// GET single application
export async function GET(request: NextRequest, { params }: RouteParams) {
  console.log('GET request received for application:', params.id);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));

  try {
    // First, check if the application exists without including relations
    const applicationExists = await db.application.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
      },
    });

    if (!applicationExists) {
      console.error('Application not found in database:', params.id);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    console.log('Application exists, fetching full details...');

    const application = (await db.application.findUnique({
      where: {
        id: params.id,
      },
      include: {
        candidate: {
          select: {
            name: true,
            email: true,
          },
        },
        jobPosition: true,
        educations: true,
      },
    })) as ApplicationWithRelations;

    if (!application) {
      console.error('Application not found:', params.id);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    console.log('Application found:', JSON.stringify(application, null, 2));

    // Transform JSON fields
    try {
      const transformedApplication: TransformedApplication = {
        ...application,
        experience: JSON.parse(application.experience || '[]'),
        certifications: JSON.parse(application.certifications || '[]'),
        softSkills: JSON.parse(application.softSkills || '[]'),
        languages: JSON.parse(application.languages || '[]'),
        certificates: application.certificates ? JSON.parse(application.certificates) : [],
      };

      console.log('Transformed application:', JSON.stringify(transformedApplication, null, 2));
      return NextResponse.json({ application: transformedApplication });
    } catch (parseError) {
      console.error('Error parsing JSON fields:', parseError);
      console.error('Raw application data:', application);
      return NextResponse.json({ error: 'Failed to parse application data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in GET handler:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

// UPDATE application
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('Updating application:', params.id);
    
    let data;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const jsonData = formData.get('data');
      if (!jsonData) {
        return NextResponse.json({ error: 'No data provided' }, { status: 400 });
      }
      data = JSON.parse(jsonData as string);
    } else {
      data = await request.json();
    }

    console.log('Received data:', data);

    // Check if application exists
    const existingApplication = await db.application.findUnique({
      where: { id: params.id },
      include: {
        jobPosition: true,
        educations: true,
      },
    });

    if (!existingApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Parse educations if it's a string
    let educationsData = [];
    try {
      if (typeof data.educations === 'string') {
        const parsed = JSON.parse(data.educations);
        educationsData = Array.isArray(parsed) ? parsed : [];
      } else if (Array.isArray(data.educations)) {
        educationsData = data.educations;
      }
    } catch (error) {
      console.error('Error parsing educations:', error);
    }

    // Prepare update data
    const updateData: Prisma.ApplicationUpdateInput = {
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      birthCertificateNumber: data.birthCertificateNumber,
      birthDate: new Date(data.birthDate),
      wilayaId: data.wilayaId,
      communeId: data.communeId,
      photo: data.photo,
      experience: typeof data.experience === 'string' ? data.experience : JSON.stringify(data.experience || []),
      certifications: typeof data.certifications === 'string' ? data.certifications : JSON.stringify(data.certifications || []),
      softSkills: typeof data.softSkills === 'string' ? data.softSkills : JSON.stringify(data.softSkills || []),
      languages: typeof data.languages === 'string' ? data.languages : JSON.stringify(data.languages || []),
      profileImage: data.profileImage,
      cv: data.cv,
      certificates: typeof data.certificates === 'string' ? data.certificates : JSON.stringify(data.certificates || []),
    };

    // Handle education updates
    if (educationsData.length > 0) {
      console.log('Updating educations:', educationsData);
      updateData.educations = {
        deleteMany: {},
        create: educationsData.map((edu: any) => ({
          type: edu.type || '',
          level: edu.level || '',
          institution: edu.institution || '',
          fieldOfStudy: edu.fieldOfStudy || '',
          startDate: new Date(edu.startDate),
          endDate: edu.endDate ? new Date(edu.endDate) : null,
          isActive: edu.isActive || false,
          description: edu.description || null,
        })),
      };
    } else {
      console.log('No educations to update');
      updateData.educations = {
        deleteMany: {},
        create: [],
      };
    }

    // Update application
    const updatedApplication = await db.application.update({
      where: { id: params.id },
      data: updateData,
      include: {
        jobPosition: true,
        educations: true,
      },
    });

    // Transform JSON fields for response
    const transformedApplication = {
      ...updatedApplication,
      experience: JSON.parse(updatedApplication.experience || '[]'),
      certifications: JSON.parse(updatedApplication.certifications || '[]'),
      softSkills: JSON.parse(updatedApplication.softSkills || '[]'),
      languages: JSON.parse(updatedApplication.languages || '[]'),
      certificates: updatedApplication.certificates ? JSON.parse(updatedApplication.certificates) : [],
    };

    console.log('Updated application:', transformedApplication);
    return NextResponse.json({ application: transformedApplication });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update application' },
      { status: 500 }
    );
  }
}
