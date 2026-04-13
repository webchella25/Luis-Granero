import { NextRequest, NextResponse } from 'next/server';
import { getTokensForCanal, getChannelInfo } from '@/lib/studio/youtube-auth';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ connected: false });

  try {
    const tokens = await getTokensForCanal(session.canal_id);
    if (!tokens) return NextResponse.json({ connected: false });

    const channelInfo = await getChannelInfo(tokens.access_token);
    return NextResponse.json({ connected: true, channel: channelInfo });
  } catch (err) {
    return NextResponse.json({ connected: false, error: err instanceof Error ? err.message : 'Error' });
  }
}
