import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

// GET /api/job-positions
export async function GET() {
  try {
    console.log('Fetching job positions...');
    const jobPositions = await db.jobPosition.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    console.log('Found job positions:', JSON.stringify(jobPositions, null, 2));
    return NextResponse.json(jobPositions);
  } catch (error) {
    console.error('Error fetching job positions:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to fetch job positions' }, { status: 500 });
  }
}

// POST /api/job-positions
export async function POST(request: NextRequest) {
  try {
    // Get user from cookie
    const userCookie = request.cookies.get('user');
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, ar_name } = await request.json();

    if (!name || !ar_name) {
      return NextResponse.json({ error: 'Name and Arabic name are required' }, { status: 400 });
    }

    // Check if position already exists
    const existingPosition = await db.jobPosition.findFirst({
      where: {
        OR: [{ name }, { ar_name }],
      },
    });

    if (existingPosition) {
      return NextResponse.json(
        { error: 'A job position with this name already exists' },
        { status: 400 }
      );
    }

    const jobPosition = await db.jobPosition.create({
      data: {
        name,
        ar_name,
      },
    });

    return NextResponse.json(jobPosition);
  } catch (error) {
    console.error('Error creating job position:', error);
    return NextResponse.json({ error: 'Failed to create job position' }, { status: 500 });
  }
}

// DELETE /api/job-positions?id={id}
export async function DELETE(request: NextRequest) {
  try {
    // Get user from cookie
    const userCookie = request.cookies.get('user');
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Job position ID is required' }, { status: 400 });
    }

    // Check if position exists
    const existingPosition = await db.jobPosition.findUnique({
      where: { id },
    });

    if (!existingPosition) {
      return NextResponse.json({ error: 'Job position not found' }, { status: 404 });
    }

    await db.jobPosition.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job position:', error);
    return NextResponse.json({ error: 'Failed to delete job position' }, { status: 500 });
  }
}
