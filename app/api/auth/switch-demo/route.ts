import { NextResponse } from 'next/server';
import { setDemoSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'User ID is required.' } },
        { status: 400 }
      );
    }

    const user = await setDemoSession(userId);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Switch demo error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to switch demo user.' } },
      { status: 500 }
    );
  }
}
