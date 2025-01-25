import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

// Calculate profile completion percentage
function calculateProfileCompletion(profile: any): number {
  const fields = ['name', 'email', 'phone', 'address'];
  const completedFields = fields.filter((field) => !!profile[field]);
  return Math.round((completedFields.length / fields.length) * 100);
}

// GET profile
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const profile = await db.candidate.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Calculate profile completion
    const completionPercentage = calculateProfileCompletion(profile);

    return NextResponse.json({
      ...profile,
      completionPercentage,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// UPDATE profile
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const data = await request.json();

    // Validate the data
    if (data.name && data.name.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    if (data.phone && !/^\+?[\d\s-]{8,}$/.test(data.phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Update the profile
    const updatedProfile = await db.candidate.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
      },
    });

    // Calculate new completion percentage
    const completionPercentage = calculateProfileCompletion(updatedProfile);

    return NextResponse.json({
      ...updatedProfile,
      completionPercentage,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
