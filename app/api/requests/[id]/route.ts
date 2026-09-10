import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRequestById, updateRequest, deleteRequest } from '@/lib/requests';
import { getDb } from '@/lib/db';
import { Comment, Clarification, ActivityLogEntry } from '@/lib/types';

export async function GET(
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

    const db = getDb();

    // Fetch comments
    const comments = db.prepare(`
      SELECT 
        c.*,
        u.full_name as user_name,
        u.role as user_role,
        u.avatar_color as user_color
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.request_id = ?
      ORDER BY c.created_at ASC
    `).all(requestItem.id) as unknown as Comment[];

    // Fetch clarifications
    const clarifications = db.prepare(`
      SELECT * FROM clarifications
      WHERE request_id = ?
      ORDER BY requested_at DESC
    `).all(requestItem.id) as unknown as Clarification[];

    // Fetch activity history
    const activity = db.prepare(`
      SELECT 
        a.*,
        u.full_name as user_name,
        u.role as user_role
      FROM activity_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.request_id = ?
      ORDER BY a.created_at DESC
    `).all(requestItem.id) as unknown as ActivityLogEntry[];

    return NextResponse.json({
      request: requestItem,
      comments,
      clarifications,
      activity,
    });
  } catch (error) {
    console.error('Get request details error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to retrieve request details.' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const current = getRequestById(id);
    if (!current) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Request could not be found.' } },
        { status: 404 }
      );
    }

    // Role check:
    // If employee: can only update status, comments, or own task fields
    if (user.role === 'employee' && current.assigned_to !== user.id && current.created_by !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You do not have permission to modify this request.' } },
        { status: 403 }
      );
    }

    const body = await req.json();

    // PRD v2 Rule: Moving to waiting_on_client requires a reason
    if (body.status === 'waiting_on_client' && (!body.client_waiting_reason || body.client_waiting_reason.trim() === '')) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'A reason is required when moving a request to Waiting on Client.' } },
        { status: 400 }
      );
    }

    const updated = updateRequest(current.id, user.id, body);
    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error('Update request error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to update request.' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (user.role !== 'manager') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Only managers can delete requests.' } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const success = deleteRequest(id, user.id);
    if (!success) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Request not found.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to delete request.' } },
      { status: 500 }
    );
  }
}
