import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { LoginCredentials } from '@/app/lib/store/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as LoginCredentials;

    // Find the user
    const user = await prisma.candidate.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    // Create the response
    const response = NextResponse.json({ user: userWithoutPassword });

    // Set the user cookie
    cookies().set('user', JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
