import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { runComfyWorkflow } from '@/lib/studio/comfyui-client';
import { promises as fsp, mkdirSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

const CARTELES_IA_DIR = path.join(process.cwd(), 'public', 'studio', 'carteles', 'ia');

const NEGATIVE_PROMPT =
  'text, watermark, words, letters, typography, logo, signature, blurry, low quality, cartoon, anime, deformed';

// ── GET: motores disponibles para el canal ────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    await connectDB();
    const canal = await StudioCanal.findById(session.canal_id).lean();
    const rawCanal = canal as {
      config?: {
        imagen_motor?: string;
        comfyui_api_key?: string;
      };
    } | null;

    const engines: string[] = [];
    if (process.env.FREEPIK_API_KEY) engines.push('freepik');
    if (process.env.HUGGINGFACE_TOKEN) engines.push('huggingface');
    if (rawCanal?.config?.imagen_motor === 'comfyui' && rawCanal.config.comfyui_api_key) {
      engines.push('comfyui');
    }

    const defaultEngine = rawCanal?.config?.imagen_motor ?? 'freepik';
    const resolvedDefault = engines.includes(defaultEngine) ? defaultEngine : engines[0] ?? 'freepik';

    return NextResponse.json({ engines, default: resolvedDefault });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── POST: generar imagen con el motor seleccionado ────────────────────────────

interface GenerateRequest {
  prompt: string;
  engine: 'freepik' | 'huggingface' | 'comfyui';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { prompt, engine } = await request.json() as GenerateRequest;

    if (!prompt || !engine) {
      return NextResponse.json({ error: 'prompt y engine son obligatorios' }, { status: 400 });
    }

    await connectDB();
    const canal = await StudioCanal.findById(session.canal_id).lean();
    const rawCanal = canal as {
      config?: {
        comfyui_api_key?: string;
        comfyui_workflow_overrides?: Record<string, string>;
      };
    } | null;

    mkdirSync(CARTELES_IA_DIR, { recursive: true });
    const filename = `${Date.now()}-${randomBytes(4).toString('hex')}.jpg`;
    const outputPath = path.join(CARTELES_IA_DIR, filename);

    if (engine === 'comfyui') {
      const comfyKey = rawCanal?.config?.comfyui_api_key;
      if (!comfyKey) return NextResponse.json({ error: 'API key ComfyUI no configurada' }, { status: 400 });
      const overrides = rawCanal?.config?.comfyui_workflow_overrides ?? {};
      const buffer = await runComfyWorkflow('cartel', { prompt }, comfyKey, overrides.cartel);
      await fsp.writeFile(outputPath, buffer);
    } else if (engine === 'huggingface') {
      await generateWithHuggingFace(prompt, outputPath);
    } else {
      await generateWithFreepik(prompt, outputPath);
    }

    const imageUrl = `/api/studio/cartel-ia/${filename}`;
    return NextResponse.json({ image_url: imageUrl, engine });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── HuggingFace (Flux.1-schnell) ──────────────────────────────────────────────

async function generateWithHuggingFace(prompt: string, outputPath: string): Promise<void> {
  const hfToken = process.env.HUGGINGFACE_TOKEN;
  if (!hfToken) throw new Error('HUGGINGFACE_TOKEN no configurado');

  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width: 768,
            height: 1024,
            num_inference_steps: 4,
            negative_prompt: NEGATIVE_PROMPT,
          },
        }),
        signal: AbortSignal.timeout(90000),
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

// ── Freepik Mystic ────────────────────────────────────────────────────────────

interface FreepikSyncResponse {
  data: Array<{ base64?: string }>;
}
interface FreepikAsyncResponse {
  data: { _id?: string; task_id?: string; status?: string; generated?: Array<{ base64?: string }> };
}

async function generateWithFreepik(prompt: string, outputPath: string): Promise<void> {
  const apiKey = process.env.FREEPIK_API_KEY;
  if (!apiKey) throw new Error('FREEPIK_API_KEY no configurada');

  const createRes = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
    method: 'POST',
    headers: {
      'x-freepik-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      prompt,
      negative_prompt: NEGATIVE_PROMPT,
      num_images: 1,
      image: { size: 'portrait_3_4' },
      styling: { style: 'photo' },
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Freepik error ${createRes.status}: ${err.slice(0, 300)}`);
  }

  const createData = await createRes.json() as FreepikSyncResponse | FreepikAsyncResponse;

  // Respuesta síncrona (array directo)
  if (Array.isArray(createData.data)) {
    const first = (createData as FreepikSyncResponse).data[0];
    if (first?.base64) {
      await fsp.writeFile(outputPath, Buffer.from(first.base64, 'base64'));
      return;
    }
    throw new Error('Freepik: respuesta recibida pero sin datos de imagen');
  }

  // Respuesta asíncrona (polling)
  const asyncData = (createData as FreepikAsyncResponse).data;
  const taskId = asyncData._id ?? asyncData.task_id;
  if (!taskId) throw new Error('Freepik: no se recibió task_id');

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const pollRes = await fetch(`https://api.freepik.com/v1/ai/text-to-image/${taskId}`, {
      headers: { 'x-freepik-api-key': apiKey, Accept: 'application/json' },
    });
    if (!pollRes.ok) {
      if (pollRes.status >= 400 && pollRes.status < 500) {
        throw new Error(`Freepik: error ${pollRes.status} consultando tarea`);
      }
      continue;
    }

    const pollData = await pollRes.json() as {
      data?: { status?: string; generated?: Array<{ base64?: string }> };
    };

    const status = pollData.data?.status;
    if (status === 'DONE' || status === 'completed') {
      const base64 = pollData.data?.generated?.[0]?.base64;
      if (base64) {
        await fsp.writeFile(outputPath, Buffer.from(base64, 'base64'));
        return;
      }
    }
    if (status === 'FAILED' || status === 'error') throw new Error('Freepik: tarea fallida');
  }

  throw new Error('Freepik: timeout esperando imagen');
}
