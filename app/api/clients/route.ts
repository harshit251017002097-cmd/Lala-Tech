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
    const clients = db.prepare(`
      SELECT 
        c.*,
        COUNT(r.id) as total_requests,
        SUM(CASE WHEN r.status != 'done' AND r.status IS NOT NULL THEN 1 ELSE 0 END) as active_requests,
        SUM(CASE WHEN r.status IN ('waiting_on_client', 'needs_clarification') THEN 1 ELSE 0 END) as waiting_requests
      FROM clients c
      LEFT JOIN requests r ON c.id = r.client_id
      GROUP BY c.id
      ORDER BY c.company_name ASC
    `).all();

    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Fetch clients error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to retrieve clients.' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, company_name, email, phone, whatsapp_number } = body;

    if (!company_name || !name) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Contact name and Company name are required.' } },
        { status: 400 }
      );
    }

    const db = getDb();
    const id = 'cli_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO clients (id, name, company_name, email, phone, whatsapp_number, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name.trim(), company_name.trim(), email || null, phone || null, whatsapp_number || null, now);

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to create client.' } },
      { status: 500 }
    );
  }
}
