import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { runComfyWorkflow } from '@/lib/studio/comfyui-client';
import { generateHuggingFaceVideoAsset } from '@/lib/studio/huggingface-video';
import { type IStudioDjSession } from '@/models/StudioDjSession';
import {
  DJ_SESSION_ROOT,
  DJ_MAX_VISUAL_VIDEO_BYTES,
  ensureDir,
  fileExists,
  getAudioDurationSeconds,
  sanitizeFilename,
} from '@/lib/studio/dj-session-files';

type DjImageMotor = 'huggingface' | 'freepik' | 'comfyui';

export interface DjVisualCanalLike {
  nombre?: string;
  nicho?: string;
  descripcion?: string;
  config?: {
    imagen_motor?: DjImageMotor;
    comfyui_api_key?: string;
    comfyui_workflow_overrides?: Record<string, string>;
    thumbnail_style_prompt?: string;
    hf_api_key?: string;
    huggingface_video_enabled?: boolean;
    huggingface_video_model?: string;
    huggingface_video_provider?: 'auto' | 'hf-inference' | 'fal-ai' | 'replicate' | 'novita' | 'wavespeed';
    huggingface_video_endpoint_url?: string;
    huggingface_video_seconds?: number;
    huggingface_video_width?: number;
    huggingface_video_height?: number;
    huggingface_video_fps?: number;
  };
}

export interface GeneratedDjVisualAsset {
  mode: 'static_cover' | 'generated_visual';
  provider: 'comfyui' | 'freepik' | 'huggingface' | 'huggingface_video';
  workflow: string;
  prompt: string;
  model: string | null;
  generationType: 'native_video' | 'image_to_loop' | 'static_image';
  attemptedProvider: string;
  fallbackReason: string | null;
  providerAttempts: Array<{
    provider: string;
    endpoint?: string | null;
    model?: string | null;
    status?: number | null;
    error: string;
    supported?: boolean;
  }>;
  outputKind: 'image' | 'video';
  imagePath: string | null;
  imageMimeType: string | null;
  imageSize: number;
  videoPath: string | null;
  videoMimeType: string | null;
  videoSize: number;
  videoDuration: number;
}

const VISUAL_DEBUG = process.env.DJ_SESSION_VISUAL_DEBUG !== '0';

function visualLog(message: string, meta?: Record<string, unknown>): void {
  if (!VISUAL_DEBUG) return;
  if (meta) {
    console.info(`[dj-session-visual] ${message}`, meta);
    return;
  }
  console.info(`[dj-session-visual] ${message}`);
}

function getOutputDimensions(format: Pick<IStudioDjSession, 'output_format'>['output_format'] | undefined): { width: number; height: number } {
  if (format === '9:16') return { width: 1080, height: 1920 };
  if (format === '1:1') return { width: 1080, height: 1080 };
  return { width: 1920, height: 1080 };
}

const GENRE_VISUAL_PROFILES: Array<{ match: RegExp; prompt: string }> = [
  {
    match: /hard\s*techno|industrial/i,
    prompt: 'industrial hard techno warehouse, black steel, red strobes, aggressive lasers, heavy fog, brutal high contrast',
  },
  {
    match: /hyper\s*techno|hypertechno/i,
    prompt: 'hyper techno speed energy, electric cyan and acid green lasers, chrome reflections, fast rave light trails',
  },
  {
    match: /latin\s*techno/i,
    prompt: 'latin techno club heat, warm magenta and amber lights, rhythmic percussion-inspired geometry, sensual smoke',
  },
  {
    match: /afro\s*house|afrohouse/i,
    prompt: 'afro house deep organic rhythm, sunset gold, emerald accents, tribal-inspired abstract patterns, warm haze',
  },
  {
    match: /reggaet[oó]n|urbano|urban/i,
    prompt: 'urban reggaeton nightlife, glossy neon street club, tropical colors, pink and lime highlights, premium music video look',
  },
  {
    match: /techno/i,
    prompt: 'underground techno club, monochrome concrete, blue lasers, machine pulse, dense smoke and hypnotic light beams',
  },
  {
    match: /house/i,
    prompt: 'elegant house music dancefloor, warm spotlights, mirror reflections, uplifting glow, polished club atmosphere',
  },
];

function getGenreVisualPrompt(genre: string | undefined): string {
  const cleanGenre = genre?.trim();
  if (!cleanGenre) return 'premium electronic music visual identity, club-ready lighting, immersive stage atmosphere';
  return GENRE_VISUAL_PROFILES.find((profile) => profile.match.test(cleanGenre))?.prompt
    ?? `professional visual identity inspired by ${cleanGenre}, tailored club lighting, abstract musical atmosphere`;
}

function buildPromptParts(session: Pick<IStudioDjSession, 'titulo' | 'genre' | 'bpm' | 'output_format'>, canal: DjVisualCanalLike): string[] {
  const channelStyle = [
    canal.nicho?.trim(),
    canal.descripcion?.trim(),
    canal.config?.thumbnail_style_prompt?.trim(),
  ].filter(Boolean);

  return [
    'Professional animated DJ session visual base image',
    getGenreVisualPrompt(session.genre),
    'music artwork designed for animation',
    'deep layered club atmosphere',
    'smoke, volumetric lights, particles, spark flares, laser beams',
    'abstract sound waves and speaker energy',
    'cinematic depth, premium stage visual',
    'seamless loop',
    'high quality, sharp, detailed',
    `composition format: ${session.output_format || '16:9'}`,
    'no text',
    'no logos',
    `session title: ${session.titulo || 'DJ Session'}`,
    session.genre ? `genre: ${session.genre}` : '',
    session.bpm ? `bpm: ${session.bpm}` : '',
    canal.nombre ? `channel: ${canal.nombre}` : '',
    channelStyle.length ? `channel style: ${channelStyle.join(' · ')}` : '',
  ].filter(Boolean);
}

export function buildDjVisualPrompt(
  session: Pick<IStudioDjSession, 'titulo' | 'genre' | 'bpm' | 'output_format'>,
  canal: DjVisualCanalLike
): string {
  const stylePrompt = canal.config?.thumbnail_style_prompt?.trim() || '';
  const parts = buildPromptParts(session, canal);
  if (stylePrompt) {
    parts.push(`style hint: ${stylePrompt}`);
  }
  return parts.join(', ');
}

function ffmpegSpawn(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.env.FFMPEG_PATH || 'ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const stderr: string[] = [];
    proc.stderr?.on('data', (chunk: Buffer) => {
      stderr.push(chunk.toString());
    });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg código ${code}: ${stderr.slice(-8).join('').slice(-1600)}`));
    });
    proc.on('error', reject);
  });
}

export async function createAnimatedDjVisualLoopFromImage(
  imagePath: string,
  videoPath: string,
  format: Pick<IStudioDjSession, 'output_format'>['output_format'] | undefined = '16:9'
): Promise<number> {
  const durationSeconds = 6;
  const { width, height } = getOutputDimensions(format);
  const beamWidth = Math.max(90, Math.round(width * 0.09));
  const glowWidth = Math.max(220, Math.round(width * 0.22));
  const args = [
    '-y',
    '-loop',
    '1',
    '-i',
    imagePath,
    '-t',
    String(durationSeconds),
    '-filter_complex',
    [
      `[0:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1,format=rgba,zoompan=z='1+0.045*sin(on/180*PI)':x='iw/2-(iw/zoom/2)+18*sin(on/48)':y='ih/2-(ih/zoom/2)+12*cos(on/56)':d=180:s=${width}x${height}:fps=30,format=rgba[base]`,
      `color=c=white@0.0:s=${width}x${height}:r=30:d=${durationSeconds},format=rgba,drawbox=x='mod(t*${Math.round(width * 0.32)},${width + glowWidth})-${glowWidth}':y=0:w=${glowWidth}:h=${height}:color=0x7dd3fc@0.10:t=fill,drawbox=x='${width}-mod(t*${Math.round(width * 0.24)},${width + beamWidth})':y=0:w=${beamWidth}:h=${height}:color=0xf472b6@0.09:t=fill,boxblur=${Math.max(35, Math.round(width * 0.025))}:2[lights]`,
      `color=c=white@0.0:s=${width}x${height}:r=30:d=${durationSeconds},format=rgba,drawbox=x='${Math.round(width * 0.10)}+${Math.round(width * 0.08)}*sin(t*1.7)':y='${Math.round(height * 0.12)}+${Math.round(height * 0.07)}*cos(t*1.3)':w=${Math.max(10, Math.round(width * 0.015))}:h=${Math.max(10, Math.round(width * 0.015))}:color=0xffffff@0.85:t=fill,drawbox=x='${Math.round(width * 0.72)}+${Math.round(width * 0.06)}*cos(t*1.9)':y='${Math.round(height * 0.70)}+${Math.round(height * 0.08)}*sin(t*1.4)':w=${Math.max(8, Math.round(width * 0.012))}:h=${Math.max(8, Math.round(width * 0.012))}:color=0xfde68a@0.75:t=fill,boxblur=${Math.max(4, Math.round(width * 0.004))}:1[particles]`,
      `color=c=black@0.0:s=${width}x${height}:r=30:d=${durationSeconds},format=rgba,drawbox=x=0:y='${Math.round(height * 0.58)}+${Math.round(height * 0.05)}*sin(t*1.1)':w=${width}:h=${Math.round(height * 0.35)}:color=0xd1d5db@0.12:t=fill,boxblur=${Math.max(70, Math.round(width * 0.05))}:3[smoke]`,
      '[base][lights]overlay=format=auto:shortest=1[lit]',
      '[lit][smoke]overlay=format=auto:shortest=1[smoked]',
      '[smoked][particles]overlay=format=auto:shortest=1,eq=contrast=1.05:saturation=1.12,format=yuv420p[vout]',
    ].join(';'),
    '-map',
    '[vout]',
    '-r',
    '30',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '23',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-an',
    videoPath,
  ];

  await ffmpegSpawn(args);
  return await getAudioDurationSeconds(videoPath);
}

async function saveAsJpeg(buffer: Buffer, outputPath: string): Promise<void> {
  await ensureDir(path.dirname(outputPath));
  await sharp(buffer).jpeg({ quality: 92 }).toFile(outputPath);
}

function inferVideoFormat(buffer: Buffer): { ext: '.mp4' | '.webm'; mimeType: string } | null {
  if (buffer.length >= 8) {
    const header = buffer.subarray(0, 4).toString('hex').toLowerCase();
    if (header === '1a45dfa3') {
      return { ext: '.webm', mimeType: 'video/webm' };
    }
  }

  if (buffer.length >= 8) {
    const brand = buffer.subarray(4, 8).toString('ascii').toLowerCase();
    if (brand === 'ftyp') {
      return { ext: '.mp4', mimeType: 'video/mp4' };
    }
  }

  return null;
}

async function detectComfyuiOutputKind(buffer: Buffer): Promise<'image' | 'video' | null> {
  const videoFormat = inferVideoFormat(buffer);
  if (videoFormat) return 'video';

  try {
    await sharp(buffer).metadata();
    return 'image';
  } catch {
    return null;
  }
}

async function saveNativeVideoBuffer(
  buffer: Buffer,
  baseName: string,
  outputDir: string
): Promise<{ videoPath: string; videoMimeType: string; videoSize: number; videoDuration: number }> {
  const detected = inferVideoFormat(buffer) ?? { ext: '.mp4' as const, mimeType: 'video/mp4' };
  const tempPath = path.join(outputDir, `${baseName}${detected.ext}.tmp`);
  const finalPath = path.join(outputDir, `${baseName}${detected.ext}`);

  await fs.writeFile(tempPath, buffer);
  const stat = await fs.stat(tempPath);
  if (stat.size < 1000) {
    await fs.unlink(tempPath).catch(() => null);
    throw new Error('ComfyUI video: archivo demasiado pequeño');
  }
  if (stat.size > DJ_MAX_VISUAL_VIDEO_BYTES) {
    await fs.unlink(tempPath).catch(() => null);
    throw new Error('ComfyUI video: el archivo supera el tamaño máximo permitido');
  }

  const duration = await getAudioDurationSeconds(tempPath);
  if (!duration || !Number.isFinite(duration)) {
    await fs.unlink(tempPath).catch(() => null);
    throw new Error('ComfyUI video: no se pudo validar la duración del vídeo');
  }

  await fs.rename(tempPath, finalPath);
  const finalStat = await fs.stat(finalPath);

  return {
    videoPath: finalPath,
    videoMimeType: detected.mimeType,
    videoSize: finalStat.size,
    videoDuration: duration,
  };
}

async function generateComfyuiVideoVisual(
  prompt: string,
  apiKey: string,
  workflowOverride: string | undefined,
  baseName: string,
  outputDir: string,
  outputFormat: Pick<IStudioDjSession, 'output_format'>['output_format'] | undefined
): Promise<GeneratedDjVisualAsset> {
  const { width, height } = getOutputDimensions(outputFormat);
  const sourceBuffer = await runComfyWorkflow(
    'video',
    { prompt, width, height, steps: 8, cfg: 6 },
    apiKey,
    workflowOverride
  );

  try {
    const detected = await detectComfyuiOutputKind(sourceBuffer);
    if (!detected) {
      throw new Error('ComfyUI video: salida no reconocida como imagen ni vídeo');
    }

    if (detected === 'video') {
      const native = await saveNativeVideoBuffer(sourceBuffer, baseName, outputDir);
      return {
        mode: 'generated_visual',
        provider: 'comfyui',
        workflow: 'video',
        prompt,
        model: null,
        generationType: 'native_video',
        attemptedProvider: 'comfyui',
        fallbackReason: null,
        providerAttempts: [
          {
            provider: 'comfyui',
            endpoint: null,
            model: null,
            status: null,
            error: 'ComfyUI video generado correctamente',
            supported: true,
          },
        ],
        outputKind: 'video',
        imagePath: null,
        imageMimeType: null,
        imageSize: 0,
        videoPath: native.videoPath,
        videoMimeType: native.videoMimeType,
        videoSize: native.videoSize,
        videoDuration: native.videoDuration,
      };
    }

    const sourceImagePath = path.join(outputDir, `${baseName}.source.jpg`);
    const finalVideoPath = path.join(outputDir, `${baseName}.mp4`);
    await saveAsJpeg(sourceBuffer, sourceImagePath);

    try {
      const duration = await createAnimatedDjVisualLoopFromImage(sourceImagePath, finalVideoPath, outputFormat);
      const stat = await fs.stat(finalVideoPath);
      return {
        mode: 'generated_visual',
        provider: 'comfyui',
        workflow: 'video',
        prompt,
        model: null,
        generationType: 'image_to_loop',
        attemptedProvider: 'comfyui',
        fallbackReason: null,
        providerAttempts: [
          {
            provider: 'comfyui',
            endpoint: null,
            model: null,
            status: null,
            error: 'ComfyUI devolvió una imagen y se convirtió a loop de vídeo',
            supported: true,
          },
        ],
        outputKind: 'image',
        imagePath: sourceImagePath,
        imageMimeType: 'image/jpeg',
        imageSize: await fs.stat(sourceImagePath).then((s) => s.size),
        videoPath: finalVideoPath,
        videoMimeType: 'video/mp4',
        videoSize: stat.size,
        videoDuration: duration,
      };
    } catch (error) {
      await fs.unlink(finalVideoPath).catch(() => null);
      const imageStat = await fs.stat(sourceImagePath);
      return {
        mode: 'generated_visual',
        provider: 'comfyui',
        workflow: 'video',
        prompt,
        model: null,
        generationType: 'image_to_loop',
        attemptedProvider: 'comfyui',
        fallbackReason: 'ComfyUI devolvió una imagen; no se pudo convertir el loop de vídeo, se conserva la imagen fuente',
        providerAttempts: [
          {
            provider: 'comfyui',
            endpoint: null,
            model: null,
            status: null,
            error: 'ComfyUI devolvió una imagen; no se pudo convertir el loop de vídeo, se conserva la imagen fuente',
            supported: true,
          },
        ],
        outputKind: 'image',
        imagePath: sourceImagePath,
        imageMimeType: 'image/jpeg',
        imageSize: imageStat.size,
        videoPath: null,
        videoMimeType: null,
        videoSize: 0,
        videoDuration: 0,
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    visualLog('ComfyUI video falló', { error: message });
    await fs.unlink(path.join(outputDir, `${baseName}.source.jpg`)).catch(() => null);
    await fs.unlink(path.join(outputDir, `${baseName}.mp4`)).catch(() => null);
    throw new Error(`ComfyUI video falló: ${message}`);
  }
}

async function generateHuggingFaceVideoVisual(
  prompt: string,
  canal: DjVisualCanalLike,
  baseName: string,
  outputDir: string,
  outputFormat: Pick<IStudioDjSession, 'output_format'>['output_format'] | undefined
): Promise<GeneratedDjVisualAsset> {
  const provider = canal.config?.huggingface_video_provider || process.env.HUGGINGFACE_VIDEO_PROVIDER || 'auto';
  const { width, height } = getOutputDimensions(outputFormat);
  visualLog('Intentando Hugging Face Video', {
    model: canal.config?.huggingface_video_model || process.env.HUGGINGFACE_VIDEO_MODEL || 'Lightricks/LTX-Video',
    provider,
    endpoint: canal.config?.huggingface_video_endpoint_url || null,
    enabled: canal.config?.huggingface_video_enabled ?? false,
  });
  const asset = await generateHuggingFaceVideoAsset({
    prompt,
    canal: {
      hf_api_key: canal.config?.hf_api_key,
      huggingface_video_enabled: canal.config?.huggingface_video_enabled,
      huggingface_video_model: canal.config?.huggingface_video_model,
      huggingface_video_provider: canal.config?.huggingface_video_provider,
      huggingface_video_endpoint_url: canal.config?.huggingface_video_endpoint_url,
      huggingface_video_seconds: canal.config?.huggingface_video_seconds,
      huggingface_video_width: canal.config?.huggingface_video_width ?? width,
      huggingface_video_height: canal.config?.huggingface_video_height ?? height,
      huggingface_video_fps: canal.config?.huggingface_video_fps,
    },
    baseName,
    outputDir,
  });

  return {
    mode: 'generated_visual',
    provider: 'huggingface_video',
    workflow: 'video',
    prompt,
    model: asset.model,
    generationType: 'native_video',
    attemptedProvider: 'huggingface_video',
    fallbackReason: null,
    outputKind: 'video',
    imagePath: null,
    imageMimeType: null,
    imageSize: 0,
    videoPath: asset.videoPath,
    videoMimeType: asset.mimeType,
    videoSize: asset.size,
    videoDuration: asset.duration,
    providerAttempts: asset.providerAttempts ?? [
      {
        provider: 'huggingface_video',
        endpoint: canal.config?.huggingface_video_endpoint_url || null,
        model: asset.model,
        status: null,
        error: 'Hugging Face Video generado correctamente',
        supported: true,
      },
    ],
  };
}

async function generateComfyuiStaticImage(
  prompt: string,
  apiKey: string,
  workflowOverride: string | undefined,
  baseName: string,
  outputDir: string,
  outputFormat: Pick<IStudioDjSession, 'output_format'>['output_format'] | undefined
): Promise<GeneratedDjVisualAsset> {
  const { width, height } = getOutputDimensions(outputFormat);
  const buffer = await runComfyWorkflow(
    'fondo',
    { prompt, width, height, steps: 20, cfg: 7 },
    apiKey,
    workflowOverride
  );
  const imagePath = path.join(outputDir, `${baseName}.jpg`);
  await saveAsJpeg(buffer, imagePath);
  const stat = await fs.stat(imagePath);

  return {
    mode: 'static_cover',
    provider: 'comfyui',
    workflow: 'fondo',
    prompt,
    model: null,
    generationType: 'static_image',
    attemptedProvider: 'comfyui',
    fallbackReason: null,
    providerAttempts: [
      {
        provider: 'comfyui',
        endpoint: null,
        model: null,
        status: null,
        error: 'ComfyUI fallback image',
        supported: true,
      },
    ],
    outputKind: 'image',
    imagePath,
    imageMimeType: 'image/jpeg',
    imageSize: stat.size,
    videoPath: null,
    videoMimeType: null,
    videoSize: 0,
    videoDuration: 0,
  };
}

async function generateFreepikImage(
  prompt: string,
  apiKey: string,
  baseName: string,
  outputDir: string,
  outputFormat: Pick<IStudioDjSession, 'output_format'>['output_format'] | undefined
): Promise<GeneratedDjVisualAsset> {
  const format = outputFormat || '16:9';
  const createRes = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
    method: 'POST',
    headers: {
      'x-freepik-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      prompt,
      negative_prompt: 'text, watermark, logo, signature, words, letters, low quality, blurry, cartoon, anime',
      num_images: 1,
      image: { size: format === '9:16' ? 'portrait_9_16' : format === '1:1' ? 'square_1_1' : 'landscape_16_9' },
      styling: { style: 'photo' },
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Freepik error ${createRes.status}: ${err.slice(0, 300)}`);
  }

  const createData = await createRes.json() as {
    data: Array<{ base64?: string }> | { _id?: string; task_id?: string; status?: string; generated?: Array<{ base64?: string }> };
  };

  let buffer: Buffer | null = null;
  if (Array.isArray(createData.data)) {
    const first = createData.data[0];
    if (first?.base64) buffer = Buffer.from(first.base64, 'base64');
  } else {
    const asyncData = createData.data;
    if (asyncData?.generated?.[0]?.base64) {
      buffer = Buffer.from(asyncData.generated[0].base64, 'base64');
    } else {
      const taskId = asyncData._id ?? asyncData.task_id;
      if (!taskId) throw new Error('Freepik: no se recibió task_id');

      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const pollRes = await fetch(`https://api.freepik.com/v1/ai/text-to-image/${taskId}`, {
          headers: { 'x-freepik-api-key': apiKey, Accept: 'application/json' },
        });
        if (!pollRes.ok) continue;
        const pollData = await pollRes.json() as {
          data?: { status?: string; generated?: Array<{ base64?: string }> };
        };
        const status = pollData.data?.status?.toUpperCase();
        if ((status === 'COMPLETED' || status === 'DONE') && pollData.data?.generated?.[0]?.base64) {
          buffer = Buffer.from(pollData.data.generated[0].base64, 'base64');
          break;
        }
        if (status === 'FAILED' || status === 'ERROR') {
          throw new Error(`Freepik: generación fallida (task ${taskId})`);
        }
      }
    }
  }

  if (!buffer) throw new Error('Freepik: no se pudo obtener la imagen generada');

  const imagePath = path.join(outputDir, `${baseName}.jpg`);
  await saveAsJpeg(buffer, imagePath);
  const stat = await fs.stat(imagePath);

  return {
    mode: 'static_cover',
    provider: 'freepik',
    workflow: 'fallback_image',
    prompt,
    model: 'freepik/text-to-image',
    generationType: 'static_image',
    attemptedProvider: 'freepik',
    fallbackReason: null,
    providerAttempts: [
      {
        provider: 'freepik',
        endpoint: null,
        model: 'freepik/text-to-image',
        status: null,
        error: 'Freepik fallback image',
        supported: true,
      },
    ],
    outputKind: 'image',
    imagePath,
    imageMimeType: 'image/jpeg',
    imageSize: stat.size,
    videoPath: null,
    videoMimeType: null,
    videoSize: 0,
    videoDuration: 0,
  };
}

async function generateHuggingFaceImage(
  prompt: string,
  baseName: string,
  outputDir: string,
  outputFormat: Pick<IStudioDjSession, 'output_format'>['output_format'] | undefined,
  hfToken?: string
): Promise<GeneratedDjVisualAsset> {
  const token = hfToken?.trim() || process.env.HUGGINGFACE_TOKEN;
  if (!token) throw new Error('HUGGINGFACE_TOKEN no configurado');
  const { width, height } = getOutputDimensions(outputFormat);

  const response = await fetch(
    'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width,
          height,
          num_inference_steps: 4,
          negative_prompt: 'text, watermark, logo, signature, blurry, low quality, cartoon, anime',
        },
      }),
      signal: AbortSignal.timeout(120000),
    }
  );

  if (response.status === 503) {
    throw new Error('HuggingFace: modelo no disponible');
  }
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace error ${response.status}: ${err.slice(0, 200)}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 1000) throw new Error('Imagen demasiado pequeña');

  const imagePath = path.join(outputDir, `${baseName}.jpg`);
  await saveAsJpeg(buffer, imagePath);
  const stat = await fs.stat(imagePath);

  return {
    mode: 'static_cover',
    provider: 'huggingface',
    workflow: 'fallback_image',
    prompt,
    model: 'black-forest-labs/FLUX.1-schnell',
    generationType: 'static_image',
    attemptedProvider: 'huggingface',
    fallbackReason: null,
    providerAttempts: [
      {
        provider: 'huggingface',
        endpoint: null,
        model: 'black-forest-labs/FLUX.1-schnell',
        status: null,
        error: 'HuggingFace fallback image',
        supported: true,
      },
    ],
    outputKind: 'image',
    imagePath,
    imageMimeType: 'image/jpeg',
    imageSize: stat.size,
    videoPath: null,
    videoMimeType: null,
    videoSize: 0,
    videoDuration: 0,
  };
}

async function generateStaticImageFallback(
  prompt: string,
  canal: DjVisualCanalLike,
  baseName: string,
  outputDir: string,
  outputFormat: Pick<IStudioDjSession, 'output_format'>['output_format'] | undefined,
  fallbackReason?: string,
  attemptedProvider: string = 'unknown',
  providerAttempts: GeneratedDjVisualAsset['providerAttempts'] = []
): Promise<GeneratedDjVisualAsset> {
  const motor = canal.config?.imagen_motor ?? 'freepik';
  if (motor === 'comfyui') {
    const comfyKey = canal.config?.comfyui_api_key;
    if (!comfyKey) throw new Error('API key ComfyUI no configurada para este canal');
    const overrides = canal.config?.comfyui_workflow_overrides ?? {};
    const nextAttempts = [
      ...providerAttempts,
      {
        provider: 'comfyui',
        endpoint: null,
        model: null,
        status: null,
        error: fallbackReason ?? 'ComfyUI fallback image',
        supported: true,
      },
    ];
    return {
      ...(await generateComfyuiStaticImage(prompt, comfyKey, overrides.fondo, baseName, outputDir, outputFormat)),
      attemptedProvider,
      fallbackReason: fallbackReason ?? null,
      providerAttempts: nextAttempts,
    };
  }
  if (motor === 'huggingface') {
    const nextAttempts = [
      ...providerAttempts,
      {
        provider: 'huggingface',
        endpoint: null,
        model: 'black-forest-labs/FLUX.1-schnell',
        status: null,
        error: fallbackReason ?? 'HuggingFace fallback image',
        supported: true,
      },
    ];
    return {
      ...(await generateHuggingFaceImage(prompt, baseName, outputDir, outputFormat, canal.config?.hf_api_key)),
      attemptedProvider,
      fallbackReason: fallbackReason ?? null,
      providerAttempts: nextAttempts,
    };
  }

  const apiKey = process.env.FREEPIK_API_KEY;
  if (!apiKey) throw new Error('FREEPIK_API_KEY no configurada');
  const nextAttempts = [
    ...providerAttempts,
    {
      provider: 'freepik',
      endpoint: null,
      model: 'freepik/text-to-image',
      status: null,
      error: fallbackReason ?? 'Freepik fallback image',
      supported: true,
    },
  ];
  return {
    ...(await generateFreepikImage(prompt, apiKey, baseName, outputDir, outputFormat)),
    attemptedProvider,
    fallbackReason: fallbackReason ?? null,
    providerAttempts: nextAttempts,
  };
}

export async function generateDjSessionVisualAsset(options: {
  session: Pick<IStudioDjSession, 'titulo' | 'genre' | 'bpm' | 'output_format'>;
  canal: DjVisualCanalLike;
  outputDir?: string;
}): Promise<GeneratedDjVisualAsset> {
  const { session, canal } = options;
  const safeSegment = (value: string): string => value
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'shared';
  const outputDir = options.outputDir ?? path.join(DJ_SESSION_ROOT, 'visuals', canal.nombre ? safeSegment(canal.nombre) : 'shared');
  await ensureDir(outputDir);

  const prompt = buildDjVisualPrompt(session, canal);
  const baseName = sanitizeFilename(`${Date.now()}-${session.titulo || 'dj-visual'}`).replace(/\.[^.]+$/, '');
  const attemptedProviders: string[] = [];
  const fallbackReasons: string[] = [];
  const providerAttempts: GeneratedDjVisualAsset['providerAttempts'] = [];

  if (canal.config?.imagen_motor === 'comfyui' && canal.config?.comfyui_api_key && canal.config?.comfyui_workflow_overrides?.video) {
    try {
      visualLog('Intentando ComfyUI video', { canal: canal.nombre, workflow: 'video' });
      return await generateComfyuiVideoVisual(
        prompt,
        canal.config.comfyui_api_key,
        canal.config.comfyui_workflow_overrides.video,
        baseName,
        outputDir,
        session.output_format
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      attemptedProviders.push('comfyui');
      fallbackReasons.push(`ComfyUI video falló: ${message}`);
      providerAttempts.push({
        provider: 'comfyui',
        endpoint: null,
        model: null,
        status: null,
        error: message,
        supported: !/not supported|unsupported/i.test(message),
      });
      visualLog('ComfyUI video no disponible / falló', { error: message });
    }
  } else {
    attemptedProviders.push('comfyui');
    fallbackReasons.push(
      canal.config?.imagen_motor === 'comfyui'
        ? 'ComfyUI video no disponible / falta API key o workflow video'
        : 'ComfyUI no es el motor activo'
    );
    providerAttempts.push({
      provider: 'comfyui',
      endpoint: null,
      model: null,
      status: null,
      error: canal.config?.imagen_motor === 'comfyui'
        ? 'Falta API key o workflow video'
        : 'ComfyUI no es el motor activo',
      supported: false,
    });
    visualLog('ComfyUI video no disponible / falló', {
      reason: canal.config?.imagen_motor === 'comfyui'
        ? 'Falta API key o workflow video'
        : 'Motor distinto de ComfyUI',
    });
  }

  if (canal.config?.huggingface_video_enabled) {
    try {
      visualLog('Intentando Hugging Face Video');
      return await generateHuggingFaceVideoVisual(prompt, canal, baseName, outputDir, session.output_format);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      attemptedProviders.push('huggingface_video');
      fallbackReasons.push(`Hugging Face Video falló: ${message}`);
      const hfAttempts = error instanceof Error && 'providerAttempts' in error
        ? ((error as Error & { providerAttempts?: GeneratedDjVisualAsset['providerAttempts'] }).providerAttempts ?? [])
        : [];
      providerAttempts.push(
        ...hfAttempts,
        {
          provider: 'huggingface_video',
          endpoint: canal.config?.huggingface_video_endpoint_url?.trim() || null,
          model: canal.config?.huggingface_video_model?.trim() || process.env.HUGGINGFACE_VIDEO_MODEL || 'Lightricks/LTX-Video',
          status: null,
          error: message,
          supported: !/not supported|unsupported/i.test(message),
        }
      );
      visualLog('Hugging Face Video falló', { error: message });
    }
  } else {
    attemptedProviders.push('huggingface_video');
    fallbackReasons.push('Hugging Face Video desactivado');
    providerAttempts.push({
      provider: 'huggingface_video',
      endpoint: canal.config?.huggingface_video_endpoint_url?.trim() || null,
      model: canal.config?.huggingface_video_model?.trim() || process.env.HUGGINGFACE_VIDEO_MODEL || 'Lightricks/LTX-Video',
      status: null,
      error: 'Hugging Face Video desactivado',
      supported: false,
    });
    visualLog('Hugging Face Video desactivado');
  }

  visualLog('Usando fallback imagen', {
    motor: canal.config?.imagen_motor ?? 'freepik',
  });
  return await generateStaticImageFallback(
    prompt,
    canal,
    baseName,
    outputDir,
    session.output_format,
    fallbackReasons.join(' | ') || 'Se usó fallback de imagen',
    attemptedProviders.join(' -> ') || 'unknown',
    providerAttempts
  );
}

export async function removeDjVisualAsset(filePath: string | null | undefined): Promise<void> {
  if (!filePath) return;
  if (!(await fileExists(filePath))) return;
  await fs.unlink(filePath).catch(() => null);
}

export async function isDjVisualWithinLimit(filePath: string | null | undefined): Promise<boolean> {
  if (!filePath) return false;
  try {
    const stat = await fs.stat(filePath);
    return stat.size <= DJ_MAX_VISUAL_VIDEO_BYTES;
  } catch {
    return false;
  }
}
