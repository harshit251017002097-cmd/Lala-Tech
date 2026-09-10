import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'lalatech.db');

// Singleton connection
let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(dbPath);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    initSchema(dbInstance);
    seedIfEmpty(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('manager', 'employee')),
      avatar_color TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      whatsapp_number TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      display_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL CHECK (status IN ('new', 'needs_clarification', 'ready_to_assign', 'in_progress', 'waiting_on_client', 'done')),
      priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
      category TEXT NOT NULL DEFAULT 'Operations',
      source TEXT NOT NULL CHECK (source IN ('whatsapp', 'email', 'phone', 'website', 'manual', 'other')),
      client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
      created_by TEXT NOT NULL REFERENCES users(id),
      assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
      due_date TEXT,
      client_waiting_reason TEXT,
      waiting_since TEXT,
      total_client_waiting_minutes INTEGER NOT NULL DEFAULT 0,
      total_internal_working_minutes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_requests_assigned_to ON requests(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
    CREATE INDEX IF NOT EXISTS idx_requests_due_date ON requests(due_date);
    CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority);
    CREATE INDEX IF NOT EXISTS idx_requests_client_id ON requests(client_id);

    CREATE TABLE IF NOT EXISTS clarifications (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      missing_information TEXT NOT NULL,
      requested_at TEXT NOT NULL,
      requested_from TEXT NOT NULL,
      resolved_at TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      request_id TEXT REFERENCES requests(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id),
      action_type TEXT NOT NULL,
      description TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_activity_request_id ON activity_log(request_id);
    CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_log(created_at);

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      request_id TEXT REFERENCES requests(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
  `);
}

function seedIfEmpty(db: DatabaseSync) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) return;

  const now = new Date();
  const isoNow = now.toISOString();

  const salt = bcrypt.genSaltSync(10);
  const defaultHash = bcrypt.hashSync('demo123', salt);

  // 1. Seed Users (PRD Section 26)
  const users = [
    { id: 'usr_priya', full_name: 'Priya Sharma', email: 'manager@lalatech.demo', role: 'manager', avatar_color: '#4F46E5' },
    { id: 'usr_rahul', full_name: 'Rahul Verma', email: 'employee@lalatech.demo', role: 'employee', avatar_color: '#0EA5E9' },
    { id: 'usr_aman', full_name: 'Aman Gupta', email: 'aman@lalatech.demo', role: 'employee', avatar_color: '#10B981' },
    { id: 'usr_neha', full_name: 'Neha Kapoor', email: 'neha@lalatech.demo', role: 'employee', avatar_color: '#F59E0B' },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, avatar_color, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of users) {
    insertUser.run(u.id, u.full_name, u.email, defaultHash, u.role, u.avatar_color, isoNow);
  }

  // 2. Seed Clients (PRD v2 Section 4 & 10)
  const clients = [
    { id: 'cli_apex', name: 'Sanjay Mehta', company_name: 'Apex Retail Ltd', email: 'sanjay@apexretail.in', phone: '+91 98201 23456', whatsapp_number: '+919820123456' },
    { id: 'cli_metro', name: 'Vikram Joshi', company_name: 'Metro Logistics Co', email: 'vikram@metrologistics.com', phone: '+91 98202 34567', whatsapp_number: '+919820234567' },
    { id: 'cli_nova', name: 'Ananya Roy', company_name: 'Nova Health Solutions', email: 'ananya@novahealth.org', phone: '+91 98203 45678', whatsapp_number: '+919820345678' },
    { id: 'cli_zenith', name: 'Karan Malhotra', company_name: 'Zenith Global Media', email: 'karan@zenithmedia.com', phone: '+91 98204 56789', whatsapp_number: '+919820456789' },
    { id: 'cli_falcon', name: 'Ritu Sen', company_name: 'Falcon Express Worldwide', email: 'ritu@falconexpress.net', phone: '+91 98205 67890', whatsapp_number: '+919820567890' },
  ];

  const insertClient = db.prepare(`
    INSERT INTO clients (id, name, company_name, email, phone, whatsapp_number, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of clients) {
    insertClient.run(c.id, c.name, c.company_name, c.email, c.phone, c.whatsapp_number, isoNow);
  }

  // Date helpers
  const pastDays = (days: number, hours = 0) => new Date(now.getTime() - (days * 86400000 + hours * 3600000)).toISOString();
  const futureDays = (days: number, hours = 0) => new Date(now.getTime() + (days * 86400000 + hours * 3600000)).toISOString();

  // 3. Seed Requests demonstrating all 6 stages and the 4 Operational Queues
  // NOTE PRD v2 RULE:
  // Overdue = due_date < now() AND status IN ('new', 'ready_to_assign', 'in_progress')
  // Requests in 'waiting_on_client' or 'done' are NEVER OVERDUE!
  const requests = [
    // Queue: Waiting for Us -> In Progress & Overdue
    {
      id: 'req_101',
      display_id: 'REQ-1001',
      title: 'Resolve payment reconciliation discrepancy for Invoice #998',
      description: 'The bank statement does not match client transaction logs. Needs line-by-line reconciliation with audit records.',
      status: 'in_progress',
      priority: 'high',
      category: 'Finance',
      source: 'email',
      client_id: 'cli_apex',
      created_by: 'usr_priya',
      assigned_to: 'usr_rahul',
      due_date: pastDays(2), // Overdue!
      client_waiting_reason: null,
      waiting_since: null,
      created_at: pastDays(5),
      updated_at: pastDays(1),
      completed_at: null,
    },
    // Queue: Waiting for Us -> Ready to Assign & Overdue
    {
      id: 'req_102',
      display_id: 'REQ-1002',
      title: 'Confirm warehouse dispatch schedule for Batch 17',
      description: 'Customer needs delivery slots confirmed for 4 consignments before shipping window closes.',
      status: 'ready_to_assign',
      priority: 'high',
      category: 'Logistics',
      source: 'whatsapp',
      client_id: 'cli_metro',
      created_by: 'usr_priya',
      assigned_to: 'usr_aman',
      due_date: pastDays(1), // Overdue!
      client_waiting_reason: null,
      waiting_since: null,
      created_at: pastDays(3),
      updated_at: pastDays(1),
      completed_at: null,
    },
    // Queue: Waiting for Client -> PAST DUE BUT NOT OVERDUE! (Key PRD v2 demonstration)
    {
      id: 'req_103',
      display_id: 'REQ-1003',
      title: 'Finalize brand guideline revisions and vector logos',
      description: 'Design mockups completed by internal team. Sent to Zenith Media on Monday.',
      status: 'waiting_on_client',
      priority: 'high',
      category: 'Operations',
      source: 'whatsapp',
      client_id: 'cli_zenith',
      created_by: 'usr_priya',
      assigned_to: 'usr_rahul',
      due_date: pastDays(2), // Past due date, but Waiting on Client so Lala Tech is NOT blamed!
      client_waiting_reason: 'Awaiting Karan Malhotra sign-off on color palette variants & brand vector assets.',
      waiting_since: pastDays(2),
      created_at: pastDays(6),
      updated_at: pastDays(2),
      completed_at: null,
    },
    // Queue: Waiting for Client -> Needs Clarification
    {
      id: 'req_104',
      display_id: 'REQ-1004',
      title: 'Import catalog price list update for Q4 products',
      description: 'Client sent screenshot of prices but missing SKU numbers and discount tiers.',
      status: 'needs_clarification',
      priority: 'medium',
      category: 'Sales',
      source: 'whatsapp',
      client_id: 'cli_falcon',
      created_by: 'usr_priya',
      assigned_to: null,
      due_date: futureDays(2),
      client_waiting_reason: 'Missing SKUs and tier breakdown. Sent email request for CSV file.',
      waiting_since: pastDays(1),
      created_at: pastDays(1),
      updated_at: pastDays(1),
      completed_at: null,
    },
    // Queue: Unassigned -> New Request awaiting triage
    {
      id: 'req_105',
      display_id: 'REQ-1005',
      title: 'Inquire regarding enterprise customs clearance assistance',
      description: 'Website inquiry received from Nova Health requesting quote for medical device imports clearance.',
      status: 'new',
      priority: 'medium',
      category: 'Support',
      source: 'website',
      client_id: 'cli_nova',
      created_by: 'usr_priya',
      assigned_to: null, // Unassigned!
      due_date: futureDays(1),
      client_waiting_reason: null,
      waiting_since: null,
      created_at: pastDays(0, 3),
      updated_at: pastDays(0, 3),
      completed_at: null,
    },
    // Queue: Unassigned -> Ready to Assign
    {
      id: 'req_106',
      display_id: 'REQ-1006',
      title: 'Prepare quarterly compliance report for Apex Retail audit',
      description: 'Scope confirmed. Documents gathered. Ready for allocation to operations specialist.',
      status: 'ready_to_assign',
      priority: 'high',
      category: 'Operations',
      source: 'email',
      client_id: 'cli_apex',
      created_by: 'usr_priya',
      assigned_to: null, // Unassigned!
      due_date: futureDays(3),
      client_waiting_reason: null,
      waiting_since: null,
      created_at: pastDays(1),
      updated_at: pastDays(0, 5),
      completed_at: null,
    },
    // Queue: Waiting for Us -> In Progress (Due Today)
    {
      id: 'req_107',
      display_id: 'REQ-1007',
      title: 'Send dispatch notification & tracking link for Order #4532',
      description: 'Order packed. Need to generate airway bill and notify client via WhatsApp and email.',
      status: 'in_progress',
      priority: 'high',
      category: 'Logistics',
      source: 'whatsapp',
      client_id: 'cli_apex',
      created_by: 'usr_priya',
      assigned_to: 'usr_rahul',
      due_date: futureDays(0, 6), // Due today!
      client_waiting_reason: null,
      waiting_since: null,
      created_at: pastDays(1),
      updated_at: pastDays(0, 2),
      completed_at: null,
    },
    // Queue: Waiting for Us -> In Progress
    {
      id: 'req_108',
      display_id: 'REQ-1008',
      title: 'Audit cold-chain temperature logs for Falcon shipment #F902',
      description: 'Review sensor data from transit between Bangalore and Delhi hubs.',
      status: 'in_progress',
      priority: 'medium',
      category: 'Logistics',
      source: 'phone',
      client_id: 'cli_falcon',
      created_by: 'usr_priya',
      assigned_to: 'usr_aman',
      due_date: futureDays(2),
      client_waiting_reason: null,
      waiting_since: null,
      created_at: pastDays(2),
      updated_at: pastDays(1),
      completed_at: null,
    },
    // Queue: Waiting for Us -> In Progress
    {
      id: 'req_109',
      display_id: 'REQ-1009',
      title: 'Review supplier contract amendments for Metro Logistics',
      description: 'Check indemnity clause and liability cap as requested by legal counsel.',
      status: 'in_progress',
      priority: 'medium',
      category: 'Finance',
      source: 'email',
      client_id: 'cli_metro',
      created_by: 'usr_priya',
      assigned_to: 'usr_neha',
      due_date: futureDays(4),
      client_waiting_reason: null,
      waiting_since: null,
      created_at: pastDays(3),
      updated_at: pastDays(1),
      completed_at: null,
    },
    // Queue: Waiting for Client -> Another waiting on client instance
    {
      id: 'req_110',
      display_id: 'REQ-1010',
      title: 'Obtain KYC documents for Nova Health direct billing agreement',
      description: 'Drafted billing agreement, sent for verification.',
      status: 'waiting_on_client',
      priority: 'medium',
      category: 'Finance',
      source: 'email',
      client_id: 'cli_nova',
      created_by: 'usr_priya',
      assigned_to: 'usr_neha',
      due_date: futureDays(5),
      client_waiting_reason: 'Waiting for Nova Health accounting team to return signed GST Certificate and cancelled cheque.',
      waiting_since: pastDays(3),
      created_at: pastDays(4),
      updated_at: pastDays(3),
      completed_at: null,
    },
    // Queue: Done
    {
      id: 'req_111',
      display_id: 'REQ-1011',
      title: 'Reconcile weekly sales figures across all retail outlets',
      description: 'Calculated discrepancies and synced with central ledger.',
      status: 'done',
      priority: 'medium',
      category: 'Finance',
      source: 'manual',
      client_id: 'cli_apex',
      created_by: 'usr_priya',
      assigned_to: 'usr_rahul',
      due_date: pastDays(4),
      client_waiting_reason: null,
      waiting_since: null,
      created_at: pastDays(7),
      updated_at: pastDays(3),
      completed_at: pastDays(3),
    },
    // Queue: Done
    {
      id: 'req_112',
      display_id: 'REQ-1012',
      title: 'Schedule courier pickup for Zenith sample packages',
      description: 'Booked Priority Express and handed over package to driver.',
      status: 'done',
      priority: 'low',
      category: 'Logistics',
      source: 'whatsapp',
      client_id: 'cli_zenith',
      created_by: 'usr_priya',
      assigned_to: 'usr_aman',
      due_date: pastDays(2),
      client_waiting_reason: null,
      waiting_since: null,
      created_at: pastDays(3),
      updated_at: pastDays(2),
      completed_at: pastDays(2),
    },
  ];

  const insertRequest = db.prepare(`
    INSERT INTO requests (
      id, display_id, title, description, status, priority, category, source,
      client_id, created_by, assigned_to, due_date, client_waiting_reason,
      waiting_since, total_client_waiting_minutes, total_internal_working_minutes,
      created_at, updated_at, completed_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?
    )
  `);

  for (const r of requests) {
    insertRequest.run(
      r.id, r.display_id, r.title, r.description, r.status, r.priority, r.category, r.source,
      r.client_id, r.created_by, r.assigned_to, r.due_date, r.client_waiting_reason,
      r.waiting_since, 0, 0,
      r.created_at, r.updated_at, r.completed_at
    );
  }

  // 4. Seed Clarifications
  const insertClarification = db.prepare(`
    INSERT INTO clarifications (id, request_id, missing_information, requested_at, requested_from, resolved_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertClarification.run(
    'clr_1',
    'req_104',
    'CSV or Excel file with product SKUs and tiered wholesale discount percentages.',
    pastDays(1),
    'Ritu Sen (Falcon Express)',
    null,
    'Client responded on WhatsApp stating their procurement officer will supply it by Friday.'
  );

  // 5. Seed Comments
  const insertComment = db.prepare(`
    INSERT INTO comments (id, request_id, user_id, body, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertComment.run(
    'cmt_1',
    'req_101',
    'usr_rahul',
    'Waiting on bank ledger file from HDFC branch before completing cross-reconciliation.',
    pastDays(1, 4)
  );

  insertComment.run(
    'cmt_2',
    'req_101',
    'usr_priya',
    'Understood Rahul. Escalate to branch manager if not received by 3 PM.',
    pastDays(1, 2)
  );

  insertComment.run(
    'cmt_3',
    'req_103',
    'usr_rahul',
    'Spoke with Karan over call. He mentioned he will review the vector files with his director tonight.',
    pastDays(1)
  );

  // 6. Seed Activity Log
  const insertActivity = db.prepare(`
    INSERT INTO activity_log (id, request_id, user_id, action_type, description, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertActivity.run('act_1', 'req_101', 'usr_priya', 'request_created', 'Priya Sharma created request REQ-1001', JSON.stringify({ priority: 'high' }), pastDays(5));
  insertActivity.run('act_2', 'req_101', 'usr_priya', 'request_assigned', 'Priya Sharma assigned REQ-1001 to Rahul Verma', JSON.stringify({ assigned_to: 'usr_rahul' }), pastDays(5));
  insertActivity.run('act_3', 'req_101', 'usr_rahul', 'status_changed', 'Rahul Verma moved REQ-1001 to In Progress', JSON.stringify({ from: 'ready_to_assign', to: 'in_progress' }), pastDays(4));
  insertActivity.run('act_4', 'req_103', 'usr_rahul', 'waiting_on_client_set', 'Rahul Verma paused REQ-1003: Waiting on Client', JSON.stringify({ reason: 'Awaiting Karan Malhotra sign-off' }), pastDays(2));
  insertActivity.run('act_5', 'req_104', 'usr_priya', 'clarification_requested', 'Priya Sharma requested clarification from client for REQ-1004', JSON.stringify({ missing: 'SKUs and discount tiers' }), pastDays(1));
  insertActivity.run('act_6', 'req_111', 'usr_rahul', 'request_completed', 'Rahul Verma marked REQ-1011 as Done', null, pastDays(3));

  // 7. Seed Notifications
  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, user_id, request_id, type, message, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotification.run('notif_1', 'usr_rahul', 'req_107', 'deadline_approaching', 'Due today: Send dispatch notification & tracking link for Order #4532 (Apex Retail)', 0, pastDays(0, 1));
  insertNotification.run('notif_2', 'usr_rahul', 'req_101', 'request_overdue', 'Overdue: Resolve payment reconciliation discrepancy for Invoice #998', 0, pastDays(1));
  insertNotification.run('notif_3', 'usr_rahul', 'req_101', 'comment_added', 'Priya Sharma commented on REQ-1001', 1, pastDays(1, 2));
  insertNotification.run('notif_4', 'usr_aman', 'req_102', 'request_assigned', 'You were assigned REQ-1002: Confirm warehouse dispatch schedule', 0, pastDays(3));
  insertNotification.run('notif_5', 'usr_priya', 'req_111', 'request_completed', 'Rahul Verma completed REQ-1011: Reconcile weekly sales figures', 1, pastDays(3));
}
