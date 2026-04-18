// src/lib/studio/comfyui-client.ts
import fs from 'fs';
import path from 'path';

const COMFYUI_BASE = 'https://cloud.comfy.org';
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 120000;

export type ComfyWorkflowType =
  | 'thumbnail'
  | 'cartel'
  | 'fondo'
  | 'video'
  | 'edit_image'
  | 'dj_photo';

export interface ComfyGenerateParams {
  prompt: string;
  seed?: number;
  width?: number;
  height?: number;
  steps?: number;
  cfg?: number;
}

type ComfyJobStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

interface ComfyHistoryResponse {
  outputs: Record<
    string,
    { images?: Array<{ filename: string; subfolder: string; type: string }> }
  >;
}

const DEFAULT_DIMENSIONS: Record<ComfyWorkflowType, { width: number; height: number }> = {
  thumbnail: { width: 1280, height: 720 },
  cartel: { width: 1080, height: 1920 },
  fondo: { width: 1080, height: 1920 },
  video: { width: 1080, height: 1920 },
  edit_image: { width: 1024, height: 1024 },
  dj_photo: { width: 1024, height: 1024 },
};

const WORKFLOW_FILENAME: Record<ComfyWorkflowType, string> = {
  thumbnail: 'thumbnail.json',
  cartel: 'cartel.json',
  fondo: 'fondo.json',
  video: 'video.json',
  edit_image: 'edit-image.json',
  dj_photo: 'dj-photo.json',
};

export function replacePlaceholders(
  template: string,
  params: {
    prompt: string;
    seed: number;
    width: number;
    height: number;
    steps: number;
    cfg: number;
  }
): string {
  return template
    .replace(/"{{prompt}}"/g, JSON.stringify(params.prompt))
    .replace(/"{{seed}}"/g, String(params.seed))
    .replace(/"{{steps}}"/g, String(params.steps))
    .replace(/"{{cfg}}"/g, String(params.cfg))
    .replace(/"{{width}}"/g, String(params.width))
    .replace(/"{{height}}"/g, String(params.height));
}

function loadWorkflowTemplate(tipo: ComfyWorkflowType, override?: string): string {
  if (override) return override;
  const filePath = path.join(
    process.cwd(),
    'src',
    'lib',
    'studio',
    'comfyui-workflows',
    WORKFLOW_FILENAME[tipo]
  );
  return fs.readFileSync(filePath, 'utf-8');
}

async function submitWorkflow(workflowJson: string, apiKey: string): Promise<string> {
  const workflow = JSON.parse(workflowJson) as unknown;
  const res = await fetch(`${COMFYUI_BASE}/api/prompt`, {
    method: 'POST',
    headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow }),
  });

  if (res.status === 401) {
    throw new Error('ComfyUI API key inválida — revísala en Configuración');
  }
  if (res.status === 429) {
    throw new Error('ComfyUI: límite de rate alcanzado, reintenta en unos segundos');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ComfyUI error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { prompt_id: string };
  return data.prompt_id;
}

async function submitWithRetry(workflowJson: string, apiKey: string): Promise<string> {
  const delays = [1000, 2000, 4000];
  let lastErr: Error = new Error('unreachable');
  for (let i = 0; i <= delays.length; i++) {
    try {
      return await submitWorkflow(workflowJson, apiKey);
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (!lastErr.message.includes('rate') || i === delays.length) throw lastErr;
      await new Promise((r) => setTimeout(r, delays[i]));
    }
  }
  throw lastErr;
}

async function getJobStatus(jobId: string, apiKey: string): Promise<ComfyJobStatus> {
  const res = await fetch(`${COMFYUI_BASE}/api/job/${jobId}/status`, {
    headers: { 'X-API-Key': apiKey },
  });
  if (!res.ok) throw new Error(`ComfyUI status error ${res.status}`);
  const data = (await res.json()) as { status: ComfyJobStatus };
  return data.status;
}

async function getJobImages(
  jobId: string,
  apiKey: string
): Promise<Array<{ filename: string; subfolder: string }>> {
  const res = await fetch(`${COMFYUI_BASE}/api/history_v2/${jobId}`, {
    headers: { 'X-API-Key': apiKey },
  });
  if (!res.ok) throw new Error(`ComfyUI history error ${res.status}`);
  const data = (await res.json()) as ComfyHistoryResponse;
  const images: Array<{ filename: string; subfolder: string }> = [];
  for (const nodeOutput of Object.values(data.outputs)) {
    for (const img of nodeOutput.images ?? []) {
      images.push({ filename: img.filename, subfolder: img.subfolder });
    }
  }
  return images;
}

async function downloadOutput(
  filename: string,
  subfolder: string,
  apiKey: string
): Promise<Buffer> {
  const params = new URLSearchParams({ filename, subfolder, type: 'output' });
  const res = await fetch(`${COMFYUI_BASE}/api/view?${params}`, {
    headers: { 'X-API-Key': apiKey },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`ComfyUI download error ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function resolveParams(
  tipo: ComfyWorkflowType,
  params: ComfyGenerateParams
): Required<ComfyGenerateParams> {
  const dims = DEFAULT_DIMENSIONS[tipo];
  return {
    prompt: params.prompt,
    seed: params.seed ?? Math.floor(Math.random() * 999_999_999),
    width: params.width ?? dims.width,
    height: params.height ?? dims.height,
    steps: params.steps ?? 20,
    cfg: params.cfg ?? 7,
  };
}

export async function runComfyWorkflow(
  tipo: ComfyWorkflowType,
  params: ComfyGenerateParams,
  apiKey: string,
  workflowOverride?: string
): Promise<Buffer> {
  const resolved = resolveParams(tipo, params);
  const template = loadWorkflowTemplate(tipo, workflowOverride);
  const workflowJson = replacePlaceholders(template, resolved);
  const jobId = await submitWithRetry(workflowJson, apiKey);

  const startTime = Date.now();
  while (Date.now() - startTime < POLL_TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const status = await getJobStatus(jobId, apiKey);
    if (status === 'completed') {
      const images = await getJobImages(jobId, apiKey);
      if (!images.length) throw new Error('ComfyUI: job completado sin imágenes de salida');
      return await downloadOutput(images[0].filename, images[0].subfolder, apiKey);
    }
    if (status === 'failed' || status === 'cancelled') {
      throw new Error(`ComfyUI: job ${status}`);
    }
  }
  throw new Error('ComfyUI: timeout (120s) esperando resultado');
}

export async function submitComfyJob(
  tipo: ComfyWorkflowType,
  params: ComfyGenerateParams,
  apiKey: string,
  workflowOverride?: string
): Promise<string> {
  const resolved = resolveParams(tipo, params);
  const template = loadWorkflowTemplate(tipo, workflowOverride);
  const workflowJson = replacePlaceholders(template, resolved);
  return await submitWithRetry(workflowJson, apiKey);
}

export async function pollComfyJob(
  jobId: string,
  apiKey: string
): Promise<{ status: ComfyJobStatus; buffer?: Buffer }> {
  const status = await getJobStatus(jobId, apiKey);
  if (status === 'completed') {
    const images = await getJobImages(jobId, apiKey);
    if (images.length) {
      const buffer = await downloadOutput(images[0].filename, images[0].subfolder, apiKey);
      return { status, buffer };
    }
  }
  return { status };
}
