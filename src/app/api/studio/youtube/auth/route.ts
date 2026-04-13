import { NextRequest, NextResponse } from 'next/server';
import { buildAuthUrl } from '@/lib/studio/youtube-auth';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.redirect(
      new URL('/studio/configuracion?error=Canal+no+seleccionado', request.url)
    );
  }
  try {
    const url = buildAuthUrl(session.canal_id);
    return NextResponse.redirect(url);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.redirect(
      new URL(`/studio/configuracion?error=${encodeURIComponent(msg)}`, request.url)
    );
  }
}
