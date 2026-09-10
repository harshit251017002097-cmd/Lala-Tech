import { getDb } from './db';
import { RequestItem, RequestStatus, Priority, RequestCategory, RequestSource, DashboardSummary } from './types';

// Helper to calculate if a request is genuinely overdue
export function isRequestOverdue(req: { due_date: string | null; status: string }): boolean {
  if (!req.due_date) return false;
  // STRICT PRD v2 RULE: A request Waiting on Client or Done is NEVER overdue!
  if (req.status === 'waiting_on_client' || req.status === 'done') return false;
  return new Date(req.due_date).getTime() < Date.now();
}

export function logActivity(
  requestId: string | null,
  userId: string | null,
  actionType: string,
  description: string,
  metadata?: Record<string, any>
) {
  const db = getDb();
  const id = 'act_' + Math.random().toString(36).substring(2, 10);
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO activity_log (id, request_id, user_id, action_type, description, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, requestId, userId, actionType, description, metadata ? JSON.stringify(metadata) : null, now);
}

export function sendNotification(
  userId: string,
  requestId: string | null,
  type: string,
  message: string
) {
  const db = getDb();
  const id = 'notif_' + Math.random().toString(36).substring(2, 10);
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO notifications (id, user_id, request_id, type, message, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(id, userId, requestId, type, message, now);
}

export interface RequestFilterParams {
  queue?: 'waiting_for_us' | 'waiting_for_client' | 'unassigned' | 'overdue' | 'done';
  status?: string;
  priority?: string;
  category?: string;
  clientId?: string;
  assignedTo?: string; // 'self' or specific user ID or 'unassigned'
  search?: string;
  sort?: 'due_date_asc' | 'due_date_desc' | 'created_desc' | 'priority';
}

export function getRequests(filters: RequestFilterParams = {}): RequestItem[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: any[] = [];

  // Queue-based filtering (PRD v2 Core Queues)
  if (filters.queue === 'waiting_for_us') {
    conditions.push("r.status IN ('new', 'ready_to_assign', 'in_progress')");
  } else if (filters.queue === 'waiting_for_client') {
    conditions.push("r.status IN ('waiting_on_client', 'needs_clarification')");
  } else if (filters.queue === 'unassigned') {
    conditions.push("r.assigned_to IS NULL AND r.status != 'done'");
  } else if (filters.queue === 'overdue') {
    // Strictly exclude waiting_on_client and done
    conditions.push("r.due_date IS NOT NULL AND datetime(r.due_date) < datetime('now') AND r.status IN ('new', 'ready_to_assign', 'in_progress')");
  } else if (filters.queue === 'done') {
    conditions.push("r.status = 'done'");
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    conditions.push("r.status = ?");
    params.push(filters.status);
  }

  // Priority filter
  if (filters.priority && filters.priority !== 'all') {
    conditions.push("r.priority = ?");
    params.push(filters.priority);
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    conditions.push("r.category = ?");
    params.push(filters.category);
  }

  // Client filter
  if (filters.clientId && filters.clientId !== 'all') {
    conditions.push("r.client_id = ?");
    params.push(filters.clientId);
  }

  // Assignee filter
  if (filters.assignedTo) {
    if (filters.assignedTo === 'unassigned') {
      conditions.push("r.assigned_to IS NULL");
    } else {
      conditions.push("r.assigned_to = ?");
      params.push(filters.assignedTo);
    }
  }

  // Search filter (display_id, title, description, client company/name)
  if (filters.search && filters.search.trim() !== '') {
    const q = `%${filters.search.trim()}%`;
    conditions.push(`(
      r.display_id LIKE ? OR
      r.title LIKE ? OR
      r.description LIKE ? OR
      c.name LIKE ? OR
      c.company_name LIKE ?
    )`);
    params.push(q, q, q, q, q);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'ORDER BY r.created_at DESC';
  if (filters.sort === 'due_date_asc') {
    orderBy = 'ORDER BY CASE WHEN r.due_date IS NULL THEN 1 ELSE 0 END, r.due_date ASC';
  } else if (filters.sort === 'due_date_desc') {
    orderBy = 'ORDER BY CASE WHEN r.due_date IS NULL THEN 1 ELSE 0 END, r.due_date DESC';
  } else if (filters.sort === 'priority') {
    orderBy = `ORDER BY CASE r.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END ASC, r.created_at DESC`;
  }

  const query = `
    SELECT 
      r.*,
      c.name as client_name,
      c.company_name as client_company,
      c.whatsapp_number as client_whatsapp,
      u_assignee.full_name as assignee_name,
      u_assignee.avatar_color as assignee_color,
      u_creator.full_name as creator_name
    FROM requests r
    LEFT JOIN clients c ON r.client_id = c.id
    LEFT JOIN users u_assignee ON r.assigned_to = u_assignee.id
    LEFT JOIN users u_creator ON r.created_by = u_creator.id
    ${whereClause}
    ${orderBy}
  `;

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map((row) => ({
    ...row,
    is_overdue: isRequestOverdue(row),
  })) as RequestItem[];
}

export function getRequestById(id: string): RequestItem | null {
  const db = getDb();
  const query = `
    SELECT 
      r.*,
      c.name as client_name,
      c.company_name as client_company,
      c.whatsapp_number as client_whatsapp,
      c.phone as client_phone,
      c.email as client_email,
      u_assignee.full_name as assignee_name,
      u_assignee.avatar_color as assignee_color,
      u_creator.full_name as creator_name
    FROM requests r
    LEFT JOIN clients c ON r.client_id = c.id
    LEFT JOIN users u_assignee ON r.assigned_to = u_assignee.id
    LEFT JOIN users u_creator ON r.created_by = u_creator.id
    WHERE r.id = ? OR r.display_id = ?
  `;

  const row = db.prepare(query).get(id, id) as any;
  if (!row) return null;

  return {
    ...row,
    is_overdue: isRequestOverdue(row),
  } as RequestItem;
}

export function createRequest(data: {
  title: string;
  description?: string;
  status?: RequestStatus;
  priority?: Priority;
  category?: RequestCategory;
  source: RequestSource;
  client_id?: string | null;
  created_by: string;
  assigned_to?: string | null;
  due_date?: string | null;
  client_waiting_reason?: string | null;
}): RequestItem {
  const db = getDb();
  const id = 'req_' + Math.random().toString(36).substring(2, 10);

  // Generate incrementing display_id
  const countRow = db.prepare('SELECT COUNT(*) as c FROM requests').get() as { c: number };
  const nextNumber = 1001 + countRow.c;
  const displayId = `REQ-${nextNumber}`;

  const now = new Date().toISOString();
  const status = data.status || 'new';
  const priority = data.priority || 'medium';
  const category = data.category || 'Operations';
  const source = data.source || 'manual';

  const waitingSince = (status === 'waiting_on_client' || status === 'needs_clarification') ? now : null;

  db.prepare(`
    INSERT INTO requests (
      id, display_id, title, description, status, priority, category, source,
      client_id, created_by, assigned_to, due_date, client_waiting_reason,
      waiting_since, total_client_waiting_minutes, total_internal_working_minutes,
      created_at, updated_at, completed_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, 0, 0,
      ?, ?, ?
    )
  `).run(
    id,
    displayId,
    data.title,
    data.description || '',
    status,
    priority,
    category,
    source,
    data.client_id || null,
    data.created_by,
    data.assigned_to || null,
    data.due_date || null,
    data.client_waiting_reason || null,
    waitingSince,
    now,
    now,
    status === 'done' ? now : null
  );

  // Activity log
  const creator = db.prepare('SELECT full_name FROM users WHERE id = ?').get(data.created_by) as { full_name: string } | undefined;
  logActivity(
    id,
    data.created_by,
    'request_created',
    `${creator?.full_name || 'User'} created ${displayId}: "${data.title}"`,
    { status, priority, assigned_to: data.assigned_to }
  );

  // Notification if assigned
  if (data.assigned_to) {
    sendNotification(
      data.assigned_to,
      id,
      'request_assigned',
      `You've been assigned ${displayId}: ${data.title}`
    );
  }

  return getRequestById(id)!;
}

export function updateRequest(
  id: string,
  userId: string,
  updates: {
    title?: string;
    description?: string;
    status?: RequestStatus;
    priority?: Priority;
    category?: RequestCategory;
    client_id?: string | null;
    assigned_to?: string | null;
    due_date?: string | null;
    client_waiting_reason?: string | null;
  }
): RequestItem | null {
  const db = getDb();
  const current = getRequestById(id);
  if (!current) return null;

  const now = new Date().toISOString();
  const actor = db.prepare('SELECT full_name FROM users WHERE id = ?').get(userId) as { full_name: string } | undefined;
  const actorName = actor?.full_name || 'User';

  let waitingSince = current.waiting_since;
  let totalClientWaitingMinutes = current.total_client_waiting_minutes;
  let completedAt = current.completed_at;

  // Handle status transition logic
  if (updates.status && updates.status !== current.status) {
    const from = current.status;
    const to = updates.status;

    // Moving into waiting state
    if (to === 'waiting_on_client' || to === 'needs_clarification') {
      waitingSince = now;
    } else if (from === 'waiting_on_client' || from === 'needs_clarification') {
      // Exiting waiting state -> compute duration
      if (waitingSince) {
        const diffMs = new Date(now).getTime() - new Date(waitingSince).getTime();
        totalClientWaitingMinutes += Math.max(1, Math.round(diffMs / 60000));
        waitingSince = null;
      }
    }

    // Completion handling
    if (to === 'done') {
      completedAt = now;
      // Notify creator if completed by someone else
      if (current.created_by !== userId) {
        sendNotification(
          current.created_by,
          id,
          'request_completed',
          `${actorName} completed ${current.display_id}: ${current.title}`
        );
      }
    } else if (from === 'done') {
      completedAt = null; // Reopened
    }

    logActivity(
      id,
      userId,
      to === 'waiting_on_client' ? 'waiting_on_client_set' : 'status_changed',
      `${actorName} changed status from ${from} to ${to}${updates.client_waiting_reason ? ` (Reason: ${updates.client_waiting_reason})` : ''}`,
      { from, to, reason: updates.client_waiting_reason }
    );
  }

  // Handle reassignment
  if (updates.assigned_to !== undefined && updates.assigned_to !== current.assigned_to) {
    const newAssignee = updates.assigned_to
      ? (db.prepare('SELECT full_name FROM users WHERE id = ?').get(updates.assigned_to) as { full_name: string } | undefined)
      : null;

    logActivity(
      id,
      userId,
      'request_reassigned',
      updates.assigned_to
        ? `${actorName} reassigned ${current.display_id} to ${newAssignee?.full_name || 'someone'}`
        : `${actorName} unassigned ${current.display_id}`,
      { from: current.assigned_to, to: updates.assigned_to }
    );

    if (updates.assigned_to) {
      sendNotification(
        updates.assigned_to,
        id,
        'request_reassigned',
        `You were assigned ${current.display_id}: ${current.title}`
      );
    }
  }

  // Field updates
  const title = updates.title !== undefined ? updates.title : current.title;
  const description = updates.description !== undefined ? updates.description : current.description;
  const status = updates.status !== undefined ? updates.status : current.status;
  const priority = updates.priority !== undefined ? updates.priority : current.priority;
  const category = updates.category !== undefined ? updates.category : current.category;
  const clientId = updates.client_id !== undefined ? updates.client_id : current.client_id;
  const assignedTo = updates.assigned_to !== undefined ? updates.assigned_to : current.assigned_to;
  const dueDate = updates.due_date !== undefined ? updates.due_date : current.due_date;
  const clientWaitingReason = updates.client_waiting_reason !== undefined ? updates.client_waiting_reason : current.client_waiting_reason;

  db.prepare(`
    UPDATE requests SET
      title = ?,
      description = ?,
      status = ?,
      priority = ?,
      category = ?,
      client_id = ?,
      assigned_to = ?,
      due_date = ?,
      client_waiting_reason = ?,
      waiting_since = ?,
      total_client_waiting_minutes = ?,
      updated_at = ?,
      completed_at = ?
    WHERE id = ?
  `).run(
    title,
    description,
    status,
    priority,
    category,
    clientId,
    assignedTo,
    dueDate,
    clientWaitingReason,
    waitingSince,
    totalClientWaitingMinutes,
    now,
    completedAt,
    id
  );

  return getRequestById(id);
}

export function deleteRequest(id: string, userId: string): boolean {
  const db = getDb();
  const current = getRequestById(id);
  if (!current) return false;

  const actor = db.prepare('SELECT full_name FROM users WHERE id = ?').get(userId) as { full_name: string } | undefined;
  logActivity(
    null,
    userId,
    'request_deleted',
    `${actor?.full_name || 'User'} permanently deleted ${current.display_id}: "${current.title}"`
  );

  db.prepare('DELETE FROM requests WHERE id = ?').run(id);
  return true;
}

export function getDashboardSummary(userId?: string, role: 'manager' | 'employee' = 'manager'): DashboardSummary {
  const db = getDb();
  const scopeFilter = (role === 'employee' && userId) ? `AND assigned_to = '${userId}'` : '';

  // 1. Core 4 Operational Queues
  const waitingForUs = db.prepare(`
    SELECT COUNT(*) as c FROM requests 
    WHERE status IN ('new', 'ready_to_assign', 'in_progress') ${scopeFilter}
  `).get() as { c: number };

  const waitingForClient = db.prepare(`
    SELECT COUNT(*) as c FROM requests 
    WHERE status IN ('waiting_on_client', 'needs_clarification') ${scopeFilter}
  `).get() as { c: number };

  const unassigned = db.prepare(`
    SELECT COUNT(*) as c FROM requests 
    WHERE assigned_to IS NULL AND status != 'done'
  `).get() as { c: number };

  // STRICT PRD v2 RULE: Overdue is ONLY internal responsibility!
  // due_date < now() AND status IN ('new', 'ready_to_assign', 'in_progress')
  const overdue = db.prepare(`
    SELECT COUNT(*) as c FROM requests 
    WHERE due_date IS NOT NULL 
      AND datetime(due_date) < datetime('now') 
      AND status IN ('new', 'ready_to_assign', 'in_progress')
      ${scopeFilter}
  `).get() as { c: number };

  // 2. Status Counts
  const statuses: RequestStatus[] = ['new', 'needs_clarification', 'ready_to_assign', 'in_progress', 'waiting_on_client', 'done'];
  const statusCounts: Record<RequestStatus, number> = {
    new: 0,
    needs_clarification: 0,
    ready_to_assign: 0,
    in_progress: 0,
    waiting_on_client: 0,
    done: 0,
  };

  const statusRows = db.prepare(`
    SELECT status, COUNT(*) as count FROM requests
    WHERE 1=1 ${scopeFilter}
    GROUP BY status
  `).all() as { status: RequestStatus; count: number }[];

  for (const r of statusRows) {
    if (r.status in statusCounts) {
      statusCounts[r.status] = r.count;
    }
  }

  // 3. Priority Counts
  const priorityCounts: Record<Priority, number> = { high: 0, medium: 0, low: 0 };
  const priorityRows = db.prepare(`
    SELECT priority, COUNT(*) as count FROM requests
    WHERE status != 'done' ${scopeFilter}
    GROUP BY priority
  `).all() as { priority: Priority; count: number }[];

  for (const r of priorityRows) {
    if (r.priority in priorityCounts) {
      priorityCounts[r.priority] = r.count;
    }
  }

  // 4. Due today
  const todayRow = db.prepare(`
    SELECT COUNT(*) as count FROM requests
    WHERE due_date IS NOT NULL
      AND date(due_date) = date('now')
      AND status != 'done'
      ${scopeFilter}
  `).get() as { count: number };

  const totalActive = waitingForUs.c + waitingForClient.c;
  const totalDone = statusCounts.done;

  return {
    queues: {
      waiting_for_us: waitingForUs.c,
      waiting_for_client: waitingForClient.c,
      unassigned: unassigned.c,
      overdue: overdue.c,
    },
    status_counts: statusCounts,
    priority_counts: priorityCounts,
    total_active: totalActive,
    total_done: totalDone,
    today_count: todayRow.count,
  };
}
