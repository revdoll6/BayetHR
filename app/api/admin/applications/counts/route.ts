import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function GET() {
  try {
    const [pending, reviewing, accepted] = await Promise.all([
      db.application.count({
        where: { status: 'PENDING' },
      }),
      db.application.count({
        where: { status: 'REVIEWING' },
      }),
      db.application.count({
        where: { status: 'ACCEPTED' },
      }),
    ]);

    return NextResponse.json({
      pending,
      reviewing,
      accepted,
    });
  } catch (error) {
    console.error('Error fetching application counts:', error);
    return NextResponse.json({ error: 'Failed to fetch application counts' }, { status: 500 });
  }
} 