import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { extractRequestFromText } from '@/lib/ai';

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
    const { rawText } = body;

    if (!rawText || rawText.trim() === '') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Please paste or enter some text to extract.' } },
        { status: 400 }
      );
    }

    const draft = await extractRequestFromText(rawText);
    return NextResponse.json({ draft });
  } catch (error) {
    console.error('AI extract request error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'AI extraction is temporarily unavailable. You can still create requests manually.' } },
      { status: 500 }
    );
  }
}
