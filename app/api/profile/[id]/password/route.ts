import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { compare, hash } from 'bcryptjs';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const data = await request.json();
    const { currentPassword, newPassword } = data;

    // Validate password requirements
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await db.candidate.findUnique({
      where: {
        id: params.id,
      },
      select: {
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await compare(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update password
    await db.candidate.update({
      where: {
        id: params.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
