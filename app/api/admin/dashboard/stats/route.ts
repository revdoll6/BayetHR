import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

interface ApplicationWithDetails {
  id: string;
  status: string;
  createdAt: Date;
  candidate: {
    name: string;
    email: string;
  };
  jobPosition: {
    name: string;
    ar_name: string;
  };
  mobile: string;
}

export async function GET() {
  try {
    // Get total applications count
    const totalApplications = await db.application.count();

    // Get applications by status
    const pendingApplications = await db.application.count({
      where: { status: 'PENDING' },
    });

    const acceptedApplications = await db.application.count({
      where: { status: 'ACCEPTED' },
    });

    const rejectedApplications = await db.application.count({
      where: { status: 'REJECTED' },
    });

    // Get total admins count
    const totalAdmins = await db.admin.count();

    // Get recent applications with job position info
    const recentApplications = await db.application.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        mobile: true,
        status: true,
        createdAt: true,
        candidate: {
          select: {
            email: true,
          },
        },
        jobPosition: {
          select: {
            name: true,
            ar_name: true,
          },
        },
      },
    });

    // Transform the applications data
    const transformedApplications = recentApplications.map((app) => ({
      id: app.id,
      candidateName: `${app.firstName} ${app.lastName}`,
      mobile: app.mobile,
      email: app.candidate.email,
      domain: app.jobPosition.name,
      status: app.status,
      createdAt: app.createdAt.toISOString(),
    }));

    return NextResponse.json({
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      totalAdmins,
      recentApplications: transformedApplications,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
