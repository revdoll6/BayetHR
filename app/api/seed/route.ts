import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Create test candidate
    const hashedPassword = await bcrypt.hash('password123', 10);
    const candidate = await db.candidate.create({
      data: {
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: hashedPassword,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({ 
      message: 'Test candidate created successfully',
      candidate 
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
} 