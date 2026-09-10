import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' } },
        { status: 400 }
      );
    }

    const user = await loginUser(email, password);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid email or password.' } },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Something went wrong on our end — please try again.' } },
      { status: 500 }
    );
  }
}
