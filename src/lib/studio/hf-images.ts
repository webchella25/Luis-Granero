import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import type { ScriptSection } from '@/models/StudioScript';
import { type LLMConfig } from '@/lib/studio/llm-client';
import {
  generateDistributedPrompts,
  STYLE_PREFIX_HF,
} from '@/lib/studio/image-prompts';

const HF_MODEL = 'black-forest-labs/FLUX.1-schnell';
const HF_API_BASE = 'https://router.huggingface.co/hf-inference/models';

function getHFToken(): string {
  const token = process.env.HUGGINGFACE_TOKEN;
  if (!token) throw new Error('HUGGINGFACE_TOKEN no configurado');
  return token;
}

async function hfGenerateImage(prompt: string, hfToken: string): Promise<Buffer & { ext?: string }> {
  const url = `${HF_API_BASE}/${HF_MODEL}`;
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { width: 1280, height: 720 },
      }),
    });

    if (res.status === 503) {
      if (attempt < maxRetries - 1) {
        console.log(`HF: modelo cargando, esperando 20s (intento ${attempt + 1}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, 20000));
        continue;
      }
      throw new Error('HuggingFace: modelo no disponible tras 3 intentos (503)');
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HuggingFace error ${res.status}: ${errText.slice(0, 300)}`);
    }

    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer()) as Buffer & { ext?: string };

    if (buffer.length < 1000) {
      throw new Error(`HuggingFace: imagen demasiado pequeña (${buffer.length} bytes)`);
    }

    buffer.ext = contentType.includes('png') ? 'png' : 'jpg';
    return buffer;
  }

  throw new Error('HuggingFace: sin respuesta válida tras todos los intentos');
}

/**
 * Genera numImages imágenes en background actualizando el progreso en MongoDB.
 * numImages e imageDuration deben calcularse ANTES de llamar a esta función.
 */
export async function generateImagesHFBackground(
  scriptId: string,
  sections: ScriptSection[],
  personaje: string,
  epoca: string,
  canalConfig: LLMConfig,
  numImages: number,
  imageDuration: number,
  canalNicho?: string
): Promise<void> {
  const hfToken = getHFToken();

  const prompts = await generateDistributedPrompts(
    sections,
    numImages,
    personaje,
    epoca,
    canalConfig,
    STYLE_PREFIX_HF,
    canalNicho
  );

  const imagesDir = path.join(process.cwd(), 'public', 'studio', 'images', scriptId);
  await fs.mkdir(imagesDir, { recursive: true });

  const imagesPaths: string[] = [];
  const ts = Date.now();

  for (let i = 0; i < prompts.length; i++) {
    console.log(`HF: generando imagen ${i + 1}/${prompts.length}...`);

    const imgBuffer = await hfGenerateImage(prompts[i], hfToken);
    const ext = imgBuffer.ext ?? 'jpg';
    const filename = `seccion-${i}.${ext}`;
    await fs.writeFile(path.join(imagesDir, filename), imgBuffer);
    imagesPaths.push(`/api/studio/image/${scriptId}/${filename}?t=${ts}`);

    await connectDB();
    const s = await StudioScript.findById(scriptId);
    if (s) {
      s.images_progress = i + 1;
      await s.save();
    }
  }

  await connectDB();
  const s = await StudioScript.findById(scriptId);
  if (s) {
    s.images_paths = imagesPaths;
    s.images_count = imagesPaths.length;
    s.images_duration = imageDuration;
    s.images_status = 'ready';
    s.images_progress = imagesPaths.length;
    await s.save();
    console.log(`✅ Imágenes HF listas: ${imagesPaths.length} imgs · ${imageDuration.toFixed(1)}s/img`);
  }
}
