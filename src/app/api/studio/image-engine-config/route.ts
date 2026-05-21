import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import StudioConfig from '@/models/StudioConfig';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ image_engine: 'auto', hf_token_configured: false, hf_token_preview: null });
  }

  await connectDB();
  const canal = await StudioCanal.findById(session.canal_id).select('config').lean();
  const motor = (canal as { config?: { imagen_motor?: string } } | null)?.config?.imagen_motor ?? 'freepik';
  const image_engine = ['huggingface', 'freepik', 'comfyui', 'auto'].includes(motor) ? motor : 'auto';

  // El token de HuggingFace sigue siendo global (es una API key, no por canal)
  const hfConfig = await StudioConfig.findOne({ key: 'image_engine_config' }).lean();
  const hfData = ((hfConfig as { data?: unknown } | null)?.data ?? {}) as { hf_token?: string };
  const hf_token_configured = !!hfData.hf_token;
  const hf_token_preview = hf_token_configured ? `${hfData.hf_token!.slice(0, 6)}...` : null;

  return NextResponse.json({ image_engine, hf_token_configured, hf_token_preview });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const body = (await request.json()) as { image_engine?: string; hf_token?: string };
  const { image_engine, hf_token } = body;

  await connectDB();

  if (image_engine && ['auto', 'freepik', 'huggingface', 'comfyui'].includes(image_engine)) {
    await StudioCanal.findByIdAndUpdate(session.canal_id, { $set: { 'config.imagen_motor': image_engine } });
  }

  // El token HF sigue siendo global
  if (hf_token?.trim()) {
    const existing = await StudioConfig.findOne({ key: 'image_engine_config' }).lean();
    const existingData = ((existing as { data?: unknown } | null)?.data ?? {}) as Record<string, unknown>;
    await StudioConfig.findOneAndUpdate(
      { key: 'image_engine_config' },
      { key: 'image_engine_config', data: { ...existingData, hf_token: hf_token.trim() }, updated_at: new Date() },
      { upsert: true }
    );
  }

  return NextResponse.json({ success: true });
}
