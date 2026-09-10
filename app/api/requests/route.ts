import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRequests, createRequest, RequestFilterParams } from '@/lib/requests';

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
    const queue = searchParams.get('queue') as RequestFilterParams['queue'] | null;
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const category = searchParams.get('category') || undefined;
    const clientId = searchParams.get('clientId') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') as RequestFilterParams['sort'] | undefined;
    let assignedTo = searchParams.get('assignedTo') || undefined;

    // If requested for "self" or employee viewing My Requests
    if (assignedTo === 'self') {
      assignedTo = user.id;
    }

    const filters: RequestFilterParams = {
      queue: queue || undefined,
      status,
      priority,
      category,
      clientId,
      assignedTo,
      search,
      sort,
    };

    const requests = getRequests(filters);
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Fetch requests error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to retrieve requests.' } },
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
    const { title, description, status, priority, category, source, client_id, assigned_to, due_date, client_waiting_reason } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Title is required.' } },
        { status: 400 }
      );
    }

    const newRequest = createRequest({
      title: title.trim(),
      description: description || '',
      status: status || 'new',
      priority: priority || 'medium',
      category: category || 'Operations',
      source: source || 'manual',
      client_id: client_id || null,
      created_by: user.id,
      assigned_to: assigned_to || null,
      due_date: due_date || null,
      client_waiting_reason: client_waiting_reason || null,
    });

    return NextResponse.json({ request: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to create request.' } },
      { status: 500 }
    );
  }
}
