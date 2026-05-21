import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { cleanupUploadedLocalVideos } from '@/lib/studio/uploaded-local-video-cleanup';

async function handleRequest(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await connectDB();
    const result = await cleanupUploadedLocalVideos();
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('[cleanup-studio-uploaded-videos] Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleRequest(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleRequest(request);
}
