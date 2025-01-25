import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';

// GET - Fetch all admins
export async function GET() {
  try {
    const admins = await db.admin.findMany();

    return NextResponse.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

// POST - Create new admin
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'RH' && role !== 'DRH') {
      return NextResponse.json(
        { error: 'Invalid role. Must be either RH or DRH' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingAdmin = await db.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new admin with role validation
    const adminData: Prisma.AdminCreateInput = {
      name,
      email,
      password: hashedPassword,
      status: 'ACTIVE',
      role: role === 'RH' ? 'RH' : 'DRH',
    };

    console.log('Creating admin with data:', { ...adminData, password: '[REDACTED]' });

    const newAdmin = await db.admin.create({
      data: adminData,
    });

    console.log('Admin created successfully:', { ...newAdmin, password: '[REDACTED]' });
    return NextResponse.json(newAdmin);
  } catch (error) {
    console.error('Detailed error creating admin:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Database error: ${error.code} - ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create admin: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT - Update admin status
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const body = await request.json();
    const { status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Admin ID and status are required' }, { status: 400 });
    }

    const updatedAdmin = await db.admin.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}
