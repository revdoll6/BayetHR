import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicationId, educations } = body;

    // Validate request
    if (!applicationId || !educations || !Array.isArray(educations)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Delete existing education entries for this application
    await db.education.deleteMany({
      where: { applicationId },
    });

    // Create new education entries
    const createdEducations = await db.education.createMany({
      data: educations.map((edu: any) => ({
        applicationId,
        type: edu.type,
        level: edu.level,
        institution: edu.institution,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: new Date(edu.startDate),
        endDate: edu.endDate ? new Date(edu.endDate) : null,
        isActive: edu.isActive || false,
        description: edu.description,
      })),
    });

    return NextResponse.json({
      message: 'Education data saved successfully',
      count: createdEducations.count,
    });
  } catch (error) {
    console.error('Error saving education data:', error);
    return NextResponse.json({ error: 'Failed to save education data' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const educations = await db.education.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(educations);
  } catch (error) {
    console.error('Error fetching education data:', error);
    return NextResponse.json({ error: 'Failed to fetch education data' }, { status: 500 });
  }
}
