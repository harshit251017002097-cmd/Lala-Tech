import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    const db = getDb();
    const users = db.prepare(`
      SELECT id, full_name, email, role, avatar_color, created_at
      FROM users
      ORDER BY role DESC, full_name ASC
    `).all();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to retrieve users.' } },
      { status: 500 }
    );
  }
}
