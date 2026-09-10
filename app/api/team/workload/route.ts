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

    if (user.role !== 'manager') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Only managers can access team workload.' } },
        { status: 403 }
      );
    }

    const db = getDb();
    const team = db.prepare(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.avatar_color,
        SUM(CASE WHEN r.status IN ('new', 'ready_to_assign', 'in_progress') THEN 1 ELSE 0 END) as internal_active,
        SUM(CASE WHEN r.status IN ('waiting_on_client', 'needs_clarification') THEN 1 ELSE 0 END) as waiting_client,
        SUM(CASE WHEN r.status != 'done' AND r.status IS NOT NULL THEN 1 ELSE 0 END) as total_active,
        SUM(CASE 
          WHEN r.due_date IS NOT NULL 
            AND datetime(r.due_date) < datetime('now') 
            AND r.status IN ('new', 'ready_to_assign', 'in_progress')
          THEN 1 ELSE 0 END) as overdue_count,
        SUM(CASE WHEN r.status = 'done' THEN 1 ELSE 0 END) as completed_count
      FROM users u
      LEFT JOIN requests r ON u.id = r.assigned_to
      GROUP BY u.id
      ORDER BY overdue_count DESC, total_active DESC
    `).all();

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Team workload error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to retrieve team workload.' } },
      { status: 500 }
    );
  }
}
