import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import StudioConfig from '@/models/StudioConfig';
import StudioCanal from '@/models/StudioCanal';
import { type LLMConfig } from '@/lib/studio/llm-client';
import { generateImagesHFBackground } from '@/lib/studio/hf-images';
import {
  getAudioDurationSeconds,
  estimateDurationFromWords,
  calculateImageCount,
  generateDistributedPrompts,
  STYLE_PREFIX_FREEPIK,
  STYLE_PREFIX_HF,
} from '@/lib/studio/image-prompts';
import { runComfyWorkflow } from '@/lib/studio/comfyui-client';

// ── Config de motor ──────────────────────────────────────────────────────────

interface ImageEngineConfigData {
  image_engine?: 'auto' | 'freepik' | 'huggingface';
}

async function getImageEngine(): Promise<'auto' | 'freepik' | 'huggingface'> {
  try {
    const config = await StudioConfig.findOne({ key: 'image_engine_config' }).lean();
    return ((config?.data as unknown as ImageEngineConfigData)?.image_engine) ?? 'auto';
  } catch {
    return 'auto';
  }
}

// ── Freepik API ──────────────────────────────────────────────────────────────

const NEGATIVE_PROMPT =
  'text, watermark, bright colors, modern, cartoon, anime, colorful, cheerful, face, portrait, logo, signature';

interface FreepikSyncResponse {
  data: Array<{ base64?: string; url?: string }>;
}
interface FreepikAsyncResponse {
  data: {
    _id?: string;
    task_id?: string;
    status?: string;
    generated?: Array<{ base64?: string; url?: string }>;
  };
}
type FreepikCreateResponse = FreepikSyncResponse | FreepikAsyncResponse;

async function freepikGenerateImage(prompt: string, apiKey: string, referenceUrl?: string): Promise<Buffer> {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const bodyPayload: Record<string, unknown> = {
    prompt,
    negative_prompt: NEGATIVE_PROMPT,
    num_images: 1,
    image: { size: 'landscape_16_9' },
    styling: { style: 'photo' },
  };
  if (referenceUrl) {
    const fullUrl = referenceUrl.startsWith('http') ? referenceUrl : `${BASE_URL}${referenceUrl}`;
    bodyPayload.image_references = [{ url: fullUrl, strength: 0.35 }];
  }
  const createRes = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
    method: 'POST',
    headers: {
      'x-freepik-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Freepik create error ${createRes.status}: ${errText.slice(0, 300)}`);
  }

  const createData = (await createRes.json()) as FreepikCreateResponse;

  if (Array.isArray(createData.data)) {
    const first = (createData as FreepikSyncResponse).data[0];
    if (first?.base64) return Buffer.from(first.base64, 'base64');
    if (first?.url) return await downloadUrl(first.url);
    throw new Error(`Freepik síncrono: sin base64 ni url.`);
  }

  const asyncData = (createData as FreepikAsyncResponse).data;
  if (asyncData?.generated?.[0]) return extractImageBuffer(asyncData.generated[0]);

  const taskId = asyncData?._id ?? asyncData?.task_id;
  if (!taskId) {
    throw new Error(`Freepik: formato de respuesta desconocido.`);
  }

  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise((r) => setTimeout(r, 3000));
    const pollRes = await fetch(`https://api.freepik.com/v1/ai/text-to-image/${taskId}`, {
      headers: { 'x-freepik-api-key': apiKey, Accept: 'application/json' },
    });
    if (!pollRes.ok) continue;
    const pollData = (await pollRes.json()) as FreepikAsyncResponse;
    const status = pollData.data?.status?.toUpperCase();
    if (status === 'COMPLETED' || status === 'DONE') {
      const img = pollData.data?.generated?.[0];
      if (img) return extractImageBuffer(img);
    }
    if (status === 'FAILED' || status === 'ERROR') {
      throw new Error(`Freepik: generación fallida (task ${taskId})`);
    }
  }

  throw new Error(`Freepik: timeout esperando imagen (task ${taskId})`);
}

function extractImageBuffer(img: { base64?: string; url?: string }): Buffer {
  if (img.base64) return Buffer.from(img.base64, 'base64');
  throw new Error('Freepik: imagen sin base64.');
}

async function downloadUrl(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error descargando imagen de URL: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ── Handler principal ────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
    const { scriptId } = (await request.json()) as { scriptId?: string };

    if (!scriptId) {
      return NextResponse.json({ error: 'scriptId es obligatorio' }, { status: 400 });
    }

    await connectDB();
    const canal = await StudioCanal.findById(session.canal_id).lean();
    const canalConfig = ((canal as { config?: LLMConfig } | null)?.config ?? {}) as LLMConfig;
    const canalNicho = [(canal as { nicho?: string } | null)?.nicho, (canal as { descripcion?: string } | null)?.descripcion].filter(Boolean).join(' — ') || undefined;

    const script = await StudioScript.findById(scriptId);
    if (!script) return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });

    if (script.images_status === 'processing') {
      return NextResponse.json({ status: 'processing', message: 'Ya está generando imágenes' });
    }

    // ── Calcular duración y número de imágenes ──────────────────────────────
    const publicDir = path.join(process.cwd(), 'public');
    let durationSec = 0;
    if (script.audio_path) {
      durationSec = await getAudioDurationSeconds(
        path.join(publicDir, script.audio_path as string)
      );
    }
    if (durationSec <= 0) {
      durationSec = estimateDurationFromWords(script.guion_json);
    }

    const numImages = calculateImageCount(durationSec);
    const imageDuration = durationSec / numImages;

    // ── Modo ComfyUI ─────────────────────────────────────────────────────────
    const rawCanal = canal as { config?: { imagen_motor?: string; comfyui_api_key?: string; comfyui_workflow_overrides?: Record<string, string>; imagen_referencia_url?: string } } | null;
    const imagenReferenciaUrl = rawCanal?.config?.imagen_referencia_url || undefined;
    if (rawCanal?.config?.imagen_motor === 'comfyui') {
      const comfyKey = rawCanal.config.comfyui_api_key;
      if (!comfyKey) {
        return NextResponse.json({ error: 'API key ComfyUI no configurada para este canal' }, { status: 500 });
      }
      const overrides = rawCanal.config.comfyui_workflow_overrides ?? {};

      script.images_status = 'processing';
      script.images_progress = 0;
      script.images_count = numImages;
      script.images_duration = imageDuration;
      script.images_error = undefined;
      await script.save();

      const sid = scriptId;
      (async () => {
        try {
          const prompts = await generateDistributedPrompts(
            script.guion_json, numImages, script.personaje, script.epoca, canalConfig, STYLE_PREFIX_HF, canalNicho
          );
          const imagesDir = path.join(publicDir, 'studio', 'images', sid);
          await fs.mkdir(imagesDir, { recursive: true });
          const imagesPaths: string[] = [];
          const ts = Date.now();
          for (let i = 0; i < prompts.length; i++) {
            const buffer = await runComfyWorkflow('thumbnail', { prompt: prompts[i] }, comfyKey, overrides.thumbnail);
            const filename = `seccion-${i}.png`;
            await fs.writeFile(path.join(imagesDir, filename), buffer);
            imagesPaths.push(`/api/studio/image/${sid}/${filename}?t=${ts}`);
            await connectDB();
            const s = await StudioScript.findById(sid);
            if (s) { s.images_progress = i + 1; await s.save(); }
          }
          await connectDB();
          const s = await StudioScript.findById(sid);
          if (s) {
            s.images_paths = imagesPaths;
            s.images_count = imagesPaths.length;
            s.images_duration = imageDuration;
            s.images_status = 'ready';
            s.images_progress = imagesPaths.length;
            await s.save();
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error ComfyUI';
          await connectDB();
          const s = await StudioScript.findById(sid);
          if (s) { s.images_status = 'error'; s.images_error = msg.slice(0, 500); await s.save(); }
        }
      })();

      return NextResponse.json({
        status: 'processing',
        engine: 'comfyui',
        images_count: numImages,
        images_duration: Math.round(imageDuration),
      });
    }

    const canalMotor = rawCanal?.config?.imagen_motor;
    const engine = (canalMotor && canalMotor !== 'comfyui')
      ? (canalMotor as 'auto' | 'freepik' | 'huggingface')
      : await getImageEngine();

    // ── Modo HuggingFace (async) ────────────────────────────────────────────
    if (engine === 'huggingface') {
      if (!process.env.HUGGINGFACE_TOKEN) {
        return NextResponse.json({ error: 'HUGGINGFACE_TOKEN no configurado' }, { status: 500 });
      }

      script.images_status = 'processing';
      script.images_progress = 0;
      script.images_count = numImages;
      script.images_duration = imageDuration;
      script.images_error = undefined;
      await script.save();

      const sid = scriptId;
      generateImagesHFBackground(
        sid, script.guion_json, script.personaje, script.epoca, canalConfig, numImages, imageDuration, canalNicho
      ).catch(async (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        await connectDB();
        const s = await StudioScript.findById(sid);
        if (s) { s.images_status = 'error'; s.images_error = msg.slice(0, 500); await s.save(); }
      });

      return NextResponse.json({
        status: 'processing',
        engine: 'huggingface',
        images_count: numImages,
        images_duration: Math.round(imageDuration),
      });
    }

    // ── Modo Freepik (sync) o Auto (Freepik first) ──────────────────────────
    const freepikKey = process.env.FREEPIK_API_KEY;
    if (!freepikKey && engine === 'freepik') {
      return NextResponse.json({ error: 'FREEPIK_API_KEY no configurada' }, { status: 500 });
    }

    if (freepikKey) {
      script.images_status = 'processing';
      script.images_progress = 0;
      script.images_count = numImages;
      script.images_duration = imageDuration;
      script.images_error = undefined;
      await script.save();

      const sid = scriptId;
      (async () => {
        try {
          const prompts = await generateDistributedPrompts(
            script.guion_json, numImages, script.personaje, script.epoca, canalConfig, STYLE_PREFIX_FREEPIK, canalNicho
          );

          const imagesDir = path.join(publicDir, 'studio', 'images', sid);
          await fs.mkdir(imagesDir, { recursive: true });

          const imagesPaths: string[] = [];
          const ts = Date.now();
          for (let i = 0; i < prompts.length; i++) {
            const imgBuffer = await freepikGenerateImage(prompts[i], freepikKey, imagenReferenciaUrl);
            const filename = `seccion-${i}.jpg`;
            await fs.writeFile(path.join(imagesDir, filename), imgBuffer);
            imagesPaths.push(`/api/studio/image/${sid}/${filename}?t=${ts}`);
            await connectDB();
            const s = await StudioScript.findById(sid);
            if (s) {
              s.images_paths = imagesPaths;
              s.images_progress = i + 1;
              await s.save();
            }
          }

          await connectDB();
          const s = await StudioScript.findById(sid);
          if (s) {
            s.images_paths = imagesPaths;
            s.images_count = imagesPaths.length;
            s.images_duration = imageDuration;
            s.images_status = 'ready';
            s.images_progress = imagesPaths.length;
            await s.save();
          }
        } catch (freepikError) {
          const freepikMsg = freepikError instanceof Error ? freepikError.message : 'Error Freepik';
          if (engine === 'auto' && process.env.HUGGINGFACE_TOKEN) {
            console.warn('Freepik falló, usando HuggingFace como fallback:', freepikMsg);
            generateImagesHFBackground(
              sid, script.guion_json, script.personaje, script.epoca, canalConfig, numImages, imageDuration, canalNicho
            ).catch(async (err: unknown) => {
              const msg = err instanceof Error ? err.message : 'Error desconocido';
              await connectDB();
              const s = await StudioScript.findById(sid);
              if (s) { s.images_status = 'error'; s.images_error = msg.slice(0, 500); await s.save(); }
            });
            return;
          }
          await connectDB();
          const s = await StudioScript.findById(sid);
          if (s) { s.images_status = 'error'; s.images_error = freepikMsg.slice(0, 500); await s.save(); }
        }
      })();

      return NextResponse.json({
        status: 'processing',
        engine: 'freepik',
        images_count: numImages,
        images_duration: Math.round(imageDuration),
      });
    }

    // Auto sin Freepik → HF directo
    if (process.env.HUGGINGFACE_TOKEN) {
      script.images_status = 'processing';
      script.images_progress = 0;
      script.images_count = numImages;
      script.images_duration = imageDuration;
      script.images_error = undefined;
      await script.save();

      const sid = scriptId;
      generateImagesHFBackground(
        sid, script.guion_json, script.personaje, script.epoca, canalConfig, numImages, imageDuration, canalNicho
      ).catch(async (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        await connectDB();
        const s = await StudioScript.findById(sid);
        if (s) { s.images_status = 'error'; s.images_error = msg.slice(0, 500); await s.save(); }
      });

      return NextResponse.json({
        status: 'processing',
        engine: 'huggingface',
        images_count: numImages,
        images_duration: Math.round(imageDuration),
      });
    }

    return NextResponse.json({ error: 'No hay ningún motor de imágenes configurado' }, { status: 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error generando imágenes:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
