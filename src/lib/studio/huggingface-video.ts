import fs from 'fs/promises';
import path from 'path';
import { DJ_MAX_VISUAL_VIDEO_BYTES, getAudioDurationSeconds, sanitizeFilename } from '@/lib/studio/dj-session-files';

export type HuggingFaceVideoProvider = 'auto' | 'hf-inference' | 'fal-ai' | 'replicate' | 'novita' | 'wavespeed';

export interface HuggingFaceVideoProviderAttempt {
  provider: HuggingFaceVideoProvider | 'endpoint';
  endpoint: string;
  model: string;
  status: number | null;
  error: string;
  supported?: boolean;
}

export interface HuggingFaceVideoConfigLike {
  hf_api_key?: string;
  huggingface_video_enabled?: boolean;
  huggingface_video_model?: string;
  huggingface_video_provider?: HuggingFaceVideoProvider;
  huggingface_video_endpoint_url?: string;
  huggingface_video_seconds?: number;
  huggingface_video_width?: number;
  huggingface_video_height?: number;
  huggingface_video_fps?: number;
}

export interface HuggingFaceVideoAsset {
  provider: 'huggingface_video';
  model: string;
  publicApiPath: string | null;
  videoPath: string;
  mimeType: string;
  size: number;
  duration: number;
}

const HF_VIDEO_API_BASE = 'https://router.huggingface.co';
const DEFAULT_MODEL = process.env.HUGGINGFACE_VIDEO_MODEL?.trim() || 'Lightricks/LTX-Video';
const DEFAULT_PROVIDER: HuggingFaceVideoProvider =
  (() => {
    const envProvider = process.env.HUGGINGFACE_VIDEO_PROVIDER?.trim();
    if (
      envProvider === 'auto' ||
      envProvider === 'hf-inference' ||
      envProvider === 'fal-ai' ||
      envProvider === 'replicate' ||
      envProvider === 'novita' ||
      envProvider === 'wavespeed'
    ) {
      return envProvider;
    }
    return 'auto';
  })();
const DEFAULT_TIMEOUT_MS = Number(process.env.HUGGINGFACE_VIDEO_TIMEOUT_MS || 240000);
const AUTO_PROVIDER_ORDER: Exclude<HuggingFaceVideoProvider, 'auto'>[] = ['fal-ai', 'novita', 'wavespeed', 'replicate', 'hf-inference'];
const NEGATIVE_PROMPT =
  'text, subtitles, watermark, logo, letters, words, blurry, low quality, distorted faces';

function getHuggingFaceToken(canalToken?: string): string | null {
  return canalToken?.trim() || process.env.HUGGINGFACE_TOKEN?.trim() || null;
}

function getVideoEndpoint(provider: Exclude<HuggingFaceVideoProvider, 'auto'>, model: string): string {
  const encodedModel = encodeURI(model.trim() || DEFAULT_MODEL);
  return `${HF_VIDEO_API_BASE}/${provider}/models/${encodedModel}`;
}

function isHuggingFaceDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname === 'huggingface.co' || hostname.endsWith('.huggingface.co') || hostname.endsWith('.hf.space') || hostname === 'hf.space';
  } catch {
    return false;
  }
}

function normalizeEndpointUrl(url?: string | null): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed).toString();
  } catch {
    throw new Error('HuggingFace Video: huggingface_video_endpoint_url inválida');
  }
}

function inferVideoFormat(buffer: Buffer, contentType?: string | null): { ext: '.mp4' | '.mov' | '.webm'; mimeType: string } | null {
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('video/webm')) return { ext: '.webm', mimeType: 'video/webm' };
  if (ct.includes('video/quicktime')) return { ext: '.mov', mimeType: 'video/quicktime' };
  if (ct.includes('video/mp4')) return { ext: '.mp4', mimeType: 'video/mp4' };

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

async function saveVideoBuffer(
  buffer: Buffer,
  baseName: string,
  outputDir: string,
  contentType?: string | null
): Promise<{ videoPath: string; mimeType: string; size: number; duration: number }> {
  const detected = inferVideoFormat(buffer, contentType);
  if (!detected) {
    throw new Error('HuggingFace Video: la salida no es un vídeo válido');
  }

  const tempPath = path.join(outputDir, `${baseName}${detected.ext}.tmp`);
  const finalPath = path.join(outputDir, `${baseName}${detected.ext}`);
  await fs.writeFile(tempPath, buffer);

  const stat = await fs.stat(tempPath);
  if (stat.size < 1000) {
    await fs.unlink(tempPath).catch(() => null);
    throw new Error('HuggingFace Video: archivo demasiado pequeño');
  }
  if (stat.size > DJ_MAX_VISUAL_VIDEO_BYTES) {
    await fs.unlink(tempPath).catch(() => null);
    throw new Error('HuggingFace Video: el archivo supera el tamaño máximo permitido');
  }

  const duration = await getAudioDurationSeconds(tempPath);
  if (!duration || !Number.isFinite(duration)) {
    await fs.unlink(tempPath).catch(() => null);
    throw new Error('HuggingFace Video: no se pudo validar la duración del vídeo');
  }

  await fs.rename(tempPath, finalPath);
  const finalStat = await fs.stat(finalPath);

  return {
    videoPath: finalPath,
    mimeType: detected.mimeType,
    size: finalStat.size,
    duration,
  };
}

async function downloadVideoFromUrl(url: string, token?: string | null): Promise<{ buffer: Buffer; contentType: string | null }> {
  const headers: HeadersInit = {};
  if (token && isHuggingFaceDomain(url)) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers,
    redirect: 'follow',
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HuggingFace Video: descarga fallida ${res.status}: ${text.slice(0, 300)}`);
  }

  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    contentType: res.headers.get('content-type'),
  };
}

function extractUrlFromPayload(payload: unknown): string | null {
  if (!payload) return null;
  if (typeof payload === 'string' && /^https?:\/\//i.test(payload.trim())) {
    return payload.trim();
  }
  if (typeof payload !== 'object') return null;

  const data = payload as Record<string, unknown>;
  const candidates = [
    data.url,
    data.video_url,
    data.output_url,
    data.result_url,
    data.public_url,
    data.path,
    data.output,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && /^https?:\/\//i.test(candidate.trim())) {
      return candidate.trim();
    }
  }

  const nested = [data.result, data.data, data.output];
  for (const value of nested) {
    const nestedUrl = extractUrlFromPayload(value);
    if (nestedUrl) return nestedUrl;
  }

  return null;
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function isModelNotSupportedError(error: string): boolean {
  const lower = error.toLowerCase();
  return (
    lower.includes('model not supported') ||
    lower.includes('not supported by provider') ||
    lower.includes('provider does not support this model') ||
    lower.includes('unsupported model') ||
    lower.includes('model is not supported')
  );
}

function isRetryableProviderError(error: string): boolean {
  const lower = error.toLowerCase();
  return (
    lower.includes('503') ||
    lower.includes('model not supported') ||
    lower.includes('not supported by provider') ||
    lower.includes('provider does not support this model') ||
    lower.includes('unsupported model') ||
    lower.includes('model is not supported') ||
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('rate limit') ||
    lower.includes('quota') ||
    lower.includes('temporarily unavailable') ||
    lower.includes('loading')
  );
}

class HuggingFaceVideoError extends Error {
  providerAttempts: HuggingFaceVideoProviderAttempt[];

  constructor(message: string, providerAttempts: HuggingFaceVideoProviderAttempt[]) {
    super(message);
    this.name = 'HuggingFaceVideoError';
    this.providerAttempts = providerAttempts;
  }
}

async function fetchVideoFromEndpoint(
  endpoint: string,
  token: string,
  prompt: string,
  model: string,
  seconds: number,
  width: number,
  height: number,
  fps: number,
  negativePrompt: string
): Promise<Response> {
  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, video/*, application/octet-stream',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        model,
        width,
        height,
        fps,
        duration: seconds,
        negative_prompt: negativePrompt,
      },
    }),
    signal: AbortSignal.timeout(Number.isFinite(DEFAULT_TIMEOUT_MS) ? DEFAULT_TIMEOUT_MS : 240000),
  });
}

async function tryGenerateFromEndpoint(options: {
  endpoint: string;
  provider: HuggingFaceVideoProvider | 'endpoint';
  model: string;
  token: string;
  prompt: string;
  negativePrompt: string;
  outputDir: string;
  baseName: string;
  seconds: number;
  width: number;
  height: number;
  fps: number;
}): Promise<{ asset: HuggingFaceVideoAsset & { providerAttempts?: HuggingFaceVideoProviderAttempt[] }; attempt: HuggingFaceVideoProviderAttempt }> {
  const response = await fetchVideoFromEndpoint(
    options.endpoint,
    options.token,
    options.prompt,
    options.model,
    options.seconds,
    options.width,
    options.height,
    options.fps,
    options.negativePrompt
  );
  const attemptBase: HuggingFaceVideoProviderAttempt = {
    provider: options.provider,
    endpoint: options.endpoint,
    model: options.model,
    status: response.status,
    error: '',
  };

  if (response.status === 503) {
    const errData = (await response.json().catch(() => ({}))) as { error?: string; estimated_time?: number };
    const message = errData.error || 'modelo no disponible';
    throw Object.assign(new Error(`HuggingFace Video: ${message}`), {
      attempt: { ...attemptBase, error: message, supported: !isModelNotSupportedError(message) },
    });
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const message = `HuggingFace Video error ${response.status}: ${text.slice(0, 300)}`;
    throw Object.assign(new Error(message), {
      attempt: { ...attemptBase, error: message, supported: !isModelNotSupportedError(message) },
    });
  }

  const contentType = response.headers.get('content-type');
  const bodyBuffer = Buffer.from(await response.arrayBuffer());
  const bodyText = bodyBuffer.toString('utf8').trim();

  if (contentType?.includes('json') || bodyText.startsWith('{') || bodyText.startsWith('[')) {
    const payload = bodyText ? JSON.parse(bodyText) : null;
    const url = extractUrlFromPayload(payload);
    if (!url) {
      const message = 'HuggingFace Video: respuesta JSON sin URL de vídeo';
      throw Object.assign(new Error(message), {
        attempt: { ...attemptBase, error: message, supported: true },
      });
    }
    const downloaded = await downloadVideoFromUrl(url, options.token);
    const saved = await saveVideoBuffer(
      downloaded.buffer,
      sanitizeFilename(`${Date.now()}-${options.baseName}`).replace(/\.[^.]+$/, ''),
      options.outputDir,
      downloaded.contentType
    );
    return {
      asset: {
        provider: 'huggingface_video',
        model: options.model,
        publicApiPath: url,
        videoPath: saved.videoPath,
        mimeType: saved.mimeType,
        size: saved.size,
        duration: saved.duration,
      },
      attempt: { ...attemptBase, error: '', supported: true },
    };
  }

  if (bodyText && /^https?:\/\//i.test(bodyText)) {
    const downloaded = await downloadVideoFromUrl(bodyText, options.token);
    const saved = await saveVideoBuffer(
      downloaded.buffer,
      sanitizeFilename(`${Date.now()}-${options.baseName}`).replace(/\.[^.]+$/, ''),
      options.outputDir,
      downloaded.contentType
    );
    return {
      asset: {
        provider: 'huggingface_video',
        model: options.model,
        publicApiPath: bodyText,
        videoPath: saved.videoPath,
        mimeType: saved.mimeType,
        size: saved.size,
        duration: saved.duration,
      },
      attempt: { ...attemptBase, error: '', supported: true },
    };
  }

  const detected = inferVideoFormat(bodyBuffer, contentType);
  if (!detected) {
    const message = 'HuggingFace Video: salida no reconocida como vídeo';
    throw Object.assign(new Error(message), {
      attempt: { ...attemptBase, error: message, supported: true },
    });
  }

  const saved = await saveVideoBuffer(
    bodyBuffer,
    sanitizeFilename(`${Date.now()}-${options.baseName}`).replace(/\.[^.]+$/, ''),
    options.outputDir,
    contentType
  );
  return {
    asset: {
      provider: 'huggingface_video',
      model: options.model,
      publicApiPath: null,
      videoPath: saved.videoPath,
      mimeType: saved.mimeType,
      size: saved.size,
      duration: saved.duration,
    },
    attempt: { ...attemptBase, error: '', supported: true },
  };
}

async function tryProviderEndpoint(options: {
  provider: Exclude<HuggingFaceVideoProvider, 'auto'>;
  model: string;
  token: string;
  prompt: string;
  negativePrompt: string;
  outputDir: string;
  baseName: string;
  seconds: number;
  width: number;
  height: number;
  fps: number;
}): Promise<{ asset: HuggingFaceVideoAsset & { providerAttempts?: HuggingFaceVideoProviderAttempt[] }; attempt: HuggingFaceVideoProviderAttempt }> {
  const endpoint = getVideoEndpoint(options.provider, options.model);
  return tryGenerateFromEndpoint({
    endpoint,
    provider: options.provider,
    model: options.model,
    token: options.token,
    prompt: options.prompt,
    negativePrompt: options.negativePrompt,
    outputDir: options.outputDir,
    baseName: options.baseName,
    seconds: options.seconds,
    width: options.width,
    height: options.height,
    fps: options.fps,
  });
}

export async function generateHuggingFaceVideoAsset(options: {
  prompt: string;
  negativePrompt?: string;
  canal: HuggingFaceVideoConfigLike;
  outputDir: string;
  baseName: string;
}): Promise<HuggingFaceVideoAsset & { providerAttempts?: HuggingFaceVideoProviderAttempt[] }> {
  const token = getHuggingFaceToken(options.canal.hf_api_key);
  if (!token) {
    throw new Error('HUGGINGFACE_TOKEN no configurado');
  }

  const provider = options.canal.huggingface_video_provider ?? DEFAULT_PROVIDER;
  const model = options.canal.huggingface_video_model?.trim() || DEFAULT_MODEL;
  const seconds = clampNumber(options.canal.huggingface_video_seconds, 6, 4, 10);
  const width = clampNumber(options.canal.huggingface_video_width, 768, 512, 1280);
  const height = clampNumber(options.canal.huggingface_video_height, 432, 288, 720);
  const fps = clampNumber(options.canal.huggingface_video_fps, 24, 12, 30);
  const endpointUrl = normalizeEndpointUrl(options.canal.huggingface_video_endpoint_url);
  const negativePrompt = options.negativePrompt ?? NEGATIVE_PROMPT;

  const providerAttempts: HuggingFaceVideoProviderAttempt[] = [];
  const candidateProviders: Exclude<HuggingFaceVideoProvider, 'auto'>[] =
    provider === 'auto'
      ? [...AUTO_PROVIDER_ORDER]
      : [provider];

  const candidateUrls: Array<{ provider: HuggingFaceVideoProvider | 'endpoint'; endpoint: string }> = [];
  if (endpointUrl) {
    candidateUrls.push({ provider: 'endpoint', endpoint: endpointUrl });
  }
  for (const candidate of candidateProviders) {
    candidateUrls.push({ provider: candidate, endpoint: getVideoEndpoint(candidate, model) });
  }

  let lastError: Error | null = null;
  for (const candidate of candidateUrls) {
    try {
      const result = candidate.provider === 'endpoint'
        ? await tryGenerateFromEndpoint({
            endpoint: candidate.endpoint,
            provider: 'endpoint',
            model,
            token,
            prompt: options.prompt,
            negativePrompt,
            outputDir: options.outputDir,
            baseName: options.baseName,
            seconds,
            width,
            height,
            fps,
          })
        : await tryProviderEndpoint({
            provider: candidate.provider as Exclude<HuggingFaceVideoProvider, 'auto'>,
            model,
            token,
            prompt: options.prompt,
            negativePrompt,
            outputDir: options.outputDir,
            baseName: options.baseName,
            seconds,
            width,
            height,
            fps,
          });

      providerAttempts.push(
        ...(result.asset.providerAttempts ?? []),
        result.attempt
      );
      return {
        ...result.asset,
        providerAttempts,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const attempt = (err as Error & { attempt?: HuggingFaceVideoProviderAttempt }).attempt;
      const supported = attempt?.supported ?? !isModelNotSupportedError(err.message);
      providerAttempts.push(
        attempt ?? {
          provider: candidate.provider,
          endpoint: candidate.endpoint,
          model,
          status: null,
          error: err.message,
          supported,
        }
      );
      lastError = err;
      if (provider !== 'auto' && candidate.provider !== 'endpoint') {
        break;
      }
      if (provider === 'auto' && !isRetryableProviderError(err.message) && !supported) {
        continue;
      }
    }
  }

  const message = provider === 'auto'
    ? 'HuggingFace Video: todos los proveedores disponibles fallaron'
    : `HuggingFace Video: falló el proveedor ${provider}`;
  throw new HuggingFaceVideoError(`${message}${lastError ? ` · ${lastError.message}` : ''}`, providerAttempts);
}
