import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const requestId = searchParams.get('requestId');

    const db = getDb();
    let query = `
      SELECT 
        a.*,
        u.full_name as user_name,
        u.role as user_role,
        r.display_id,
        r.title as request_title
      FROM activity_log a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN requests r ON a.request_id = r.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (requestId) {
      conditions.push('a.request_id = ?');
      params.push(requestId);
    }

    // If employee and not filtering specific permitted request, optionally scope to their assigned/created requests
    if (user.role === 'employee' && !requestId) {
      conditions.push('(r.assigned_to = ? OR r.created_by = ?)');
      params.push(user.id, user.id);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY a.created_at DESC LIMIT ?`;
    params.push(limit);

    const activities = db.prepare(query).all(...params);
    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Fetch activity error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to retrieve activity log.' } },
      { status: 500 }
    );
  }
}
