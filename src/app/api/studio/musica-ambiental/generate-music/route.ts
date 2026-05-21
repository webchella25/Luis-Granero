import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export const maxDuration = 120;

const MUAPI_BASE = 'https://api.muapi.ai';
const HF_MUSICGEN_URL = 'https://api-inference.huggingface.co/models/facebook/musicgen-large';

interface GenerateMusicBody {
  prompt: string;
  style?: string;
  duration?: number;
  title?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id)
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const body = (await request.json()) as GenerateMusicBody;
  const styleText = body.style?.trim() || body.prompt?.trim();
  if (!styleText)
    return NextResponse.json({ error: 'El campo de estilo es obligatorio' }, { status: 400 });

  await connectDB();
  const canal = await StudioCanal.findOne({
    _id: session.canal_id,
    workspace_id: session.workspace_id,
  }).lean() as { config?: { muapi_api_key?: string; hf_api_key?: string } } | null;

  const hfKey = canal?.config?.hf_api_key?.trim();
  const muapiKey = canal?.config?.muapi_api_key?.trim();

  if (!hfKey && !muapiKey)
    return NextResponse.json({ error: 'Configura una API key de música en Configuración → Integraciones' }, { status: 400 });

  // Hugging Face MusicGen (síncrono)
  if (hfKey) {
    const res = await fetch(HF_MUSICGEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: styleText }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({})) as { error?: string; estimated_time?: number };
      const isLoading = res.status === 503 && errData.estimated_time;
      const msg = isLoading
        ? `El modelo se está cargando, inténtalo en ~${Math.ceil(errData.estimated_time!)}s`
        : errData.error ?? 'Error al contactar Hugging Face';
      console.error('[generate-music] HF error', res.status, JSON.stringify(errData));
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const audioBuffer = Buffer.from(await res.arrayBuffer());
    const filename = `${randomUUID()}.flac`;
    const dirPath = path.join(process.cwd(), 'studio', 'musica-ambiental', 'tracks', session.canal_id);
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(path.join(dirPath, filename), audioBuffer);

    return NextResponse.json({
      audio_url: `/api/studio/musica-ambiental/track/${session.canal_id}/${filename}`,
    });
  }

  // MuAPI Suno (asíncrono)
  const res = await fetch(`${MUAPI_BASE}/api/v1/suno-create-music`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': muapiKey!,
    },
    body: JSON.stringify({
      style: styleText,
      ...(body.duration ? { duration: body.duration } : {}),
      ...(body.title ? { title: body.title } : {}),
      make_instrumental: true,
    }),
  });

  const data = await res.json() as { request_id?: string; error?: unknown; message?: string; detail?: unknown };
  if (!res.ok || !data.request_id) {
    const errorMsg = typeof data.error === 'string' ? data.error
      : typeof data.error === 'object' && data.error !== null ? (data.error as { message?: string }).message ?? JSON.stringify(data.error)
      : null;
    const raw = errorMsg ?? data.message ?? (typeof data.detail === 'string' ? data.detail : data.detail ? JSON.stringify(data.detail) : null) ?? 'Error al contactar MuAPI';
    console.error('[generate-music] MuAPI error', res.status, JSON.stringify(data));
    return NextResponse.json({ error: `MuAPI ${res.status}: ${raw}` }, { status: 502 });
  }

  return NextResponse.json({ request_id: data.request_id });
}
