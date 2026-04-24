# Pipeline Música Ambiental — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir soporte para un segundo tipo de pipeline en el Studio — "música ambiental" — que genera vídeos lo-fi de 30 min a 3 horas con imagen FLUX animada y música en bucle.

**Architecture:** El tipo de pipeline se almacena en `StudioCanal.pipeline_tipo`. `StudioLayout` muestra nav items distintos según el canal activo. El formulario de creación de canal añade un paso 2 de selección de pipeline. La generación sigue el patrón existente: POST devuelve `{ status: 'processing', video_id }` inmediatamente y ejecuta FFmpeg en background; el frontend hace polling.

**Tech Stack:** Next.js App Router, MongoDB/Mongoose, FFmpeg (spawn), HuggingFace FLUX / Freepik para imagen, Tailwind CSS, TypeScript.

---

## File Structure

**Nuevos:**
- `src/models/StudioMusicaAmbiental.ts` — Modelo Mongoose nueva colección
- `src/app/api/studio/musica-ambiental/route.ts` — GET lista de vídeos del canal
- `src/app/api/studio/musica-ambiental/[id]/route.ts` — GET detalle + PATCH estado
- `src/app/api/studio/musica-ambiental/preview/route.ts` — POST genera imagen FLUX (1920×1080)
- `src/app/api/studio/musica-ambiental/generate/route.ts` — POST pipeline FFmpeg completo
- `src/app/api/studio/musica-ambiental/imagen/[filename]/route.ts` — Serving imagen preview
- `src/app/api/studio/musica-ambiental/video/[filename]/route.ts` — Serving vídeo final (range)
- `src/app/studio/musica-ambiental/nuevo/page.tsx` — Formulario creación vídeo musical

**Modificados:**
- `src/models/StudioCanal.ts` — añadir `pipeline_tipo`
- `src/app/api/studio/canales/route.ts` — GET incluye `pipeline_tipo`; POST acepta `pipeline_tipo`
- `src/app/api/studio/canales/[id]/route.ts` — PATCH allowlist añade `pipeline_tipo`
- `src/app/api/studio/upload-youtube/route.ts` — soporte `tipo: 'musica_ambiental'`
- `src/components/studio/StudioLayout.tsx` — nav dinámico por `pipeline_tipo`
- `src/app/studio/canales/page.tsx` — formulario de dos pasos con selector de pipeline
- `src/app/studio/historial/page.tsx` — vista condicional por tipo de pipeline

---

## Task 1: StudioCanal — campo `pipeline_tipo`

**Files:**
- Modify: `src/models/StudioCanal.ts`
- Modify: `src/app/api/studio/canales/route.ts`
- Modify: `src/app/api/studio/canales/[id]/route.ts`

- [ ] **Step 1: Añadir `pipeline_tipo` a la interfaz TypeScript y al schema Mongoose**

En `src/models/StudioCanal.ts`, añadir en la interfaz `IStudioCanal` (después de `nicho`):

```ts
pipeline_tipo: 'narrativo' | 'musica_ambiental';
```

Y en `StudioCanalSchema` (después de `nicho`):

```ts
pipeline_tipo: { type: String, enum: ['narrativo', 'musica_ambiental'], default: 'narrativo' },
```

El archivo resultante (solo la parte modificada):

```ts
export interface IStudioCanal extends Document {
  workspace_id: string;
  nombre: string;
  descripcion: string;
  nicho: string;
  pipeline_tipo: 'narrativo' | 'musica_ambiental';
  logo_url: string;
  youtube_tokens: YoutubeTokensCanal | null;
  config: CanalConfig;
  creado_en: Date;
}

const StudioCanalSchema = new Schema<IStudioCanal>({
  workspace_id: { type: String, required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, default: '' },
  nicho: { type: String, default: '' },
  pipeline_tipo: { type: String, enum: ['narrativo', 'musica_ambiental'], default: 'narrativo' },
  logo_url: { type: String, default: '' },
  // ... resto sin cambios
```

- [ ] **Step 2: Incluir `pipeline_tipo` en el GET list de canales**

En `src/app/api/studio/canales/route.ts`, cambiar el `.select()` y el mapeo:

```ts
const canales = await StudioCanal.find({ workspace_id: session.workspace_id })
  .select('_id nombre nicho descripcion pipeline_tipo youtube_tokens creado_en')
  .lean();

const result = canales.map((c) => ({
  _id: c._id.toString(),
  nombre: c.nombre,
  nicho: c.nicho,
  descripcion: c.descripcion,
  pipeline_tipo: c.pipeline_tipo ?? 'narrativo',
  youtube_conectado: !!c.youtube_tokens,
  creado_en: c.creado_en,
}));
```

También en el tipo del body del POST, añadir `pipeline_tipo?`:

```ts
const body = (await request.json()) as {
  nombre?: string;
  nicho?: string;
  descripcion?: string;
  tono?: string;
  system_prompt_guion?: string;
  idioma?: string;
  pipeline_tipo?: 'narrativo' | 'musica_ambiental';
};
```

Y en `StudioCanal.create(...)`, añadir el campo:

```ts
const canal = await StudioCanal.create({
  workspace_id: session.workspace_id,
  nombre: body.nombre.trim(),
  nicho: body.nicho?.trim() ?? '',
  descripcion: body.descripcion?.trim() ?? '',
  pipeline_tipo: body.pipeline_tipo ?? 'narrativo',
  youtube_tokens: null,
  config: {
    voz_motor: 'elevenlabs',
    voz_id: '',
    imagen_motor: 'freepik',
    system_prompt_guion: body.system_prompt_guion?.trim() ?? '',
    tono: body.tono?.trim() ?? '',
    idioma: body.idioma?.trim() ?? 'es-ES',
  },
});
```

- [ ] **Step 3: Añadir `pipeline_tipo` al allowlist del PATCH**

En `src/app/api/studio/canales/[id]/route.ts`, añadir después de la línea de `descripcion`:

```ts
if (body.pipeline_tipo !== undefined) update['pipeline_tipo'] = body.pipeline_tipo;
```

- [ ] **Step 4: Verificar que compila sin errores TypeScript**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | grep -E "StudioCanal|pipeline_tipo" | head -20
```

Esperado: sin errores relacionados con `pipeline_tipo`.

- [ ] **Step 5: Commit**

```bash
git add src/models/StudioCanal.ts src/app/api/studio/canales/route.ts src/app/api/studio/canales/\[id\]/route.ts
git commit -m "feat(studio): add pipeline_tipo field to StudioCanal model and canales API"
```

---

## Task 2: Modelo `StudioMusicaAmbiental`

**Files:**
- Create: `src/models/StudioMusicaAmbiental.ts`

- [ ] **Step 1: Crear el modelo Mongoose**

```ts
// src/models/StudioMusicaAmbiental.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface TextoOverlay {
  activo: boolean;
  linea1: string;
  linea2: string;
  color: string;
  posicion: 'top' | 'center' | 'bottom';
}

export interface IStudioMusicaAmbiental extends Document {
  canal_id: string;
  workspace_id: string;
  mood: string;
  prompt_flux: string;
  imagen_path: string;
  musica_path: string;
  musica_nombre: string;
  duracion_horas: number;
  efectos: string[];
  titulo: string;
  descripcion: string;
  texto_overlay: TextoOverlay | null;
  video_path: string | null;
  youtube_id: string | null;
  youtube_url: string | null;
  estado: 'pendiente' | 'generando_video' | 'listo' | 'error';
  error_msg: string | null;
  scheduled_at: Date | null;
  creado_en: Date;
}

const TextoOverlaySchema = new Schema<TextoOverlay>({
  activo: { type: Boolean, default: false },
  linea1: { type: String, default: '' },
  linea2: { type: String, default: '' },
  color: { type: String, default: '#ffffff' },
  posicion: { type: String, enum: ['top', 'center', 'bottom'], default: 'bottom' },
}, { _id: false });

const StudioMusicaAmbientalSchema = new Schema<IStudioMusicaAmbiental>({
  canal_id: { type: String, required: true, index: true },
  workspace_id: { type: String, required: true, index: true },
  mood: { type: String, required: true },
  prompt_flux: { type: String, default: '' },
  imagen_path: { type: String, default: '' },
  musica_path: { type: String, default: '' },
  musica_nombre: { type: String, default: '' },
  duracion_horas: { type: Number, default: 1 },
  efectos: { type: [String], default: [] },
  titulo: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  texto_overlay: { type: TextoOverlaySchema, default: null },
  video_path: { type: String, default: null },
  youtube_id: { type: String, default: null },
  youtube_url: { type: String, default: null },
  estado: {
    type: String,
    enum: ['pendiente', 'generando_video', 'listo', 'error'],
    default: 'pendiente',
  },
  error_msg: { type: String, default: null },
  scheduled_at: { type: Date, default: null },
  creado_en: { type: Date, default: Date.now },
});

const StudioMusicaAmbiental: Model<IStudioMusicaAmbiental> =
  mongoose.models.StudioMusicaAmbiental ||
  mongoose.model<IStudioMusicaAmbiental>('StudioMusicaAmbiental', StudioMusicaAmbientalSchema);

export default StudioMusicaAmbiental;
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | grep "StudioMusicaAmbiental" | head -10
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/models/StudioMusicaAmbiental.ts
git commit -m "feat(studio): add StudioMusicaAmbiental Mongoose model"
```

---

## Task 3: API CRUD para `musica-ambiental`

**Files:**
- Create: `src/app/api/studio/musica-ambiental/route.ts`
- Create: `src/app/api/studio/musica-ambiental/[id]/route.ts`

- [ ] **Step 1: Crear ruta GET de lista**

```ts
// src/app/api/studio/musica-ambiental/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioMusicaAmbiental from '@/models/StudioMusicaAmbiental';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  await connectDB();
  const videos = await StudioMusicaAmbiental.find({
    canal_id: session.canal_id,
    workspace_id: session.workspace_id,
  })
    .sort({ creado_en: -1 })
    .lean();

  return NextResponse.json({
    videos: videos.map((v) => ({ ...v, _id: v._id.toString() })),
  });
}
```

- [ ] **Step 2: Crear ruta GET/PATCH de detalle**

```ts
// src/app/api/studio/musica-ambiental/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioMusicaAmbiental from '@/models/StudioMusicaAmbiental';
import { getStudioSession } from '@/lib/studio/session';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const video = await StudioMusicaAmbiental.findOne({
    _id: id,
    workspace_id: session.workspace_id,
  }).lean();

  if (!video) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({ video: { ...video, _id: video._id.toString() } });
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  const update: Record<string, unknown> = {};
  if (body.youtube_id !== undefined) update['youtube_id'] = body.youtube_id;
  if (body.youtube_url !== undefined) update['youtube_url'] = body.youtube_url;
  if (body.estado !== undefined) update['estado'] = body.estado;
  if (body.error_msg !== undefined) update['error_msg'] = body.error_msg;
  if (body.scheduled_at !== undefined) update['scheduled_at'] = body.scheduled_at;

  await connectDB();
  const video = await StudioMusicaAmbiental.findOneAndUpdate(
    { _id: id, workspace_id: session.workspace_id },
    { $set: update },
    { new: true }
  ).lean();

  if (!video) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({ success: true, video: { ...video, _id: video._id.toString() } });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/studio/musica-ambiental/route.ts src/app/api/studio/musica-ambiental/\[id\]/route.ts
git commit -m "feat(studio): add musica-ambiental CRUD API routes"
```

---

## Task 4: File serving routes

**Files:**
- Create: `src/app/api/studio/musica-ambiental/imagen/[filename]/route.ts`
- Create: `src/app/api/studio/musica-ambiental/video/[filename]/route.ts`

- [ ] **Step 1: Crear ruta serving de imagen**

```ts
// src/app/api/studio/musica-ambiental/imagen/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface RouteParams { params: Promise<{ filename: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { filename } = await params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'studio', 'musica-ambiental', 'imagenes', safeFilename);
    const buffer = await fs.readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=2592000',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
```

- [ ] **Step 2: Crear ruta serving de vídeo (con Range support)**

```ts
// src/app/api/studio/musica-ambiental/video/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { createReadStream, statSync } from 'fs';
import path from 'path';

interface RouteParams { params: Promise<{ filename: string }> }

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { filename } = await params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'studio', 'musica-ambiental', 'videos', safeFilename);

    await fs.access(filePath);
    const stat = statSync(filePath);
    const fileSize = stat.size;
    const rangeHeader = request.headers.get('range');

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const stream = createReadStream(filePath, { start, end });
      return new NextResponse(stream as unknown as ReadableStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': 'video/mp4',
          'Cache-Control': 'public, max-age=2592000',
        },
      });
    }

    const buffer = await fs.readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Content-Length': String(fileSize),
        'Cache-Control': 'public, max-age=2592000',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
```

- [ ] **Step 3: Crear los directorios de output**

```bash
mkdir -p /home/ubuntu/luisgranero-com/public/studio/musica-ambiental/imagenes
mkdir -p /home/ubuntu/luisgranero-com/public/studio/musica-ambiental/videos
mkdir -p /home/ubuntu/luisgranero-com/public/studio/efectos
touch /home/ubuntu/luisgranero-com/public/studio/efectos/.gitkeep
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/studio/musica-ambiental/imagen src/app/api/studio/musica-ambiental/video public/studio/efectos/.gitkeep
git commit -m "feat(studio): add file serving routes for musica-ambiental assets"
```

---

## Task 5: Preview route (imagen FLUX 1920×1080)

**Files:**
- Create: `src/app/api/studio/musica-ambiental/preview/route.ts`

- [ ] **Step 1: Crear la ruta de preview**

Sigue exactamente el mismo patrón que `generate-cartel-ia/route.ts` pero con resolución 1920×1080 y ruta de output diferente.

```ts
// src/app/api/studio/musica-ambiental/preview/route.ts
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
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | grep "musica-ambiental/preview" | head -10
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/studio/musica-ambiental/preview/
git commit -m "feat(studio): add musica-ambiental preview route (FLUX 1920x1080)"
```

---

## Task 6: Generate route (pipeline FFmpeg completo)

**Files:**
- Create: `src/app/api/studio/musica-ambiental/generate/route.ts`

- [ ] **Step 1: Crear la ruta de generación**

Esta ruta recibe los datos del formulario, crea el documento MongoDB, y ejecuta el pipeline FFmpeg en background.

```ts
// src/app/api/studio/musica-ambiental/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioMusicaAmbiental from '@/models/StudioMusicaAmbiental';
import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

const execAsync = promisify(exec);

const VIDEOS_DIR = path.join(process.cwd(), 'public', 'studio', 'musica-ambiental', 'videos');
const IMAGENES_DIR = path.join(process.cwd(), 'public', 'studio', 'musica-ambiental', 'imagenes');
const EFECTOS_DIR = path.join(process.cwd(), 'public', 'studio', 'efectos');

interface GenerateBody {
  mood: string;
  prompt_flux: string;
  imagen_path: string;      // ruta relativa: /studio/musica-ambiental/imagenes/xxx.jpg
  musica_base64?: string;   // archivo de música en base64 (si se subió desde el formulario)
  musica_nombre?: string;
  musica_track_path?: string; // ruta absoluta del track de la biblioteca
  duracion_horas: number;
  efectos: string[];
  titulo: string;
  descripcion: string;
  texto_overlay: {
    activo: boolean;
    linea1: string;
    linea2: string;
    color: string;
    posicion: 'top' | 'center' | 'bottom';
  } | null;
}

function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const stderr: string[] = [];
    proc.stderr?.on('data', (d: Buffer) => stderr.push(d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg código ${code}: ${stderr.slice(-5).join('')}`));
    });
    proc.on('error', reject);
  });
}

function buildEfectosFilter(efectos: string[], duracion: number): string {
  const parts: string[] = [];

  if (efectos.includes('parpadeo_luces')) {
    parts.push("eq=brightness='0.03*sin(t/3)'");
  }
  if (efectos.includes('niebla')) {
    // overlay blanco muy suave que pulsa lentamente
    parts.push("colorchannelmixer=rr=1.02:gg=1.02:bb=1.02");
  }
  if (efectos.includes('neon_parpadeo')) {
    parts.push("eq=saturation='1.1+0.1*sin(t*2)'");
  }

  return parts.length > 0 ? parts.join(',') : '';
}

function buildDrawtext(overlay: NonNullable<GenerateBody['texto_overlay']>): string {
  if (!overlay.activo) return '';

  const color = overlay.color.replace('#', '');
  const yMap: Record<string, string> = {
    top: 'h*0.1',
    center: '(h-text_h)/2',
    bottom: 'h*0.82',
  };

  const lines: string[] = [];
  if (overlay.linea1) {
    lines.push(`drawtext=text='${overlay.linea1.replace(/'/g, "\\'")}':fontsize=72:fontcolor=0x${color}:borderw=3:bordercolor=black:x=(w-text_w)/2:y=${yMap[overlay.posicion]}`);
  }
  if (overlay.linea2) {
    const y2 = overlay.posicion === 'top' ? 'h*0.1+90' : overlay.posicion === 'center' ? '(h-text_h)/2+90' : 'h*0.82+90';
    lines.push(`drawtext=text='${overlay.linea2.replace(/'/g, "\\'")}':fontsize=54:fontcolor=0x${color}:borderw=2:bordercolor=black:x=(w-text_w)/2:y=${y2}`);
  }

  return lines.join(',');
}

async function generateBackground(
  videoId: string,
  imagenAbsPath: string,
  musicaAbsPath: string,
  duracion: number,
  efectos: string[],
  textoOverlay: GenerateBody['texto_overlay']
): Promise<void> {
  mkdirSync(VIDEOS_DIR, { recursive: true });

  const durSec = Math.round(duracion * 3600);
  const tmpDir = path.join(VIDEOS_DIR, `tmp-${videoId}`);
  await fs.mkdir(tmpDir, { recursive: true });

  const musicaLoopPath = path.join(tmpDir, 'musica_loop.mp3');
  const outputPath = path.join(VIDEOS_DIR, `${videoId}.mp4`);

  try {
    // Paso 1: loop de música
    await runFFmpeg([
      '-stream_loop', '-1',
      '-i', musicaAbsPath,
      '-t', String(durSec),
      '-af', `afade=t=in:d=3,afade=t=out:st=${durSec - 3}:d=3`,
      '-y', musicaLoopPath,
    ]);

    // Paso 2: efectos de overlay (ficheros mp4 en /public/studio/efectos/)
    const overlayInputs: string[] = [];
    const overlayFilters: string[] = [];
    let videoTag = '[0:v]';

    const efectosConOverlay = ['lluvia', 'lluvia_suave', 'vapor_cafe', 'particulas_luz', 'olas_suaves'];
    let inputIdx = 1; // 0=imagen, 1+=overlays

    for (const efecto of efectos) {
      if (!efectosConOverlay.includes(efecto)) continue;
      const overlayFile = path.join(EFECTOS_DIR, `${efecto}.mp4`);
      if (!existsSync(overlayFile)) continue;

      overlayInputs.push('-stream_loop', '-1', '-i', overlayFile);
      const nextTag = `[v${inputIdx}]`;
      overlayFilters.push(`${videoTag}[${inputIdx}:v]overlay=format=auto:shortest=1${nextTag}`);
      videoTag = nextTag;
      inputIdx++;
    }

    // Paso 3: filtros FFmpeg puros (no necesitan fichero)
    const pureFilter = buildEfectosFilter(efectos, durSec);
    if (pureFilter) {
      const nextTag = `[vfinal]`;
      overlayFilters.push(`${videoTag}${pureFilter}${nextTag}`);
      videoTag = nextTag;
    }

    // Paso 4: texto overlay
    const drawtextFilter = textoOverlay?.activo ? buildDrawtext(textoOverlay) : '';
    if (drawtextFilter) {
      const nextTag = `[vtext]`;
      overlayFilters.push(`${videoTag}${drawtextFilter}${nextTag}`);
      videoTag = nextTag;
    }

    // Construir el comando FFmpeg final
    const args: string[] = [
      '-loop', '1',
      '-i', imagenAbsPath,
      '-i', musicaLoopPath,
      ...overlayInputs,
    ];

    if (overlayFilters.length > 0) {
      args.push('-filter_complex', overlayFilters.join(';'));
      args.push('-map', videoTag);
      args.push('-map', '1:a');
    }

    args.push(
      '-c:v', 'libx264',
      '-tune', 'stillimage',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-pix_fmt', 'yuv420p',
      '-t', String(durSec),
      '-y', outputPath,
    );

    await runFFmpeg(args);

    // Limpiar tmp
    await fs.rm(tmpDir, { recursive: true, force: true });

    // Actualizar MongoDB
    await connectDB();
    await StudioMusicaAmbiental.findByIdAndUpdate(videoId, {
      $set: {
        video_path: `/api/studio/musica-ambiental/video/${videoId}.mp4`,
        estado: 'listo',
      },
    });

    console.log(`✅ Vídeo musical listo: ${videoId}`);
  } catch (err) {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => null);
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[musica-ambiental/generate]', msg);
    await connectDB();
    await StudioMusicaAmbiental.findByIdAndUpdate(videoId, {
      $set: { estado: 'error', error_msg: msg.slice(0, 500) },
    });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  try {
    const body = await request.json() as GenerateBody;

    if (!body.imagen_path) return NextResponse.json({ error: 'imagen_path es obligatorio' }, { status: 400 });
    if (!body.musica_base64 && !body.musica_track_path) {
      return NextResponse.json({ error: 'Se requiere archivo de música o track de biblioteca' }, { status: 400 });
    }

    await connectDB();

    // Crear documento en MongoDB
    const doc = await StudioMusicaAmbiental.create({
      canal_id: session.canal_id,
      workspace_id: session.workspace_id,
      mood: body.mood,
      prompt_flux: body.prompt_flux,
      imagen_path: body.imagen_path,
      musica_nombre: body.musica_nombre ?? 'track',
      duracion_horas: body.duracion_horas,
      efectos: body.efectos,
      titulo: body.titulo,
      descripcion: body.descripcion,
      texto_overlay: body.texto_overlay,
      estado: 'generando_video',
    });

    const videoId = doc._id.toString();
    const imagenAbsPath = path.join(process.cwd(), 'public', body.imagen_path);

    // Guardar el archivo de música en disco
    let musicaAbsPath: string;
    if (body.musica_track_path) {
      musicaAbsPath = body.musica_track_path;
    } else {
      const musicaDir = path.join(VIDEOS_DIR, '..', 'musica');
      mkdirSync(musicaDir, { recursive: true });
      const musicaFilename = `${videoId}-musica.${body.musica_nombre?.split('.').pop() ?? 'mp3'}`;
      musicaAbsPath = path.join(musicaDir, musicaFilename);
      const buffer = Buffer.from(body.musica_base64!, 'base64');
      await fs.writeFile(musicaAbsPath, buffer);
    }

    await StudioMusicaAmbiental.findByIdAndUpdate(videoId, {
      $set: { musica_path: musicaAbsPath },
    });

    // Lanzar en background
    generateBackground(
      videoId,
      imagenAbsPath,
      musicaAbsPath,
      body.duracion_horas,
      body.efectos,
      body.texto_overlay
    ).catch(console.error);

    return NextResponse.json({ status: 'processing', video_id: videoId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('[musica-ambiental/generate] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | grep "musica-ambiental/generate" | head -10
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/studio/musica-ambiental/generate/
git commit -m "feat(studio): add musica-ambiental FFmpeg generation pipeline"
```

---

## Task 7: Upload YouTube — soporte `musica_ambiental`

**Files:**
- Modify: `src/app/api/studio/upload-youtube/route.ts`

- [ ] **Step 1: Añadir el import del nuevo modelo**

En `src/app/api/studio/upload-youtube/route.ts`, después de `import StudioScript`:

```ts
import StudioMusicaAmbiental from '@/models/StudioMusicaAmbiental';
```

- [ ] **Step 2: Ampliar `UploadBody` con `tipo`**

Cambiar la interfaz:

```ts
interface UploadBody {
  scriptId: string;
  titulo: string;
  descripcion: string;
  tags: string[];
  visibilidad: 'public' | 'unlisted' | 'private';
  publishAt?: string;
  tipo?: 'musica_ambiental';  // si no viene, asume narrativo (StudioScript)
}
```

- [ ] **Step 3: Extraer `uploadBackground` genérico**

Sustituir la función `uploadBackground` existente por dos versiones especializadas. Primero, crear una función interna compartida para la lógica de YouTube:

```ts
async function doYoutubeUpload(
  videoAbsPath: string,
  canalId: string,
  metadata: { titulo: string; descripcion: string; tags: string[]; visibilidad: string; publishAt?: string }
): Promise<string> {
  const fileSize = statSync(videoAbsPath).size;
  const accessToken = await getValidAccessTokenForCanal(canalId);

  let uploadUri: string;
  try {
    uploadUri = await initiateResumableUpload(accessToken, metadata, fileSize);
  } catch (tagsErr) {
    const msg = tagsErr instanceof Error ? tagsErr.message : '';
    if (msg.includes('invalidTags')) {
      console.warn('[upload-youtube] invalidTags — reintentando sin tags');
      uploadUri = await initiateResumableUpload(accessToken, { ...metadata, tags: [] }, fileSize);
    } else {
      throw tagsErr;
    }
  }

  return uploadVideoStream(uploadUri, videoAbsPath, fileSize);
}
```

Después, sustituir `uploadBackground` con versión que detecta el tipo:

```ts
async function uploadBackground(
  scriptId: string,
  canalId: string,
  videoAbsPath: string,
  metadata: { titulo: string; descripcion: string; tags: string[]; visibilidad: string; publishAt?: string },
  tipo?: 'musica_ambiental'
) {
  try {
    const videoId = await doYoutubeUpload(videoAbsPath, canalId, metadata);
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    await connectDB();

    if (tipo === 'musica_ambiental') {
      await StudioMusicaAmbiental.findByIdAndUpdate(scriptId, {
        $set: { youtube_id: videoId, youtube_url: youtubeUrl },
      });
    } else {
      const s = await StudioScript.findById(scriptId);
      if (s) {
        s.youtube_id = videoId;
        s.youtube_url = youtubeUrl;
        s.youtube_status = 'ready';
        if (metadata.publishAt) s.youtube_scheduled_at = new Date(metadata.publishAt);
        else s.youtube_published_at = new Date();
        await s.save();
      }
    }

    console.log(`✅ Vídeo subido a YouTube: ${youtubeUrl}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('Error subiendo a YouTube:', msg);
    await connectDB();

    if (tipo === 'musica_ambiental') {
      await StudioMusicaAmbiental.findByIdAndUpdate(scriptId, {
        $set: { youtube_url: null },
      });
    } else {
      const s = await StudioScript.findById(scriptId);
      if (s) { s.youtube_status = 'error'; s.youtube_error = msg.slice(0, 500); await s.save(); }
    }
  }
}
```

- [ ] **Step 4: Actualizar el handler POST para detectar el tipo**

En la función `POST`, sustituir la sección que obtiene `videoAbsPath`:

```ts
const tipo = body.tipo;

let videoAbsPath: string;
if (tipo === 'musica_ambiental') {
  const videoDoc = await StudioMusicaAmbiental.findById(body.scriptId);
  if (!videoDoc) return NextResponse.json({ error: 'Vídeo musical no encontrado' }, { status: 404 });
  if (!videoDoc.video_path) return NextResponse.json({ error: 'El vídeo no está generado aún' }, { status: 400 });
  const filename = path.basename(videoDoc.video_path);
  videoAbsPath = path.join(process.cwd(), 'public', 'studio', 'musica-ambiental', 'videos', filename);
} else {
  const script = await StudioScript.findById(body.scriptId);
  if (!script) return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
  if (!script.video_path) return NextResponse.json({ error: 'El guión no tiene vídeo generado' }, { status: 400 });
  if (script.youtube_status === 'processing') return NextResponse.json({ status: 'processing', message: 'Ya está subiendo' });
  const videoFilename = script.video_path.replace('/api/studio/video/', '');
  videoAbsPath = path.join(process.cwd(), 'public', 'studio', 'videos', path.basename(videoFilename));
  script.youtube_status = 'processing';
  script.youtube_error = undefined;
  await script.save();
}

try { statSync(videoAbsPath); } catch {
  return NextResponse.json({ error: 'Fichero de vídeo no encontrado' }, { status: 404 });
}

// ... metadata y llamada a uploadBackground ...
uploadBackground(body.scriptId, session.canal_id, videoAbsPath, metadata, tipo).catch(console.error);
```

- [ ] **Step 5: Verificar TypeScript**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | grep "upload-youtube" | head -10
```

Esperado: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/studio/upload-youtube/route.ts
git commit -m "feat(studio): upload-youtube supports tipo=musica_ambiental"
```

---

## Task 8: StudioLayout — nav dinámico por `pipeline_tipo`

**Files:**
- Modify: `src/components/studio/StudioLayout.tsx`

- [ ] **Step 1: Ampliar `CanalInfo` con `pipeline_tipo`**

Cambiar la interfaz al inicio del fichero:

```ts
interface CanalInfo { _id: string; nombre: string; nicho: string; pipeline_tipo?: string }
```

- [ ] **Step 2: Sustituir `NAV_ITEMS` estático por objeto de configuración**

Eliminar el array `const NAV_ITEMS = [...]` completo y sustituirlo por:

```ts
interface NavItem { href: string; label: string; exact: boolean; icon: JSX.Element }

const ICON_PLUS = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const ICON_HISTORY = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
  </svg>
);
const ICON_CALENDAR = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);
const ICON_IMAGE = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
const ICON_CHANNELS = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
  </svg>
);
const ICON_SETTINGS = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const ICON_MUSIC = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
  </svg>
);

const NAV_POR_PIPELINE: Record<string, NavItem[]> = {
  narrativo: [
    { href: '/studio',               label: 'Nuevo vídeo',   exact: true,  icon: ICON_PLUS     },
    { href: '/studio/historial',     label: 'Historial',     exact: false, icon: ICON_HISTORY  },
    { href: '/studio/calendario',    label: 'Calendario',    exact: false, icon: ICON_CALENDAR },
    { href: '/studio/carteles',      label: 'Carteles',      exact: false, icon: ICON_IMAGE    },
    { href: '/studio/canales',       label: 'Canales',       exact: false, icon: ICON_CHANNELS },
    { href: '/studio/configuracion', label: 'Configuración', exact: false, icon: ICON_SETTINGS },
  ],
  musica_ambiental: [
    { href: '/studio/musica-ambiental/nuevo', label: 'Nuevo vídeo musical', exact: true,  icon: ICON_MUSIC    },
    { href: '/studio/historial',              label: 'Historial',           exact: false, icon: ICON_HISTORY  },
    { href: '/studio/calendario',             label: 'Calendario',          exact: false, icon: ICON_CALENDAR },
    { href: '/studio/canales',                label: 'Canales',             exact: false, icon: ICON_CHANNELS },
    { href: '/studio/configuracion',          label: 'Configuración',       exact: false, icon: ICON_SETTINGS },
  ],
};
```

- [ ] **Step 3: Usar `NAV_POR_PIPELINE` en el render**

En el componente, donde antes se iteraba `NAV_ITEMS.map(...)`, cambiarlo por:

```tsx
{(NAV_POR_PIPELINE[canalActivo?.pipeline_tipo ?? 'narrativo'] ?? NAV_POR_PIPELINE.narrativo).map((item) => (
  // ... resto del render de cada nav item igual que antes
))}
```

- [ ] **Step 4: Verificar que el layout compila**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | grep "StudioLayout" | head -10
```

Esperado: sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/components/studio/StudioLayout.tsx
git commit -m "feat(studio): dynamic nav in StudioLayout based on canal pipeline_tipo"
```

---

## Task 9: Canales page — formulario de dos pasos

**Files:**
- Modify: `src/app/studio/canales/page.tsx`

El formulario actual tiene un solo paso. Se convierte en dos pasos usando estado `paso: 1 | 2`.

- [ ] **Step 1: Leer el archivo actual completo**

```bash
cat -n /home/ubuntu/luisgranero-com/src/app/studio/canales/page.tsx
```

- [ ] **Step 2: Ampliar el estado del formulario**

Localizar la línea donde se declara `form` (línea ~22). Cambiarlo por:

```ts
const [form, setForm] = useState({
  nombre: '',
  nicho: '',
  tono: '',
  system_prompt_guion: '',
  idioma: 'es-ES',
  pipeline_tipo: 'narrativo' as 'narrativo' | 'musica_ambiental',
});
const [paso, setPaso] = useState<1 | 2>(1);
```

- [ ] **Step 3: Actualizar `createCanal` para enviar `pipeline_tipo`**

Cambiar el `body.JSON.stringify(form)` por:

```ts
body: JSON.stringify({
  nombre: form.nombre,
  nicho: form.nicho,
  tono: form.tono,
  system_prompt_guion: form.system_prompt_guion,
  idioma: form.idioma,
  pipeline_tipo: form.pipeline_tipo,
}),
```

Y resetear el estado tras crear:

```ts
setForm({ nombre: '', nicho: '', tono: '', system_prompt_guion: '', idioma: 'es-ES', pipeline_tipo: 'narrativo' });
setPaso(1);
```

- [ ] **Step 4: Sustituir el `<form>` actual por formulario de dos pasos**

Localizar el `<form onSubmit={createCanal}` en el JSX. Sustituir todo ese bloque por:

```tsx
{paso === 1 && (
  <form onSubmit={(e) => { e.preventDefault(); setPaso(2); }} className="space-y-4">
    <div>
      <label className="block text-xs text-gray-400 mb-1">Nombre del canal *</label>
      <input
        type="text"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        placeholder="Ej: Almas Corruptas"
        required
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
    <div>
      <label className="block text-xs text-gray-400 mb-1">Nicho</label>
      <input
        type="text"
        value={form.nicho}
        onChange={(e) => setForm({ ...form, nicho: e.target.value })}
        placeholder="Ej: True crime, Cocina saludable"
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
    <div>
      <label className="block text-xs text-gray-400 mb-1">Tono</label>
      <input
        type="text"
        value={form.tono}
        onChange={(e) => setForm({ ...form, tono: e.target.value })}
        placeholder="Ej: Oscuro y serio, Amigable y cercano"
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
    <div>
      <label className="block text-xs text-gray-400 mb-1">System prompt del guión</label>
      <textarea
        value={form.system_prompt_guion}
        onChange={(e) => setForm({ ...form, system_prompt_guion: e.target.value })}
        rows={3}
        placeholder="Instrucciones específicas para el guión..."
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
      />
    </div>
    <button
      type="submit"
      disabled={!form.nombre.trim()}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
    >
      Siguiente →
    </button>
  </form>
)}

{paso === 2 && (
  <form onSubmit={createCanal} className="space-y-4">
    <p className="text-xs text-gray-400">¿Qué tipo de contenido crea este canal?</p>

    {/* Narrativo */}
    <button
      type="button"
      onClick={() => setForm({ ...form, pipeline_tipo: 'narrativo' })}
      className={`w-full text-left p-4 rounded-lg border transition-colors ${
        form.pipeline_tipo === 'narrativo'
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">📹</span>
        <div>
          <p className="text-sm font-medium text-white">Narrativo</p>
          <p className="text-xs text-gray-400 mt-0.5">Guión + voz en off + imágenes + vídeo montado</p>
          <p className="text-xs text-gray-500 mt-0.5">True crime, recetas, educación, historia</p>
        </div>
        {form.pipeline_tipo === 'narrativo' && (
          <span className="ml-auto text-blue-400 text-sm">✓</span>
        )}
      </div>
    </button>

    {/* Música ambiental */}
    <button
      type="button"
      onClick={() => setForm({ ...form, pipeline_tipo: 'musica_ambiental' })}
      className={`w-full text-left p-4 rounded-lg border transition-colors ${
        form.pipeline_tipo === 'musica_ambiental'
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">🎵</span>
        <div>
          <p className="text-sm font-medium text-white">Música ambiental</p>
          <p className="text-xs text-gray-400 mt-0.5">Imagen animada + música en bucle</p>
          <p className="text-xs text-gray-500 mt-0.5">Lo-fi, jazz, naturaleza, focus music</p>
        </div>
        {form.pipeline_tipo === 'musica_ambiental' && (
          <span className="ml-auto text-blue-400 text-sm">✓</span>
        )}
      </div>
    </button>

    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setPaso(1)}
        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
      >
        ← Atrás
      </button>
      <button
        type="submit"
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
      >
        Crear canal
      </button>
    </div>
  </form>
)}
```

- [ ] **Step 5: Verificar TypeScript**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | grep "canales/page" | head -10
```

Esperado: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/app/studio/canales/page.tsx
git commit -m "feat(studio): two-step canal creation form with pipeline_tipo selector"
```

---

## Task 10: Nueva página `/studio/musica-ambiental/nuevo`

**Files:**
- Create: `src/app/studio/musica-ambiental/nuevo/page.tsx`

Esta es la página más compleja. Panel izquierdo con 5 bloques de controles, panel derecho con preview de imagen.

- [ ] **Step 1: Crear la constante de moods**

Al inicio del archivo, antes del componente:

```ts
const MOODS: Record<string, { label: string; prompt: string; efectos: string[] }> = {
  LLUVIA_CIUDAD: {
    label: '🌧 Lluvia en la ciudad',
    prompt: 'anime style girl studying at window, rain outside, city lights, cozy room, warm lamp light, lo-fi aesthetic, detailed, peaceful',
    efectos: ['lluvia', 'parpadeo_luces'],
  },
  CAFE_ACOGEDOR: {
    label: '☕ Café acogedor',
    prompt: 'cozy coffee shop interior, warm lighting, rain on window, books, plants, lo-fi anime aesthetic, peaceful atmosphere',
    efectos: ['vapor_cafe', 'lluvia_suave'],
  },
  BOSQUE_NOCHE: {
    label: '🌲 Bosque nocturno',
    prompt: 'magical forest at night, fireflies, moonlight through trees, lo-fi anime style, peaceful and mysterious',
    efectos: ['particulas_luz', 'niebla'],
  },
  CIUDAD_NOCTURNA: {
    label: '🌃 Ciudad nocturna',
    prompt: 'cyberpunk city at night, neon lights, rain, anime aesthetic, rooftop view, lo-fi mood',
    efectos: ['lluvia', 'neon_parpadeo'],
  },
  PLAYA_ATARDECER: {
    label: '🌅 Playa al atardecer',
    prompt: 'anime girl on beach at sunset, warm colors, gentle waves, lo-fi aesthetic, peaceful, dreamy',
    efectos: ['olas_suaves', 'particulas_luz'],
  },
  HABITACION_ACOGEDORA: {
    label: '🏠 Habitación acogedora',
    prompt: 'cozy bedroom at night, fairy lights, plants, books, lo-fi anime aesthetic, warm and peaceful',
    efectos: ['parpadeo_luces', 'particulas_luz'],
  },
};

const DURACIONES = [
  { horas: 0.5, label: '30 minutos' },
  { horas: 1,   label: '1 hora' },
  { horas: 2,   label: '2 horas' },
  { horas: 3,   label: '3 horas' },
];
```

- [ ] **Step 2: Crear el componente página completo**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import StudioLayout from '@/components/studio/StudioLayout';

// [pegar aquí las constantes MOODS y DURACIONES del paso anterior]

interface MusicTrack {
  _id: string;
  nombre: string;
  categoria: string;
  archivo_path: string;
}

export default function NuevoMusicaAmbientalPage() {
  // ── Mood ──────────────────────────────────────────────
  const [mood, setMood] = useState('LLUVIA_CIUDAD');
  const [promptCustom, setPromptCustom] = useState('');
  const [promptCustomActivo, setPromptCustomActivo] = useState(false);

  // ── Música ────────────────────────────────────────────
  const [musicaFile, setMusicaFile] = useState<File | null>(null);
  const [musicaTrack, setMusicaTrack] = useState<MusicTrack | null>(null);
  const [musicaTracks, setMusicaTracks] = useState<MusicTrack[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const musicaRef = useRef<HTMLAudioElement | null>(null);

  // ── Duración ──────────────────────────────────────────
  const [duracionHoras, setDuracionHoras] = useState(1);

  // ── Texto overlay ─────────────────────────────────────
  const [textoActivo, setTextoActivo] = useState(false);
  const [textoLinea1, setTextoLinea1] = useState('lo-fi hip hop');
  const [textoLinea2, setTextoLinea2] = useState('beats to study/relax to');
  const [textoColor, setTextoColor] = useState('#ffffff');
  const [textoPosicion, setTextoPosicion] = useState<'top' | 'center' | 'bottom'>('bottom');

  // ── Metadatos ─────────────────────────────────────────
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // ── Preview ───────────────────────────────────────────
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [imagenPath, setImagenPath] = useState<string | null>(null);
  const [generandoPreview, setGenerandoPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // ── Generación ────────────────────────────────────────
  const [videoId, setVideoId] = useState<string | null>(null);
  const [estado, setEstado] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-título y descripción al cambiar mood o duración
  useEffect(() => {
    const moodData = MOODS[mood];
    const moodLabel = moodData?.label.replace(/^[^\s]+\s/, '') ?? mood;
    setTitulo(`${moodLabel} lo-fi hip hop 🎵 beats to study/relax to`);
    const hLabel = duracionHoras === 0.5 ? '30 minutes' : `${duracionHoras} hour${duracionHoras > 1 ? 's' : ''}`;
    setDescripcion(
      `Relax and study with ${hLabel} of ${moodLabel.toLowerCase()} lo-fi music.\nPerfect for studying, working, or just chilling.\nNo ads, no interruptions.\n\n#lofi #lofihiphop #studymusic #chillbeats`
    );
  }, [mood, duracionHoras]);

  // Cargar tracks de la biblioteca
  useEffect(() => {
    fetch('/api/studio/music')
      .then((r) => r.json())
      .then((d: { tracks?: MusicTrack[] }) => { if (d.tracks) setMusicaTracks(d.tracks); })
      .catch(() => null);
  }, []);

  // Polling cuando hay videoId en proceso
  useEffect(() => {
    if (!videoId || estado === 'listo' || estado === 'error') {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/studio/musica-ambiental/${videoId}`);
        const d = await r.json() as { video?: { estado: string; video_path: string | null; error_msg: string | null } };
        if (!d.video) return;
        setEstado(d.video.estado);
        if (d.video.estado === 'listo' && d.video.video_path) {
          setVideoPath(d.video.video_path);
          clearInterval(pollRef.current!);
          pollRef.current = null;
        }
        if (d.video.estado === 'error') {
          setGenError(d.video.error_msg ?? 'Error durante la generación');
          clearInterval(pollRef.current!);
          pollRef.current = null;
        }
      } catch { /* silencioso */ }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [videoId, estado]);

  async function handleGenerarPreview() {
    setGenerandoPreview(true);
    setPreviewError(null);
    try {
      const prompt = promptCustomActivo && promptCustom.trim()
        ? promptCustom.trim()
        : MOODS[mood].prompt;
      const r = await fetch('/api/studio/musica-ambiental/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const d = await r.json() as { imagen_url?: string; imagen_path?: string; error?: string };
      if (!r.ok) throw new Error(d.error ?? 'Error generando preview');
      setImagenUrl(d.imagen_url!);
      setImagenPath(d.imagen_path!);
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : 'Error');
    } finally {
      setGenerandoPreview(false);
    }
  }

  async function handleGenerarVideo() {
    if (!imagenPath || (!musicaFile && !musicaTrack)) return;
    setGenError(null);
    setEstado('generando_video');

    try {
      let musica_base64: string | undefined;
      let musica_track_path: string | undefined;
      let musica_nombre: string | undefined;

      if (musicaFile) {
        const buffer = await musicaFile.arrayBuffer();
        musica_base64 = Buffer.from(buffer).toString('base64');
        musica_nombre = musicaFile.name;
      } else if (musicaTrack) {
        // El track de la biblioteca tiene su ruta en el servidor
        musica_track_path = musicaTrack.archivo_path;
        musica_nombre = musicaTrack.nombre;
      }

      const prompt = promptCustomActivo && promptCustom.trim()
        ? promptCustom.trim()
        : MOODS[mood].prompt;

      const r = await fetch('/api/studio/musica-ambiental/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          prompt_flux: prompt,
          imagen_path: imagenPath,
          musica_base64,
          musica_track_path,
          musica_nombre,
          duracion_horas: duracionHoras,
          efectos: MOODS[mood].efectos,
          titulo,
          descripcion,
          texto_overlay: textoActivo
            ? { activo: true, linea1: textoLinea1, linea2: textoLinea2, color: textoColor, posicion: textoPosicion }
            : null,
        }),
      });
      const d = await r.json() as { video_id?: string; error?: string };
      if (!r.ok) throw new Error(d.error ?? 'Error iniciando generación');
      setVideoId(d.video_id!);
    } catch (e) {
      setEstado(null);
      setGenError(e instanceof Error ? e.message : 'Error');
    }
  }

  const musicaSeleccionada = !!musicaFile || !!musicaTrack;
  const puedeGenerar = !!imagenPath && musicaSeleccionada && !estado;

  const estadoLabel: Record<string, string> = {
    generando_video: 'Generando vídeo...',
    listo: '✅ Vídeo listo',
    error: '❌ Error',
  };

  return (
    <StudioLayout>
      <div className="flex h-full gap-0">
        {/* ── Panel izquierdo ── */}
        <div className="w-[420px] min-w-[420px] overflow-y-auto border-r border-gray-800 p-6 space-y-6">
          <h1 className="text-lg font-semibold text-white">Nuevo vídeo musical</h1>

          {/* Bloque 1: Mood */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-300">Mood / Ambiente</h2>
            <select
              value={mood}
              onChange={(e) => { setMood(e.target.value); setImagenUrl(null); setImagenPath(null); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {Object.entries(MOODS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setPromptCustomActivo(!promptCustomActivo)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {promptCustomActivo ? '▲ Ocultar prompt' : '▼ Personalizar prompt'}
            </button>

            {promptCustomActivo && (
              <textarea
                value={promptCustom}
                onChange={(e) => setPromptCustom(e.target.value)}
                rows={3}
                placeholder={MOODS[mood].prompt}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
              />
            )}

            <button
              type="button"
              onClick={handleGenerarPreview}
              disabled={generandoPreview}
              className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              {generandoPreview ? 'Generando preview...' : '✨ Generar preview'}
            </button>
            {previewError && <p className="text-xs text-red-400">{previewError}</p>}
          </div>

          {/* Bloque 2: Música */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-300">Música</h2>

            <label className="block cursor-pointer">
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                musicaFile ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-gray-500'
              }`}>
                {musicaFile ? (
                  <div>
                    <p className="text-sm text-green-400">✓ {musicaFile.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{(musicaFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-400">Arrastra o haz clic para subir música</p>
                    <p className="text-xs text-gray-500 mt-1">MP3, WAV, FLAC</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".mp3,.wav,.flac,audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setMusicaFile(f); setMusicaTrack(null); }
                }}
              />
            </label>

            {musicaFile && (
              <audio
                ref={musicaRef}
                controls
                src={URL.createObjectURL(musicaFile)}
                className="w-full h-8"
              />
            )}

            {musicaTracks.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setLibraryOpen(!libraryOpen)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {libraryOpen ? '▲ Ocultar biblioteca' : '▼ O elegir de la biblioteca'}
                </button>

                {libraryOpen && (
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {musicaTracks.map((t) => (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => { setMusicaTrack(t); setMusicaFile(null); setLibraryOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                          musicaTrack?._id === t._id
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {t.nombre} <span className="text-gray-500">({t.categoria})</span>
                      </button>
                    ))}
                  </div>
                )}

                {musicaTrack && !musicaFile && (
                  <p className="text-xs text-green-400 mt-1">✓ {musicaTrack.nombre}</p>
                )}
              </div>
            )}
          </div>

          {/* Bloque 3: Duración */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-300">Duración del vídeo</h2>
            <div className="grid grid-cols-4 gap-2">
              {DURACIONES.map((d) => (
                <button
                  key={d.horas}
                  type="button"
                  onClick={() => setDuracionHoras(d.horas)}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                    duracionHoras === d.horas
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bloque 4: Título y descripción */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-300">Título y descripción</h2>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={5}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Bloque 5: Texto en el vídeo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTextoActivo(!textoActivo)}
                className={`w-9 h-5 rounded-full transition-colors ${textoActivo ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                <span className={`block w-3 h-3 bg-white rounded-full transition-transform mx-1 ${textoActivo ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm text-gray-300">Mostrar texto en el vídeo</span>
            </div>

            {textoActivo && (
              <div className="space-y-2 pl-2 border-l border-gray-700">
                <input
                  type="text"
                  value={textoLinea1}
                  onChange={(e) => setTextoLinea1(e.target.value)}
                  placeholder="Línea 1"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
                />
                <input
                  type="text"
                  value={textoLinea2}
                  onChange={(e) => setTextoLinea2(e.target.value)}
                  placeholder="Línea 2"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400">Color:</label>
                  <input type="color" value={textoColor} onChange={(e) => setTextoColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                </div>
                <div className="flex gap-2">
                  {(['top', 'center', 'bottom'] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setTextoPosicion(pos)}
                      className={`flex-1 py-1 rounded text-xs transition-colors ${textoPosicion === pos ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                      {pos === 'top' ? 'Arriba' : pos === 'center' ? 'Centro' : 'Abajo'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botón generar vídeo */}
          <button
            type="button"
            onClick={handleGenerarVideo}
            disabled={!puedeGenerar}
            className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            {estado ? estadoLabel[estado] ?? estado : '🎬 Generar vídeo'}
          </button>

          {genError && <p className="text-xs text-red-400">{genError}</p>}
        </div>

        {/* ── Panel derecho — preview ── */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-950">
          {imagenUrl ? (
            <div className="w-full max-w-3xl space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagenUrl} alt="Preview" className="w-full rounded-xl shadow-2xl" />
              <div className="flex flex-wrap gap-2">
                {MOODS[mood].efectos.map((e) => (
                  <span key={e} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">{e}</span>
                ))}
              </div>
              {estado === 'listo' && videoPath && (
                <div className="mt-4 space-y-2">
                  <video controls src={videoPath} className="w-full rounded-lg" />
                  <a
                    href={videoPath}
                    download
                    className="block text-center bg-blue-700 hover:bg-blue-600 text-white text-sm py-2 rounded-lg"
                  >
                    ⬇ Descargar vídeo
                  </a>
                </div>
              )}
              {estado === 'generando_video' && (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  Generando vídeo (puede tardar varios minutos)...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="text-6xl">{MOODS[mood]?.label.split(' ')[0]}</div>
              <p className="text-gray-500 text-sm">Genera un preview para ver la imagen</p>
              <p className="text-gray-600 text-xs">{MOODS[mood]?.label}</p>
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | grep "musica-ambiental/nuevo" | head -10
```

Esperado: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/app/studio/musica-ambiental/
git commit -m "feat(studio): add /studio/musica-ambiental/nuevo two-panel creation page"
```

---

## Task 11: Historial — vista condicional por pipeline

**Files:**
- Modify: `src/app/studio/historial/page.tsx`

- [ ] **Step 1: Leer la estructura actual del historial**

```bash
head -60 /home/ubuntu/luisgranero-com/src/app/studio/historial/page.tsx
```

Identificar: dónde se hace el fetch del canal activo, dónde se carga la lista de scripts, y dónde empieza el JSX.

- [ ] **Step 2: Añadir la interfaz y el estado para vídeos musicales**

Añadir la interfaz al inicio del archivo (junto a las interfaces existentes):

```ts
interface VideoMusicalSummary {
  _id: string;
  mood: string;
  duracion_horas: number;
  titulo: string;
  estado: string;
  video_path: string | null;
  youtube_url: string | null;
  creado_en: string;
}
```

Añadir estado en el componente:

```ts
const [pipelineTipo, setPipelineTipo] = useState<string>('narrativo');
const [videosMusica, setVideosMusica] = useState<VideoMusicalSummary[]>([]);
```

- [ ] **Step 3: Ampliar el fetch del canal activo para obtener `pipeline_tipo`**

Localizar el `useEffect` donde se hace `fetch('/api/studio/canal/current')`. Ampliar el handler para guardar `pipeline_tipo` y cargar los vídeos musicales si corresponde:

```ts
fetch('/api/studio/canal/current')
  .then((r) => r.json())
  .then((d: { canal?: { pipeline_tipo?: string } }) => {
    const tipo = d.canal?.pipeline_tipo ?? 'narrativo';
    setPipelineTipo(tipo);
    if (tipo === 'musica_ambiental') {
      fetch('/api/studio/musica-ambiental')
        .then((r) => r.json())
        .then((d2: { videos?: VideoMusicalSummary[] }) => {
          if (d2.videos) setVideosMusica(d2.videos);
        })
        .catch(() => null);
    }
  })
  .catch(() => null);
```

- [ ] **Step 4: Añadir la vista de vídeos musicales al JSX**

Localizar el return del JSX. Añadir antes del render de scripts:

```tsx
{pipelineTipo === 'musica_ambiental' && (
  <div>
    <h2 className="text-base font-semibold text-white mb-4">Vídeos musicales</h2>
    {videosMusica.length === 0 ? (
      <p className="text-gray-500 text-sm">No hay vídeos generados todavía.</p>
    ) : (
      <div className="space-y-3">
        {videosMusica.map((v) => (
          <div key={v._id} className="bg-gray-900 rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{v.titulo}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {v.duracion_horas === 0.5 ? '30 min' : `${v.duracion_horas}h`} · {v.mood.replace(/_/g, ' ').toLowerCase()}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              v.estado === 'listo' ? 'bg-green-900/50 text-green-400' :
              v.estado === 'error' ? 'bg-red-900/50 text-red-400' :
              'bg-yellow-900/50 text-yellow-400'
            }`}>
              {v.estado}
            </span>
            <div className="flex gap-2">
              {v.video_path && (
                <a
                  href={v.video_path}
                  download
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg"
                >
                  ⬇
                </a>
              )}
              {v.video_path && !v.youtube_url && (
                <button
                  type="button"
                  onClick={() => {
                    // Redirigir al formulario de upload con el ID del vídeo
                    window.open(`/studio/musica-ambiental/nuevo?upload=${v._id}`, '_self');
                  }}
                  className="text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg"
                >
                  ▶ YouTube
                </button>
              )}
              {v.youtube_url && (
                <a
                  href={v.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-red-800 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg"
                >
                  ✓ YT
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

{pipelineTipo === 'narrativo' && (
  // ... aquí va el JSX actual de la lista de guiones sin cambios
)}
```

- [ ] **Step 5: Verificar TypeScript**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | grep "historial" | head -10
```

Esperado: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/app/studio/historial/page.tsx
git commit -m "feat(studio): historial shows musica ambiental videos for musical pipeline canals"
```

---

## Task 12: Build y verificación final

- [ ] **Step 1: Verificar TypeScript global limpio**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | grep -v "^$" | head -30
```

Esperado: sin errores. Si hay errores, corregirlos antes de continuar.

- [ ] **Step 2: Build de producción**

```bash
cd /home/ubuntu/luisgranero-com && npm run build 2>&1 | tail -30
```

Esperado: `✓ Compiled successfully` o similar sin errores críticos.

- [ ] **Step 3: Reiniciar PM2**

```bash
pm2 restart all && pm2 logs --lines 20
```

Verificar que no hay errores en los logs de arranque.

- [ ] **Step 4: Smoke test manual**

Abrir el Studio y:
1. Crear un canal nuevo → verificar que aparece el selector de pipeline en el paso 2
2. Crear un canal de tipo "Música ambiental" → verificar que el nav lateral muestra "Nuevo vídeo musical"
3. Navegar a `/studio/musica-ambiental/nuevo` → verificar que carga sin error
4. Seleccionar mood "Lluvia en la ciudad" → hacer clic en "Generar preview" → verificar que aparece la imagen
5. Cargar un archivo MP3 → seleccionar duración 30 min → hacer clic en "Generar vídeo"
6. Verificar que el estado cambia a "Generando vídeo..." y tras unos minutos a "✅ Vídeo listo"
7. Navegar a `/studio/historial` → verificar que muestra la lista de vídeos musicales

- [ ] **Step 5: Commit final si hay cambios pendientes**

```bash
git status && git add -A && git commit -m "feat(studio): complete musica ambiental pipeline implementation"
```

---

## Self-Review

**Cobertura del spec:**

| Requisito | Tarea |
|---|---|
| `pipeline_tipo` en StudioCanal model | Task 1 |
| Selector de pipeline en creación de canal | Task 9 |
| Nav dinámico por pipeline en StudioLayout | Task 8 |
| Página /studio/musica-ambiental/nuevo | Task 10 |
| 6 moods con prompts y efectos | Task 10 (MOODS constant) |
| Preview bajo demanda con FLUX 1920×1080 | Task 5 |
| Dropzone música + biblioteca del canal | Task 10 |
| Selector duración 30min/1h/2h/3h | Task 10 |
| Auto-título y descripción | Task 10 |
| Texto overlay opcional | Task 10 |
| Loop música con FFmpeg + fade in/out | Task 6 |
| Efectos FFmpeg (parpadeo, niebla, overlays opcionales) | Task 6 |
| -tune stillimage en FFmpeg | Task 6 |
| Drawtext para texto overlay | Task 6 |
| Modelo MongoDB studio_musica_ambiental | Task 2 |
| API CRUD colección musica-ambiental | Task 3 |
| Serving imagen y vídeo vía API route | Task 4 |
| Background processing + polling | Task 6 + Task 10 |
| Historial condicional por pipeline_tipo | Task 11 |
| Upload YouTube tipo=musica_ambiental | Task 7 |
| Directorios de output | Task 4 |

**Notas importantes para el ejecutor:**

1. El campo `musica_track_path` en el body de generate envía la ruta absoluta del servidor del track de la biblioteca. Para obtenerla, el GET `/api/studio/music` debe devolver el path real del fichero. Si devuelve solo una URL relativa, hay que adaptarlo — revisar `src/app/api/studio/music/route.ts` antes de la Task 10 si el track de biblioteca no funciona.

2. El tamaño del archivo de música enviado como base64 puede ser grande para archivos FLAC/WAV largos. Si hay errores de body demasiado grande en Next.js, añadir en la ruta generate: `export const config = { api: { bodyParser: { sizeLimit: '100mb' } } }`. En App Router de Next.js 14+ se controla con `next.config.js` si es necesario.

3. Si `landscape_16_9` no es un tamaño válido en Freepik, usar `landscape_4_3` como fallback — el vídeo FFmpeg escalará la imagen con `-vf scale=1920:1080` si fuera necesario.
