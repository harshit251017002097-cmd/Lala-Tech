import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardSummary } from '@/lib/requests';

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
    // Managers can optionally see scope for all or toggle to employee view
    const viewScope = searchParams.get('scope') || (user.role === 'employee' ? 'self' : 'all');

    const summary = getDashboardSummary(
      viewScope === 'self' ? user.id : undefined,
      viewScope === 'self' ? 'employee' : 'manager'
    );

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to retrieve dashboard summary.' } },
      { status: 500 }
    );
  }
}
