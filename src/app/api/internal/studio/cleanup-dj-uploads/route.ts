import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { cleanupDjUploadSessions } from '@/lib/studio/dj-session-upload-cleanup';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.INTERNAL_CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'INTERNAL_CRON_SECRET no configurado' }, { status: 500 });
  }

  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : request.headers.get('x-cron-secret');
  if (token !== secret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await connectDB();
  const result = await cleanupDjUploadSessions();
  return NextResponse.json({ success: true, result });
}
