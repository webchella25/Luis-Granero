# ComfyUI Cloud API Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir ComfyUI Cloud como motor adicional de generación de imágenes, vídeo y edición en el studio, configurable por canal, sin romper HuggingFace ni Freepik.

**Architecture:** Nueva librería `comfyui-client.ts` gestiona toda la comunicación con `cloud.comfy.org` (submit workflow JSON, poll job, download output). Workflows template con `{{placeholder}}` en `src/lib/studio/comfyui-workflows/`. Las rutas existentes detectan `canal.config.imagen_motor === 'comfyui'` y delegan al nuevo cliente. `StudioCanal.config` se extiende con `comfyui_api_key` y `comfyui_workflow_overrides`.

**Tech Stack:** TypeScript, Next.js 14 App Router, MongoDB/Mongoose, ComfyUI Cloud REST API (`cloud.comfy.org`)

**Spec:** `docs/superpowers/specs/2026-04-18-comfyui-integration-design.md`

---

## File Map

| Acción | Fichero | Responsabilidad |
|--------|---------|-----------------|
| Crear | `src/lib/studio/comfyui-client.ts` | Cliente HTTP: submit/poll/download |
| Crear | `src/lib/studio/comfyui-workflows/thumbnail.json` | Workflow FLUX 16:9 |
| Crear | `src/lib/studio/comfyui-workflows/cartel.json` | Workflow FLUX 9:16 |
| Crear | `src/lib/studio/comfyui-workflows/fondo.json` | Workflow FLUX 9:16 fondos |
| Crear | `src/lib/studio/comfyui-workflows/video.json` | Workflow vídeo (stub configurable) |
| Crear | `src/lib/studio/comfyui-workflows/edit-image.json` | Workflow img2img |
| Crear | `src/lib/studio/comfyui-workflows/dj-photo.json` | Workflow mejora fotos DJ |
| Crear | `src/app/api/studio/comfyui/generate/route.ts` | Endpoint unificado de generación |
| Crear | `src/app/api/studio/comfyui/status/route.ts` | Polling de job asíncrono |
| Modificar | `src/models/StudioCanal.ts` | Añadir comfyui_api_key + workflow_overrides |
| Modificar | `src/app/api/studio/canales/[id]/route.ts` | Aceptar nuevos campos en PATCH |
| Modificar | `src/app/api/studio/generate-images/route.ts` | Branch comfyui en motor |
| Modificar | `src/app/api/studio/generate-thumbnail/route.ts` | Branch comfyui en motor |
| Modificar | `src/app/api/studio/carteles/generate-fondo/route.ts` | Branch comfyui en motor |
| Modificar | `src/app/studio/configuracion/page.tsx` | Sección ComfyUI: API key + overrides |

---

## Task 1: ComfyUI Client Library

**Files:**
- Create: `src/lib/studio/comfyui-client.ts`

- [ ] **Step 1: Crear el fichero con tipos y funciones base**

```typescript
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

// Genera imagen y espera resultado — para flujos síncronos (imagen fija)
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

// Envía job y devuelve prompt_id — para flujos asíncronos (vídeo)
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

// Consulta estado de un job asíncrono
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
```

- [ ] **Step 2: Verificar compilación TypeScript**

```bash
cd /home/ubuntu/luisgranero-com
npx tsc --noEmit 2>&1 | grep comfyui
```

Expected: sin errores en `comfyui-client.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/studio/comfyui-client.ts
git commit -m "feat(studio): ComfyUI Cloud client — submit/poll/download"
```

---

## Task 2: Default Workflow Templates

**Files:**
- Create: `src/lib/studio/comfyui-workflows/thumbnail.json`
- Create: `src/lib/studio/comfyui-workflows/cartel.json`
- Create: `src/lib/studio/comfyui-workflows/fondo.json`
- Create: `src/lib/studio/comfyui-workflows/video.json`
- Create: `src/lib/studio/comfyui-workflows/edit-image.json`
- Create: `src/lib/studio/comfyui-workflows/dj-photo.json`

Todos los workflows usan FLUX.1-schnell (mismo modelo que ya usa el proyecto). Los placeholders numéricos van sin comillas en el JSON final — la función `replacePlaceholders` elimina las comillas al sustituir.

- [ ] **Step 1: Crear workflow thumbnail (1280×720, FLUX.1-schnell)**

```json
// src/lib/studio/comfyui-workflows/thumbnail.json
{
  "6": {
    "inputs": { "text": "{{prompt}}", "clip": ["11", 0] },
    "class_type": "CLIPTextEncode"
  },
  "8": {
    "inputs": { "samples": ["13", 0], "vae": ["10", 0] },
    "class_type": "VAEDecode"
  },
  "9": {
    "inputs": { "filename_prefix": "ComfyUI", "images": ["8", 0] },
    "class_type": "SaveImage"
  },
  "10": {
    "inputs": { "vae_name": "ae.safetensors" },
    "class_type": "VAELoader"
  },
  "11": {
    "inputs": {
      "clip_name1": "t5xxl_fp8_e4m3fn.safetensors",
      "clip_name2": "clip_l.safetensors",
      "type": "flux"
    },
    "class_type": "DualCLIPLoader"
  },
  "12": {
    "inputs": { "unet_name": "flux1-schnell.safetensors", "weight_dtype": "fp8_e4m3fn" },
    "class_type": "UNETLoader"
  },
  "13": {
    "inputs": {
      "noise": ["25", 0],
      "guider": ["22", 0],
      "sampler": ["16", 0],
      "sigmas": ["17", 0],
      "latent_image": ["27", 0]
    },
    "class_type": "SamplerCustomAdvanced"
  },
  "16": {
    "inputs": { "sampler_name": "euler" },
    "class_type": "KSamplerSelect"
  },
  "17": {
    "inputs": { "scheduler": "simple", "steps": "{{steps}}", "denoise": 1, "model": ["12", 0] },
    "class_type": "BasicScheduler"
  },
  "22": {
    "inputs": { "model": ["12", 0], "conditioning": ["6", 0] },
    "class_type": "BasicGuider"
  },
  "25": {
    "inputs": { "noise_seed": "{{seed}}" },
    "class_type": "RandomNoise"
  },
  "27": {
    "inputs": { "width": "{{width}}", "height": "{{height}}", "batch_size": 1 },
    "class_type": "EmptySD3LatentImage"
  }
}
```

- [ ] **Step 2: Crear cartel.json** (mismo workflow, las dimensiones `{{width}}`/`{{height}}` serán 1080×1920 por el DEFAULT_DIMENSIONS del cliente — copiar thumbnail.json cambiando solo el `filename_prefix`)

```json
// src/lib/studio/comfyui-workflows/cartel.json
{
  "6": {
    "inputs": { "text": "{{prompt}}", "clip": ["11", 0] },
    "class_type": "CLIPTextEncode"
  },
  "8": {
    "inputs": { "samples": ["13", 0], "vae": ["10", 0] },
    "class_type": "VAEDecode"
  },
  "9": {
    "inputs": { "filename_prefix": "ComfyUI_cartel", "images": ["8", 0] },
    "class_type": "SaveImage"
  },
  "10": {
    "inputs": { "vae_name": "ae.safetensors" },
    "class_type": "VAELoader"
  },
  "11": {
    "inputs": {
      "clip_name1": "t5xxl_fp8_e4m3fn.safetensors",
      "clip_name2": "clip_l.safetensors",
      "type": "flux"
    },
    "class_type": "DualCLIPLoader"
  },
  "12": {
    "inputs": { "unet_name": "flux1-schnell.safetensors", "weight_dtype": "fp8_e4m3fn" },
    "class_type": "UNETLoader"
  },
  "13": {
    "inputs": {
      "noise": ["25", 0],
      "guider": ["22", 0],
      "sampler": ["16", 0],
      "sigmas": ["17", 0],
      "latent_image": ["27", 0]
    },
    "class_type": "SamplerCustomAdvanced"
  },
  "16": {
    "inputs": { "sampler_name": "euler" },
    "class_type": "KSamplerSelect"
  },
  "17": {
    "inputs": { "scheduler": "simple", "steps": "{{steps}}", "denoise": 1, "model": ["12", 0] },
    "class_type": "BasicScheduler"
  },
  "22": {
    "inputs": { "model": ["12", 0], "conditioning": ["6", 0] },
    "class_type": "BasicGuider"
  },
  "25": {
    "inputs": { "noise_seed": "{{seed}}" },
    "class_type": "RandomNoise"
  },
  "27": {
    "inputs": { "width": "{{width}}", "height": "{{height}}", "batch_size": 1 },
    "class_type": "EmptySD3LatentImage"
  }
}
```

- [ ] **Step 3: Crear fondo.json** (idéntico a cartel.json pero `filename_prefix: "ComfyUI_fondo"` — los fondos tienen el mismo estilo pero se usan en contexto diferente)

```json
// src/lib/studio/comfyui-workflows/fondo.json
{
  "6": {
    "inputs": { "text": "{{prompt}}", "clip": ["11", 0] },
    "class_type": "CLIPTextEncode"
  },
  "8": {
    "inputs": { "samples": ["13", 0], "vae": ["10", 0] },
    "class_type": "VAEDecode"
  },
  "9": {
    "inputs": { "filename_prefix": "ComfyUI_fondo", "images": ["8", 0] },
    "class_type": "SaveImage"
  },
  "10": {
    "inputs": { "vae_name": "ae.safetensors" },
    "class_type": "VAELoader"
  },
  "11": {
    "inputs": {
      "clip_name1": "t5xxl_fp8_e4m3fn.safetensors",
      "clip_name2": "clip_l.safetensors",
      "type": "flux"
    },
    "class_type": "DualCLIPLoader"
  },
  "12": {
    "inputs": { "unet_name": "flux1-schnell.safetensors", "weight_dtype": "fp8_e4m3fn" },
    "class_type": "UNETLoader"
  },
  "13": {
    "inputs": {
      "noise": ["25", 0],
      "guider": ["22", 0],
      "sampler": ["16", 0],
      "sigmas": ["17", 0],
      "latent_image": ["27", 0]
    },
    "class_type": "SamplerCustomAdvanced"
  },
  "16": {
    "inputs": { "sampler_name": "euler" },
    "class_type": "KSamplerSelect"
  },
  "17": {
    "inputs": { "scheduler": "simple", "steps": "{{steps}}", "denoise": 1, "model": ["12", 0] },
    "class_type": "BasicScheduler"
  },
  "22": {
    "inputs": { "model": ["12", 0], "conditioning": ["6", 0] },
    "class_type": "BasicGuider"
  },
  "25": {
    "inputs": { "noise_seed": "{{seed}}" },
    "class_type": "RandomNoise"
  },
  "27": {
    "inputs": { "width": "{{width}}", "height": "{{height}}", "batch_size": 1 },
    "class_type": "EmptySD3LatentImage"
  }
}
```

- [ ] **Step 4: Crear dj-photo.json** (FLUX con prompt enfocado en mejora fotográfica — misma estructura base)

```json
// src/lib/studio/comfyui-workflows/dj-photo.json
{
  "6": {
    "inputs": { "text": "{{prompt}}", "clip": ["11", 0] },
    "class_type": "CLIPTextEncode"
  },
  "8": {
    "inputs": { "samples": ["13", 0], "vae": ["10", 0] },
    "class_type": "VAEDecode"
  },
  "9": {
    "inputs": { "filename_prefix": "ComfyUI_dj", "images": ["8", 0] },
    "class_type": "SaveImage"
  },
  "10": {
    "inputs": { "vae_name": "ae.safetensors" },
    "class_type": "VAELoader"
  },
  "11": {
    "inputs": {
      "clip_name1": "t5xxl_fp8_e4m3fn.safetensors",
      "clip_name2": "clip_l.safetensors",
      "type": "flux"
    },
    "class_type": "DualCLIPLoader"
  },
  "12": {
    "inputs": { "unet_name": "flux1-schnell.safetensors", "weight_dtype": "fp8_e4m3fn" },
    "class_type": "UNETLoader"
  },
  "13": {
    "inputs": {
      "noise": ["25", 0],
      "guider": ["22", 0],
      "sampler": ["16", 0],
      "sigmas": ["17", 0],
      "latent_image": ["27", 0]
    },
    "class_type": "SamplerCustomAdvanced"
  },
  "16": {
    "inputs": { "sampler_name": "euler" },
    "class_type": "KSamplerSelect"
  },
  "17": {
    "inputs": { "scheduler": "simple", "steps": "{{steps}}", "denoise": 1, "model": ["12", 0] },
    "class_type": "BasicScheduler"
  },
  "22": {
    "inputs": { "model": ["12", 0], "conditioning": ["6", 0] },
    "class_type": "BasicGuider"
  },
  "25": {
    "inputs": { "noise_seed": "{{seed}}" },
    "class_type": "RandomNoise"
  },
  "27": {
    "inputs": { "width": "{{width}}", "height": "{{height}}", "batch_size": 1 },
    "class_type": "EmptySD3LatentImage"
  }
}
```

- [ ] **Step 5: Crear edit-image.json** (stub — requiere workflow img2img personalizado con ControlNet, que el usuario debe subir)

```json
// src/lib/studio/comfyui-workflows/edit-image.json
{
  "6": {
    "inputs": { "text": "{{prompt}}", "clip": ["11", 0] },
    "class_type": "CLIPTextEncode"
  },
  "8": {
    "inputs": { "samples": ["13", 0], "vae": ["10", 0] },
    "class_type": "VAEDecode"
  },
  "9": {
    "inputs": { "filename_prefix": "ComfyUI_edit", "images": ["8", 0] },
    "class_type": "SaveImage"
  },
  "10": {
    "inputs": { "vae_name": "ae.safetensors" },
    "class_type": "VAELoader"
  },
  "11": {
    "inputs": {
      "clip_name1": "t5xxl_fp8_e4m3fn.safetensors",
      "clip_name2": "clip_l.safetensors",
      "type": "flux"
    },
    "class_type": "DualCLIPLoader"
  },
  "12": {
    "inputs": { "unet_name": "flux1-schnell.safetensors", "weight_dtype": "fp8_e4m3fn" },
    "class_type": "UNETLoader"
  },
  "13": {
    "inputs": {
      "noise": ["25", 0],
      "guider": ["22", 0],
      "sampler": ["16", 0],
      "sigmas": ["17", 0],
      "latent_image": ["27", 0]
    },
    "class_type": "SamplerCustomAdvanced"
  },
  "16": {
    "inputs": { "sampler_name": "euler" },
    "class_type": "KSamplerSelect"
  },
  "17": {
    "inputs": { "scheduler": "simple", "steps": "{{steps}}", "denoise": 1, "model": ["12", 0] },
    "class_type": "BasicScheduler"
  },
  "22": {
    "inputs": { "model": ["12", 0], "conditioning": ["6", 0] },
    "class_type": "BasicGuider"
  },
  "25": {
    "inputs": { "noise_seed": "{{seed}}" },
    "class_type": "RandomNoise"
  },
  "27": {
    "inputs": { "width": "{{width}}", "height": "{{height}}", "batch_size": 1 },
    "class_type": "EmptySD3LatentImage"
  }
}
```

- [ ] **Step 6: Crear video.json** (stub text-to-image — vídeo real requiere AnimateDiff/WanVideo que el usuario configura vía override)

```json
// src/lib/studio/comfyui-workflows/video.json
{
  "6": {
    "inputs": { "text": "{{prompt}}", "clip": ["11", 0] },
    "class_type": "CLIPTextEncode"
  },
  "8": {
    "inputs": { "samples": ["13", 0], "vae": ["10", 0] },
    "class_type": "VAEDecode"
  },
  "9": {
    "inputs": { "filename_prefix": "ComfyUI_video", "images": ["8", 0] },
    "class_type": "SaveImage"
  },
  "10": {
    "inputs": { "vae_name": "ae.safetensors" },
    "class_type": "VAELoader"
  },
  "11": {
    "inputs": {
      "clip_name1": "t5xxl_fp8_e4m3fn.safetensors",
      "clip_name2": "clip_l.safetensors",
      "type": "flux"
    },
    "class_type": "DualCLIPLoader"
  },
  "12": {
    "inputs": { "unet_name": "flux1-schnell.safetensors", "weight_dtype": "fp8_e4m3fn" },
    "class_type": "UNETLoader"
  },
  "13": {
    "inputs": {
      "noise": ["25", 0],
      "guider": ["22", 0],
      "sampler": ["16", 0],
      "sigmas": ["17", 0],
      "latent_image": ["27", 0]
    },
    "class_type": "SamplerCustomAdvanced"
  },
  "16": {
    "inputs": { "sampler_name": "euler" },
    "class_type": "KSamplerSelect"
  },
  "17": {
    "inputs": { "scheduler": "simple", "steps": "{{steps}}", "denoise": 1, "model": ["12", 0] },
    "class_type": "BasicScheduler"
  },
  "22": {
    "inputs": { "model": ["12", 0], "conditioning": ["6", 0] },
    "class_type": "BasicGuider"
  },
  "25": {
    "inputs": { "noise_seed": "{{seed}}" },
    "class_type": "RandomNoise"
  },
  "27": {
    "inputs": { "width": "{{width}}", "height": "{{height}}", "batch_size": 1 },
    "class_type": "EmptySD3LatentImage"
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/studio/comfyui-workflows/
git commit -m "feat(studio): add default ComfyUI workflow templates (FLUX.1-schnell)"
```

---

## Task 3: Extend StudioCanal Model + PATCH Route

**Files:**
- Modify: `src/models/StudioCanal.ts`
- Modify: `src/app/api/studio/canales/[id]/route.ts`

- [ ] **Step 1: Añadir tipos y campos al modelo StudioCanal**

En `src/models/StudioCanal.ts`, modificar la interfaz `CanalConfig` y el schema:

```typescript
// Añadir a la interfaz CanalConfig (después de gemini_api_key):
  comfyui_api_key?: string;
  comfyui_workflow_overrides?: {
    thumbnail?: string;
    cartel?: string;
    fondo?: string;
    video?: string;
    edit_image?: string;
    dj_photo?: string;
  };
```

Cambiar el enum de `imagen_motor` en la interfaz:
```typescript
// Antes:
  imagen_motor: 'huggingface' | 'freepik';
// Después:
  imagen_motor: 'huggingface' | 'freepik' | 'comfyui';
```

Añadir al schema de Mongoose (dentro del bloque `config:`):
```typescript
    imagen_motor: {
      type: String,
      enum: ['huggingface', 'freepik', 'comfyui'],
      default: 'freepik',
    },
    comfyui_api_key: { type: String, default: '' },
    comfyui_workflow_overrides: { type: Schema.Types.Mixed, default: {} },
```

- [ ] **Step 2: Actualizar la ruta PATCH de canales**

En `src/app/api/studio/canales/[id]/route.ts`, añadir dentro del bloque `if (body.X !== undefined)` tras `gemini_api_key`:

```typescript
  if (body.comfyui_api_key !== undefined) update['config.comfyui_api_key'] = body.comfyui_api_key;
  if (body.comfyui_workflow_overrides !== undefined)
    update['config.comfyui_workflow_overrides'] = body.comfyui_workflow_overrides;
```

- [ ] **Step 3: Verificar compilación**

```bash
cd /home/ubuntu/luisgranero-com
npx tsc --noEmit 2>&1 | grep -E "StudioCanal|canal"
```

Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/models/StudioCanal.ts src/app/api/studio/canales/[id]/route.ts
git commit -m "feat(studio): extend StudioCanal with comfyui_api_key and workflow_overrides"
```

---

## Task 4: New API Routes — comfyui/generate + comfyui/status

**Files:**
- Create: `src/app/api/studio/comfyui/generate/route.ts`
- Create: `src/app/api/studio/comfyui/status/route.ts`

- [ ] **Step 1: Crear ruta generate**

```typescript
// src/app/api/studio/comfyui/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import {
  runComfyWorkflow,
  submitComfyJob,
  type ComfyWorkflowType,
  type ComfyGenerateParams,
} from '@/lib/studio/comfyui-client';

const ASYNC_TYPES: ComfyWorkflowType[] = ['video'];

interface GenerateBody {
  tipo: ComfyWorkflowType;
  prompt: string;
  width?: number;
  height?: number;
  seed?: number;
  steps?: number;
  cfg?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }

  const body = (await request.json()) as GenerateBody;
  const { tipo, prompt, width, height, seed, steps, cfg } = body;

  if (!tipo || !prompt) {
    return NextResponse.json({ error: 'tipo y prompt son obligatorios' }, { status: 400 });
  }

  await connectDB();
  const canal = await StudioCanal.findById(session.canal_id).lean();
  const config = (canal as { config?: Record<string, unknown> } | null)?.config ?? {};
  const apiKey = config.comfyui_api_key as string | undefined;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key de ComfyUI no configurada para este canal' },
      { status: 400 }
    );
  }

  const overrides = (config.comfyui_workflow_overrides ?? {}) as Record<string, string>;
  const workflowOverride = overrides[tipo] as string | undefined;

  const params: ComfyGenerateParams = { prompt, width, height, seed, steps, cfg };

  try {
    if (ASYNC_TYPES.includes(tipo)) {
      const jobId = await submitComfyJob(tipo, params, apiKey, workflowOverride);
      return NextResponse.json({ jobId, status: 'pending' });
    }

    const buffer = await runComfyWorkflow(tipo, params, apiKey, workflowOverride);

    const outputDir = path.join(process.cwd(), 'public', 'studio', 'comfyui', tipo);
    await fs.mkdir(outputDir, { recursive: true });
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
    await fs.writeFile(path.join(outputDir, filename), buffer);

    return NextResponse.json({
      success: true,
      url: `/api/studio/comfyui/file/${tipo}/${filename}`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[comfyui/generate]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

- [ ] **Step 2: Crear ruta status**

```typescript
// src/app/api/studio/comfyui/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { pollComfyJob } from '@/lib/studio/comfyui-client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const jobId = request.nextUrl.searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json({ error: 'jobId es obligatorio' }, { status: 400 });
  }

  await connectDB();
  const canal = await StudioCanal.findById(session.canal_id).lean();
  const config = (canal as { config?: Record<string, unknown> } | null)?.config ?? {};
  const apiKey = config.comfyui_api_key as string | undefined;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key de ComfyUI no configurada' }, { status: 400 });
  }

  try {
    const result = await pollComfyJob(jobId, apiKey);

    if (result.status === 'completed' && result.buffer) {
      const outputDir = path.join(process.cwd(), 'public', 'studio', 'comfyui', 'video');
      await fs.mkdir(outputDir, { recursive: true });
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
      await fs.writeFile(path.join(outputDir, filename), result.buffer);
      return NextResponse.json({
        status: 'completed',
        url: `/api/studio/comfyui/file/video/${filename}`,
      });
    }

    return NextResponse.json({ status: result.status });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[comfyui/status]', msg);
    return NextResponse.json({ error: msg, status: 'failed' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Crear ruta de servicio de ficheros generados**

Los archivos se guardan en `public/studio/comfyui/`. Next.js puede servirlos directamente desde `public/`, no hace falta ruta extra. Cambiar la ruta de guardado para usar `/studio/comfyui/` como URL directa en lugar de `/api/studio/comfyui/file/`:

En `generate/route.ts`, cambiar:
```typescript
    return NextResponse.json({
      success: true,
      url: `/studio/comfyui/${tipo}/${filename}`,
    });
```

En `status/route.ts`, cambiar:
```typescript
      return NextResponse.json({
        status: 'completed',
        url: `/studio/comfyui/video/${filename}`,
      });
```

- [ ] **Step 4: Verificar compilación**

```bash
cd /home/ubuntu/luisgranero-com
npx tsc --noEmit 2>&1 | grep comfyui
```

Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/studio/comfyui/
git commit -m "feat(studio): ComfyUI generate + status API routes"
```

---

## Task 5: Integrate ComfyUI into generate-images Route

**Files:**
- Modify: `src/app/api/studio/generate-images/route.ts`

La ruta ya carga el `canal` y su `canalConfig`. Añadir una branch al inicio del handler, antes del bloque `const engine = await getImageEngine()`.

- [ ] **Step 1: Añadir imports**

Al inicio de `src/app/api/studio/generate-images/route.ts`, añadir:

```typescript
import { runComfyWorkflow } from '@/lib/studio/comfyui-client';
import { generateDistributedPrompts, STYLE_PREFIX_HF } from '@/lib/studio/image-prompts';
```

(STYLE_PREFIX_HF ya puede estar importado — verificar que no se duplique)

- [ ] **Step 2: Añadir branch ComfyUI después de cargar el canal**

En el handler POST, después de la línea que carga `canalConfig` (`const canalConfig = ...`), añadir:

```typescript
    // ── Modo ComfyUI ────────────────────────────────────────────────────────
    const rawCanal = canal as { config?: { imagen_motor?: string; comfyui_api_key?: string; comfyui_workflow_overrides?: Record<string, string> } } | null;
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
            script.guion_json, numImages, script.personaje, script.epoca, canalConfig, STYLE_PREFIX_HF
          );
          const imagesDir = path.join(publicDir, 'studio', 'images', sid);
          await fs.mkdir(imagesDir, { recursive: true });
          const imagesPaths: string[] = [];
          for (let i = 0; i < prompts.length; i++) {
            const buffer = await runComfyWorkflow('thumbnail', { prompt: prompts[i] }, comfyKey, overrides.thumbnail);
            const filename = `seccion-${i}.png`;
            await fs.writeFile(path.join(imagesDir, filename), buffer);
            imagesPaths.push(`/api/studio/image/${sid}/${filename}`);
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
```

Insertar este bloque DESPUÉS del cálculo de `numImages` e `imageDuration`, ANTES de `const engine = await getImageEngine()`.

- [ ] **Step 3: Verificar compilación**

```bash
npx tsc --noEmit 2>&1 | grep generate-images
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/studio/generate-images/route.ts
git commit -m "feat(studio): integrate ComfyUI into generate-images route"
```

---

## Task 6: Integrate ComfyUI into generate-thumbnail Route

**Files:**
- Modify: `src/app/api/studio/generate-thumbnail/route.ts`

- [ ] **Step 1: Añadir import**

En `src/app/api/studio/generate-thumbnail/route.ts`:

```typescript
import { runComfyWorkflow } from '@/lib/studio/comfyui-client';
```

- [ ] **Step 2: Añadir branch ComfyUI**

En el handler POST, después de cargar el canal (línea que asigna `canalConfig`), añadir una branch antes de la llamada a `generateFluxPrompt`. El patrón exacto de inserción: localizar dónde se genera el prompt y se llama a la función FLUX — añadir antes de ese bloque:

```typescript
    const rawCanal2 = canal as { config?: { imagen_motor?: string; comfyui_api_key?: string; comfyui_workflow_overrides?: Record<string, string> } } | null;
    if (rawCanal2?.config?.imagen_motor === 'comfyui') {
      const comfyKey = rawCanal2.config.comfyui_api_key;
      if (!comfyKey) throw new Error('API key ComfyUI no configurada');
      const overrides = rawCanal2.config.comfyui_workflow_overrides ?? {};
      const guionHook = (script.guion_json as Array<{ texto?: string }> | undefined)?.[0]?.texto ?? '';
      const fluxPrompt = await generateFluxPrompt(canalConfig, script.personaje as string, script.epoca as string, guionHook);
      const texts = await generateThumbnailTexts(canalConfig, script.personaje as string, script.epoca as string, guionHook);
      const imgBuffer = await runComfyWorkflow('thumbnail', { prompt: fluxPrompt }, comfyKey, overrides.thumbnail);
      // usar imgBuffer con el resto del pipeline de composición de miniaturas
      // (el resto del código de la ruta que añade texto sobre la imagen sigue igual)
      // Guardar como PNG temporal y continuar con el pipeline existente:
      await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
      const rawPath = path.join(THUMBNAILS_DIR, `raw-${script._id}.png`);
      await fs.promises.writeFile(rawPath, imgBuffer);
      // continuar pipeline normal con rawPath como imagen base...
    }
```

**Nota importante:** La ruta `generate-thumbnail` tiene un pipeline de composición con Sharp/Canvas para añadir texto. La integración de ComfyUI sólo reemplaza la *generación del fondo*; la composición de texto sigue igual. Lee el código completo de la ruta para encontrar el punto exacto donde se genera la imagen de fondo y reemplaza sólo esa llamada.

- [ ] **Step 3: Verificar compilación**

```bash
npx tsc --noEmit 2>&1 | grep generate-thumbnail
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/studio/generate-thumbnail/route.ts
git commit -m "feat(studio): integrate ComfyUI into generate-thumbnail route"
```

---

## Task 7: Integrate ComfyUI into generate-fondo Route

**Files:**
- Modify: `src/app/api/studio/carteles/generate-fondo/route.ts`

La ruta actualmente llama `generateFondoFlux(promptFlux, outputPath)` directamente, sin consultar `imagen_motor` del canal. Hay que:
1. Cargar el canal desde la sesión
2. Si `imagen_motor === 'comfyui'`, usar `runComfyWorkflow`
3. Si no, usar el flujo Flux existente

- [ ] **Step 1: Añadir imports**

```typescript
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { runComfyWorkflow } from '@/lib/studio/comfyui-client';
```

- [ ] **Step 2: Reemplazar llamada a generateFondoFlux con branch canal**

Localizar el bloque:
```typescript
    const promptFlux = buildFluxPrompt(color_hint ?? '', false, prompt ?? '');
    const id = randomUUID();
    const outputPath = path.join(FONDOS_DIR, `${id}.jpg`);
    await generateFondoFlux(promptFlux, outputPath);
```

Reemplazar con:
```typescript
    const promptFlux = buildFluxPrompt(color_hint ?? '', false, prompt ?? '');
    const id = randomUUID();
    const outputPath = path.join(FONDOS_DIR, `${id}.jpg`);

    await connectDB();
    const canal = await StudioCanal.findById(session.canal_id).lean();
    const canalCfg = (canal as { config?: { imagen_motor?: string; comfyui_api_key?: string; comfyui_workflow_overrides?: Record<string, string> } } | null)?.config;

    if (canalCfg?.imagen_motor === 'comfyui') {
      const comfyKey = canalCfg.comfyui_api_key;
      if (!comfyKey) throw new Error('API key ComfyUI no configurada');
      const overrides = canalCfg.comfyui_workflow_overrides ?? {};
      const buffer = await runComfyWorkflow('fondo', { prompt: promptFlux }, comfyKey, overrides.fondo);
      await fs.mkdir(FONDOS_DIR, { recursive: true });
      await fs.writeFile(outputPath, buffer);
    } else {
      await generateFondoFlux(promptFlux, outputPath);
    }
```

Cambiar `import fs` de `'fs/promises'` si aún no lo está (la ruta original usa `fs` de `'fs/promises'`).

- [ ] **Step 3: Verificar compilación**

```bash
npx tsc --noEmit 2>&1 | grep generate-fondo
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/studio/carteles/generate-fondo/route.ts
git commit -m "feat(studio): integrate ComfyUI into generate-fondo route"
```

---

## Task 8: UI — Sección ComfyUI en Configuración

**Files:**
- Modify: `src/app/studio/configuracion/page.tsx`

La página tiene 766 líneas. La sección ComfyUI se añade después de la sección LLM motor.

- [ ] **Step 1: Añadir estados al componente**

Después de `const [canalId, setCanalId] = useState<string | null>(null);`, añadir:

```typescript
  // ComfyUI
  const [comfyuiKey, setComfyuiKey] = useState('');
  const [savingComfyui, setSavingComfyui] = useState(false);
  const [comfyuiSaved, setComfyuiSaved] = useState(false);
  const [comfyuiWorkflows, setComfyuiWorkflows] = useState<Record<string, string>>({});
  const [uploadingWorkflow, setUploadingWorkflow] = useState<string | null>(null);
```

- [ ] **Step 2: Añadir función saveComfyuiConfig**

Después de la función `saveLLMConfig()`:

```typescript
  async function saveComfyuiKey() {
    if (!canalId || !comfyuiKey.trim()) return;
    setSavingComfyui(true);
    try {
      await fetch(`/api/studio/canales/${canalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comfyui_api_key: comfyuiKey.trim() }),
      });
      setComfyuiKey('');
      setComfyuiSaved(true);
      setTimeout(() => setComfyuiSaved(false), 2500);
    } finally {
      setSavingComfyui(false);
    }
  }

  async function handleWorkflowUpload(tipo: string, file: File) {
    if (!canalId) return;
    setUploadingWorkflow(tipo);
    try {
      const text = await file.text();
      JSON.parse(text); // validar JSON
      const current = await fetch(`/api/studio/canales/${canalId}`)
        .then((r) => r.json())
        .then((d: { canal?: { config?: { comfyui_workflow_overrides?: Record<string, string> } } }) =>
          d.canal?.config?.comfyui_workflow_overrides ?? {}
        );
      await fetch(`/api/studio/canales/${canalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comfyui_workflow_overrides: { ...current, [tipo]: text },
        }),
      });
      setComfyuiWorkflows((prev) => ({ ...prev, [tipo]: file.name }));
    } catch {
      alert('JSON inválido — revisa el fichero de workflow');
    } finally {
      setUploadingWorkflow(null);
    }
  }

  async function removeWorkflowOverride(tipo: string) {
    if (!canalId) return;
    const current = await fetch(`/api/studio/canales/${canalId}`)
      .then((r) => r.json())
      .then((d: { canal?: { config?: { comfyui_workflow_overrides?: Record<string, string> } } }) =>
        d.canal?.config?.comfyui_workflow_overrides ?? {}
      );
    const updated = { ...current };
    delete updated[tipo];
    await fetch(`/api/studio/canales/${canalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comfyui_workflow_overrides: updated }),
    });
    setComfyuiWorkflows((prev) => {
      const next = { ...prev };
      delete next[tipo];
      return next;
    });
  }
```

- [ ] **Step 3: Cargar workflow overrides en useEffect**

Dentro del `.then()` que carga el canal (donde se hace `setCanalId`, `setLlmMotor`), añadir:

```typescript
          const overrides = d.canal.config?.comfyui_workflow_overrides ?? {};
          const overrideNames: Record<string, string> = {};
          for (const key of Object.keys(overrides)) {
            overrideNames[key] = 'personalizado';
          }
          setComfyuiWorkflows(overrideNames);
```

- [ ] **Step 4: Añadir sección ComfyUI en el JSX**

Localizar el cierre de la sección LLM motor (buscar el último `</section>` o `</div>` de esa sección). Añadir después:

```tsx
        {/* ── ComfyUI ──────────────────────────────────────────────────── */}
        {canalId && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">ComfyUI Cloud</h2>

            {/* API Key */}
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="API Key de ComfyUI Cloud"
                value={comfyuiKey}
                onChange={(e) => setComfyuiKey(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={saveComfyuiKey}
                disabled={savingComfyui || !comfyuiKey.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {savingComfyui ? 'Guardando...' : comfyuiSaved ? 'Guardada ✓' : 'Guardar'}
              </button>
            </div>

            {/* Workflow overrides */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Workflows personalizados
              </p>
              {(['thumbnail', 'cartel', 'fondo', 'video', 'edit_image', 'dj_photo'] as const).map(
                (tipo) => (
                  <div key={tipo} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                    <span className="text-sm text-gray-300 capitalize">{tipo.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {comfyuiWorkflows[tipo] ?? 'default'}
                      </span>
                      {comfyuiWorkflows[tipo] && (
                        <button
                          onClick={() => removeWorkflowOverride(tipo)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      )}
                      <label className="cursor-pointer rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20">
                        {uploadingWorkflow === tipo ? '...' : 'Subir'}
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleWorkflowUpload(tipo, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )
              )}
            </div>

            <p className="text-xs text-gray-500">
              Para activar ComfyUI, selecciona &quot;ComfyUI&quot; como motor de imagen en el canal.
              Los workflows deben exportarse desde ComfyUI en formato API (no workflow).
            </p>
          </section>
        )}
```

- [ ] **Step 5: Añadir 'comfyui' al selector imagen_motor del canal**

En la configuración de canales, el `imagen_motor` se gestiona vía la sección de config de canal o en la página de canales. Buscar en `configuracion/page.tsx` o en `src/app/studio/canales/page.tsx` el selector de `imagen_motor` y añadir la opción:

Si en `canales/page.tsx` hay un selector, añadir:
```tsx
<option value="comfyui">ComfyUI</option>
```

Si el selector usa un array de opciones, añadir `{ id: 'comfyui', label: 'ComfyUI', desc: 'cloud.comfy.org' }`.

- [ ] **Step 6: Verificar compilación**

```bash
npx tsc --noEmit 2>&1 | grep configuracion
```

- [ ] **Step 7: Commit**

```bash
git add src/app/studio/configuracion/page.tsx src/app/studio/canales/
git commit -m "feat(studio): ComfyUI config section — API key + workflow overrides"
```

---

## Task 9: Build, Deploy y Verificación Manual

- [ ] **Step 1: Build completo**

```bash
cd /home/ubuntu/luisgranero-com
npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

- [ ] **Step 2: Restart PM2**

```bash
pm2 restart luisgranero-com
pm2 logs luisgranero-com --lines 20 --nostream
```

Expected: sin errores de startup.

- [ ] **Step 3: Verificación manual**

1. Ir a `/studio/configuracion`
2. Confirmar que aparece la sección "ComfyUI Cloud"
3. Introducir una API key de prueba y guardar — confirmar que no da error
4. Subir un workflow JSON válido para thumbnail — confirmar que se guarda y aparece "personalizado"
5. En el canal, cambiar `imagen_motor` a "comfyui"
6. Generar una imagen de prueba — confirmar que llega al endpoint de ComfyUI

- [ ] **Step 4: Commit final si hay ajustes de build**

```bash
git add -A
git commit -m "feat(studio): ComfyUI Cloud integration complete"
```

---

## Notas de implementación

- **Workflows FLUX.1-schnell:** Los modelos `flux1-schnell.safetensors`, `ae.safetensors`, `t5xxl_fp8_e4m3fn.safetensors`, `clip_l.safetensors` deben estar disponibles en tu cuenta de ComfyUI Cloud. Si usas otros modelos, sube tus propios workflows via la UI.
- **Vídeo real:** El workflow `video.json` por defecto genera una imagen fija. Para vídeo real (AnimateDiff, WanVideo), exporta el workflow desde ComfyUI en formato API y súbelo como override desde Configuración.
- **URL de archivos ComfyUI:** Los archivos se guardan en `public/studio/comfyui/` y se sirven directamente por Next.js desde `/studio/comfyui/`.
- **Rate limits:** La función `submitWithRetry` reintenta 3 veces con backoff 1s/2s/4s ante errores 429.
