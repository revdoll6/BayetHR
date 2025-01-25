import { NextRequest, NextResponse } from 'next/server';
import { SignupCredentials, Role } from '../../../../lib/store/auth';
import { hash } from 'bcryptjs';
import { db } from '@/app/lib/db';

export async function POST(request: NextRequest, { params }: { params: { role: Role } }) {
  try {
    const { role } = params;
    const credentials: SignupCredentials = await request.json();

    // Validate password match
    if (credentials.password !== credentials.confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.candidate.findUnique({
      where: { email: credentials.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hash(credentials.password, 12);

    // Create new candidate
    const newCandidate = await db.candidate.create({
      data: {
        name: credentials.name,
        email: credentials.email,
        password: hashedPassword,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
