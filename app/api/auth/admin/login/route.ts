import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { db } from '@/app/lib/db';
import { LoginCredentials } from '@/app/lib/store/auth';
import type { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const credentials: LoginCredentials = await request.json();

    // Input validation
    if (!credentials.email || !credentials.password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find admin by email
    const admin = await (db as any).admin.findUnique({
      where: { email: credentials.email },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await compare(credentials.password, admin.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check admin status
    if (admin.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          error:
            admin.status === 'PENDING'
              ? 'Your account is pending approval'
              : 'Your account has been deactivated',
        },
        { status: 403 }
      );
    }

    // Return admin data without sensitive information
    const { password: _, ...adminWithoutPassword } = admin;

    return NextResponse.json({
      user: {
        ...adminWithoutPassword,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
