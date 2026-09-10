import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRequestById, logActivity, sendNotification } from '@/lib/requests';
import { getDb } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const requestItem = getRequestById(id);
    if (!requestItem) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Request could not be found.' } },
        { status: 404 }
      );
    }

    const { body } = await req.json();
    if (!body || body.trim() === '') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Comment text cannot be empty.' } },
        { status: 400 }
      );
    }

    const db = getDb();
    const commentId = 'cmt_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO comments (id, request_id, user_id, body, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(commentId, requestItem.id, user.id, body.trim(), now);

    // Log activity
    logActivity(
      requestItem.id,
      user.id,
      'comment_added',
      `${user.full_name} commented on ${requestItem.display_id}: "${body.trim().substring(0, 60)}${body.length > 60 ? '...' : ''}"`
    );

    // Notify the other party (creator or assignee, excluding self)
    const recipientId = user.id === requestItem.assigned_to ? requestItem.created_by : requestItem.assigned_to;
    if (recipientId && recipientId !== user.id) {
      sendNotification(
        recipientId,
        requestItem.id,
        'comment_added',
        `${user.full_name} commented on ${requestItem.display_id}: ${requestItem.title}`
      );
    }

    const newComment = db.prepare(`
      SELECT 
        c.*,
        u.full_name as user_name,
        u.role as user_role,
        u.avatar_color as user_color
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(commentId);

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to post comment.' } },
      { status: 500 }
    );
  }
}
