import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { runComfyWorkflow } from '@/lib/studio/comfyui-client';
import { promises as fsp, mkdirSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'studio', 'musica-ambiental', 'imagenes');

const NEGATIVE_PROMPT =
  'text, watermark, words, letters, blurry, low quality, cartoon, deformed, ugly';

interface PreviewRequest {
  prompt: string;
  engine?: 'freepik' | 'huggingface' | 'comfyui';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  try {
    const { prompt, engine: requestedEngine } = await request.json() as PreviewRequest;
    if (!prompt?.trim()) return NextResponse.json({ error: 'prompt es obligatorio' }, { status: 400 });

    await connectDB();
    const canal = await StudioCanal.findById(session.canal_id).lean() as {
      config?: { imagen_motor?: string; comfyui_api_key?: string; comfyui_workflow_overrides?: Record<string, string> };
    } | null;

    const engine = requestedEngine ?? canal?.config?.imagen_motor ?? 'freepik';

    mkdirSync(OUTPUT_DIR, { recursive: true });
    const filename = `${Date.now()}-${randomBytes(4).toString('hex')}.jpg`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    if (engine === 'comfyui') {
      const comfyKey = canal?.config?.comfyui_api_key;
      if (!comfyKey) return NextResponse.json({ error: 'API key ComfyUI no configurada' }, { status: 400 });
      const overrides = canal?.config?.comfyui_workflow_overrides ?? {};
      const buffer = await runComfyWorkflow('cartel', { prompt }, comfyKey, overrides.cartel);
      await fsp.writeFile(outputPath, buffer);
    } else if (engine === 'huggingface') {
      await generateWithHuggingFace(prompt, outputPath);
    } else {
      await generateWithFreepik(prompt, outputPath);
    }

    const imagen_url = `/api/studio/musica-ambiental/imagen/${filename}`;
    const imagen_path = `/studio/musica-ambiental/imagenes/${filename}`;
    return NextResponse.json({ imagen_url, imagen_path });
  } catch (e) {
    console.error('[musica-ambiental/preview]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

async function generateWithHuggingFace(prompt: string, outputPath: string): Promise<void> {
  const hfToken = process.env.HUGGINGFACE_TOKEN;
  if (!hfToken) throw new Error('HUGGINGFACE_TOKEN no configurado');

  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${hfToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { width: 1920, height: 1080, num_inference_steps: 4, negative_prompt: NEGATIVE_PROMPT },
        }),
        signal: AbortSignal.timeout(120000),
      }
    );

    if (response.status === 503) {
      if (attempt === 3) throw new Error('HuggingFace: modelo no disponible tras 3 intentos');
      await new Promise((r) => setTimeout(r, 20000));
      continue;
    }
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HuggingFace error ${response.status}: ${err.slice(0, 200)}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 1000) throw new Error('Imagen demasiado pequeña');
    await fsp.writeFile(outputPath, buffer);
    return;
  }
}

async function generateWithFreepik(prompt: string, outputPath: string): Promise<void> {
  const apiKey = process.env.FREEPIK_API_KEY;
  if (!apiKey) throw new Error('FREEPIK_API_KEY no configurada');

  interface FreepikSyncResponse { data: Array<{ base64?: string }> }
  interface FreepikAsyncResponse { data: { _id?: string; task_id?: string; status?: string; generated?: Array<{ base64?: string }> } }

  const createRes = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
    method: 'POST',
    headers: { 'x-freepik-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      prompt,
      negative_prompt: NEGATIVE_PROMPT,
      num_images: 1,
      image: { size: 'landscape_16_9' },
      styling: { style: 'photo' },
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Freepik error ${createRes.status}: ${err.slice(0, 300)}`);
  }

  const createData = await createRes.json() as FreepikSyncResponse | FreepikAsyncResponse;

  if (Array.isArray(createData.data)) {
    const first = (createData as FreepikSyncResponse).data[0];
    if (first?.base64) { await fsp.writeFile(outputPath, Buffer.from(first.base64, 'base64')); return; }
    throw new Error('Freepik: respuesta sin imagen');
  }

  const asyncData = (createData as FreepikAsyncResponse).data;
  const taskId = asyncData._id ?? asyncData.task_id;
  if (!taskId) throw new Error('Freepik: no se recibió task_id');

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const pollRes = await fetch(`https://api.freepik.com/v1/ai/text-to-image/${taskId}`, {
      headers: { 'x-freepik-api-key': apiKey, Accept: 'application/json' },
    });
    if (!pollRes.ok) continue;
    const pollData = await pollRes.json() as FreepikAsyncResponse;
    const d = pollData.data;
    if (d.status === 'COMPLETED' && d.generated?.[0]?.base64) {
      await fsp.writeFile(outputPath, Buffer.from(d.generated[0].base64, 'base64'));
      return;
    }
    if (d.status === 'FAILED') throw new Error('Freepik: tarea fallida');
  }
  throw new Error('Freepik: timeout esperando imagen');
}
