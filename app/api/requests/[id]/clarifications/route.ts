import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRequestById, logActivity } from '@/lib/requests';
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

    const body = await req.json();
    const { action, clarificationId, missingInformation, requestedFrom, notes, resumeStatus } = body;
    const db = getDb();
    const now = new Date().toISOString();

    if (action === 'resolve') {
      if (!clarificationId) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Clarification ID is required to resolve.' } },
          { status: 400 }
        );
      }

      db.prepare(`
        UPDATE clarifications 
        SET resolved_at = ?, notes = coalesce(?, notes)
        WHERE id = ? AND request_id = ?
      `).run(now, notes || 'Client provided required information.', clarificationId, requestItem.id);

      // Move request status to ready_to_assign or in_progress
      const targetStatus = resumeStatus || (requestItem.assigned_to ? 'in_progress' : 'ready_to_assign');
      db.prepare(`
        UPDATE requests 
        SET status = ?, client_waiting_reason = NULL, waiting_since = NULL, updated_at = ?
        WHERE id = ?
      `).run(targetStatus, now, requestItem.id);

      logActivity(
        requestItem.id,
        user.id,
        'clarification_resolved',
        `${user.full_name} resolved clarification for ${requestItem.display_id}. Status moved to ${targetStatus}.`,
        { targetStatus }
      );

      return NextResponse.json({ success: true, newStatus: targetStatus });
    }

    // Creating new clarification
    if (!missingInformation || missingInformation.trim() === '') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Please specify what information is missing from the client.' } },
        { status: 400 }
      );
    }

    const clrId = 'clr_' + Math.random().toString(36).substring(2, 10);
    const fromContact = requestedFrom || requestItem.client_name || 'Client';

    db.prepare(`
      INSERT INTO clarifications (id, request_id, missing_information, requested_at, requested_from, resolved_at, notes)
      VALUES (?, ?, ?, ?, ?, NULL, ?)
    `).run(clrId, requestItem.id, missingInformation.trim(), now, fromContact, notes || null);

    // Update request state to 'needs_clarification' and set waiting_since
    db.prepare(`
      UPDATE requests 
      SET status = 'needs_clarification', client_waiting_reason = ?, waiting_since = ?, updated_at = ?
      WHERE id = ?
    `).run(`Clarification pending: ${missingInformation.trim()}`, now, now, requestItem.id);

    logActivity(
      requestItem.id,
      user.id,
      'clarification_requested',
      `${user.full_name} requested clarification from ${fromContact}: "${missingInformation.trim().substring(0, 60)}"`,
      { missing: missingInformation.trim() }
    );

    return NextResponse.json({ success: true, clarificationId: clrId }, { status: 201 });
  } catch (error) {
    console.error('Clarification error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to process clarification.' } },
      { status: 500 }
    );
  }
}
