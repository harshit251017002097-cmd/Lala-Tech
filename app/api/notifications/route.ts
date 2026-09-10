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
    const notifications = db.prepare(`
      SELECT 
        n.*,
        r.display_id,
        r.title as request_title
      FROM notifications n
      LEFT JOIN requests r ON n.request_id = r.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `).all(user.id);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as c FROM notifications
      WHERE user_id = ? AND is_read = 0
    `).get(user.id) as { c: number };

    return NextResponse.json({
      notifications,
      unreadCount: unreadCount.c,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to retrieve notifications.' } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { notificationId, markAll } = body;
    const db = getDb();

    if (markAll) {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(user.id);
    } else if (notificationId) {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(notificationId, user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to update notifications.' } },
      { status: 500 }
    );
  }
}
