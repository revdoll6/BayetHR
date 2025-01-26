import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { Application, Candidate, JobPosition } from '@prisma/client';

interface ExtendedApplication extends Application {
  candidate: Pick<Candidate, 'email' | 'name'>;
  jobPosition: JobPosition;
}

export async function GET() {
  try {
    const [
      totalApplications,
      pendingApplications,
      acceptedApplications,
      reviewingApplications,
      totalAdmins,
      recentApplications,
    ] = await Promise.all([
      db.application.count(),
      db.application.count({
        where: { status: 'PENDING' },
      }),
      db.application.count({
        where: { status: 'ACCEPTED' },
      }),
      db.application.count({
        where: { status: 'REVIEWING' },
      }),
      db.admin.count(),
      db.application.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          candidate: {
            select: {
              email: true,
              name: true,
            },
          },
          jobPosition: true,
        },
      }),
    ]);

    // Transform recent applications to match the expected format
    const transformedRecentApplications = (recentApplications as ExtendedApplication[]).map(app => ({
      id: app.id,
      candidateName: app.candidate.name || `${app.firstName} ${app.lastName}`,
      mobile: app.mobile,
      email: app.candidate.email,
      domain: app.jobPosition.name,
      status: app.status,
      createdAt: app.createdAt.toISOString(),
    }));

    const response = {
      totalApplications,
      pendingApplications,
      acceptedApplications,
      reviewingApplications,
      totalAdmins,
      recentApplications: transformedRecentApplications,
    };

    console.log('Dashboard stats:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 