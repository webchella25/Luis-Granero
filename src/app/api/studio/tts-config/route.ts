import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ preferred_engine: 'auto' });

  await connectDB();
  const canal = await StudioCanal.findById(session.canal_id).select('config').lean();
  const motor = (canal as { config?: { voz_motor?: string } } | null)?.config?.voz_motor ?? 'elevenlabs';
  const preferred_engine = motor === 'edge-tts' ? 'edge-tts' : motor === 'elevenlabs' ? 'elevenlabs' : 'auto';
  return NextResponse.json({ preferred_engine });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const { preferred_engine } = (await request.json()) as { preferred_engine?: string };
  if (!['auto', 'elevenlabs', 'edge-tts'].includes(preferred_engine ?? '')) {
    return NextResponse.json({ error: 'Motor no válido' }, { status: 400 });
  }

  const voz_motor = preferred_engine === 'edge-tts' ? 'edge-tts' : 'elevenlabs';

  await connectDB();
  await StudioCanal.findByIdAndUpdate(session.canal_id, { $set: { 'config.voz_motor': voz_motor } });
  return NextResponse.json({ success: true, preferred_engine });
}
