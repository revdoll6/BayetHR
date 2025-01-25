import { NextRequest, NextResponse } from 'next/server';
import { LoginCredentials, Role } from '../../../../lib/store/auth';
import { compare } from 'bcryptjs';
import { db } from '@/app/lib/db';

export async function POST(request: NextRequest, { params }: { params: { role: Role } }) {
  try {
    const { role } = params;
    const credentials: LoginCredentials = await request.json();

    // Find user by email
    const candidate = await db.candidate.findUnique({
      where: { email: credentials.email },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await compare(credentials.password, candidate.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if user is active
    if (candidate.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 401 });
    }

    // Return user data without sensitive information
    return NextResponse.json({
      user: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        role: role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
