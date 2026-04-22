# Generador de Carteles con IA — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir generación de carteles de eventos completamente por IA (texto → prompt → imagen final), más limpiar el sidebar quitando el bloque de estado de APIs.

**Architecture:** Nueva página `/studio/carteles/nuevo-ia` con 3 pasos inline (describir evento → revisar prompt editable → ver imagen generada). Backend: ruta `generate-cartel-prompt` usa Claude/LLM del canal para escribir el prompt Flux/SD; ruta `generate-cartel-ia` genera la imagen con el motor configurado en el canal (Freepik / HuggingFace / ComfyUI). Las imágenes se guardan en `public/studio/carteles/ia/` y se sirven mediante una nueva API route.

**Tech Stack:** Next.js App Router, TypeScript, MongoDB/Mongoose, Anthropic SDK vía `callLLM`, Freepik Mystic API, HuggingFace Inference API, ComfyUI Cloud.

---

## Mapa de archivos

| Acción | Archivo |
|--------|---------|
| Modificar | `src/components/studio/StudioLayout.tsx` |
| Modificar | `src/app/studio/carteles/page.tsx` |
| Modificar | `src/models/StudioCartel.ts` |
| Modificar | `src/app/api/studio/carteles/route.ts` |
| Crear | `src/app/api/studio/cartel-ia/[filename]/route.ts` |
| Crear | `src/app/api/studio/generate-cartel-prompt/route.ts` |
| Crear | `src/app/api/studio/generate-cartel-ia/route.ts` |
| Crear | `src/app/studio/carteles/nuevo-ia/page.tsx` |

---

## Task 1: Quitar bloque "APIs" del sidebar

**Files:**
- Modify: `src/components/studio/StudioLayout.tsx`

- [ ] **Step 1: Eliminar interfaz ApiStatus y array API_LABELS**

En `StudioLayout.tsx`, eliminar estas líneas (están entre la línea ~15 y ~90):

```diff
-interface ApiStatus {
-  anthropic: boolean;
-  elevenlabs: boolean;
-  freepik: boolean;
-  huggingface: boolean;
-  youtube: boolean;
-}
-
...

-const API_LABELS: { key: keyof ApiStatus; label: string }[] = [
-  { key: 'anthropic', label: 'Anthropic' },
-  { key: 'elevenlabs', label: 'ElevenLabs' },
-  { key: 'freepik', label: 'Freepik' },
-  { key: 'huggingface', label: 'HuggingFace' },
-  { key: 'youtube', label: 'YouTube' },
-];
```

- [ ] **Step 2: Eliminar estado apiStatus y su fetch**

En el cuerpo del componente `StudioLayout`, eliminar:

```diff
-  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
```

Y en el `useEffect`, eliminar el bloque:

```diff
-    fetch('/api/studio/api-status')
-      .then((r) => r.json())
-      .then((d) => setApiStatus(d as ApiStatus))
-      .catch(() => null);
```

- [ ] **Step 3: Eliminar el bloque de renderizado de APIs del footer**

En el JSX del sidebar (sección "Bottom: API status + logout"), eliminar el bloque de API status manteniendo solo el botón de logout y la versión:

```diff
        <div className="px-4 py-4 border-t border-white/[0.06] space-y-3">
-          {/* API status dots */}
-          <div className="space-y-1.5">
-            <p className="text-[10px] text-gray-700 uppercase tracking-wider font-medium mb-2">APIs</p>
-            {API_LABELS.map(({ key, label }) => (
-              <div key={key} className="flex items-center justify-between">
-                <span className="text-xs text-gray-600">{label}</span>
-                {apiStatus === null ? (
-                  <span className="w-1.5 h-1.5 rounded-full bg-gray-800" />
-                ) : apiStatus[key] ? (
-                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Configurado" />
-                ) : (
-                  <span className="w-1.5 h-1.5 rounded-full bg-red-500/60" title="No configurado" />
-                )}
-              </div>
-            ))}
-          </div>

          {/* Logout */}
```

- [ ] **Step 4: Build para verificar que no hay errores TS**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores de `ApiStatus` ni `apiStatus`.

- [ ] **Step 5: Commit**

```bash
git add src/components/studio/StudioLayout.tsx
git commit -m "feat(studio): remove API status dots from sidebar"
```

---

## Task 2: Añadir botón "Generar con IA" en página de carteles

**Files:**
- Modify: `src/app/studio/carteles/page.tsx`

- [ ] **Step 1: Añadir el botón junto a "+ Nuevo cartel"**

En `carteles/page.tsx`, localizar el bloque de botones del header (actualmente hay "Gestionar DJs" y "+ Nuevo cartel"). Añadir el botón de IA entre los dos:

```diff
          <div className="flex gap-3">
            <Link
              href="/studio/carteles/djs"
              className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
            >
              Gestionar DJs
            </Link>
+           <Link
+             href="/studio/carteles/nuevo-ia"
+             className="px-4 py-2 text-sm text-violet-300 hover:text-white border border-violet-500/30 hover:border-violet-400/50 rounded-lg transition-colors"
+           >
+             ✨ Generar con IA
+           </Link>
            <Link
              href="/studio/carteles/nuevo"
              className="px-4 py-2 text-sm text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors font-medium"
            >
              + Nuevo cartel
            </Link>
          </div>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/studio/carteles/page.tsx
git commit -m "feat(studio): add 'Generar con IA' button to carteles page"
```

---

## Task 3: Actualizar modelo StudioCartel para soportar carteles IA

**Files:**
- Modify: `src/models/StudioCartel.ts`

Los carteles IA no tienen DJ asociado, ni hora de inicio. Hay que hacer esos campos opcionales y añadir `tipo`.

- [ ] **Step 1: Actualizar la interfaz IStudioCartel**

Añadir el campo `tipo` a la interfaz y marcar `dj_id` y `hora_inicio` como opcionales:

```diff
 export interface IStudioCartel extends Document {
   // Campos originales
-  dj_id: string;
+  dj_id: string;  // '' para carteles IA
   nombre_evento: string;
   fecha: string;
-  hora_inicio: string;
+  hora_inicio: string;
   hora_fin: string | null;
   ...
+  tipo: 'manual' | 'ia';
+  prompt_ia: string;
```

- [ ] **Step 2: Actualizar el schema de Mongoose**

En `StudioCartelSchema`, cambiar `dj_id` y `hora_inicio` para que no sean required y añadir los campos `tipo` y `prompt_ia`:

```diff
-  dj_id: { type: String, required: true },
+  dj_id: { type: String, default: '' },
   nombre_evento: { type: String, required: true, trim: true },
   fecha: { type: String, required: true },
-  hora_inicio: { type: String, required: true },
+  hora_inicio: { type: String, default: '' },
   hora_fin: { type: String, default: null },
```

Y al final de los campos (antes del cierre del schema), añadir:

```diff
   canal_id: { type: String, index: true, default: null },
+  tipo: { type: String, enum: ['manual', 'ia'], default: 'manual' },
+  prompt_ia: { type: String, default: '' },
 });
```

- [ ] **Step 3: Verificar TS**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/models/StudioCartel.ts
git commit -m "feat(studio): add tipo+prompt_ia to StudioCartel, make dj_id/hora_inicio optional"
```

---

## Task 4: Añadir POST al endpoint de carteles para guardar carteles IA

**Files:**
- Modify: `src/app/api/studio/carteles/route.ts`

- [ ] **Step 1: Añadir handler POST**

Añadir al final de `src/app/api/studio/carteles/route.ts`:

```typescript
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const body = await request.json() as {
      nombre_evento: string;
      nombre_dj?: string;
      fecha: string;
      cartel_path: string;
      prompt_ia?: string;
    };

    if (!body.nombre_evento || !body.fecha || !body.cartel_path) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    await connectDB();
    const cartel = await StudioCartel.create({
      dj_id: '',
      nombre_evento: body.nombre_evento.trim(),
      fecha: body.fecha.trim(),
      hora_inicio: '',
      canal_id: session.canal_id,
      cartel_path: body.cartel_path,
      tipo: 'ia',
      prompt_ia: body.prompt_ia ?? '',
      prompt_usuario: body.nombre_dj ?? '',
    });

    return NextResponse.json({ cartel }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verificar TS**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/studio/carteles/route.ts
git commit -m "feat(studio): add POST handler to carteles route for IA-generated cartels"
```

---

## Task 5: Crear API route para servir imágenes de carteles IA

**Files:**
- Create: `src/app/api/studio/cartel-ia/[filename]/route.ts`

Las imágenes se guardan en `public/studio/carteles/ia/` y se sirven mediante esta ruta para evitar el problema de cacheo de 404 en Next.js static serving.

- [ ] **Step 1: Crear el directorio**

```bash
mkdir -p /home/ubuntu/luisgranero-com/src/app/api/studio/cartel-ia/\[filename\]
```

- [ ] **Step 2: Crear el archivo de ruta**

Crear `src/app/api/studio/cartel-ia/[filename]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface RouteParams {
  params: Promise<{ filename: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { filename } = await params;
    const safeFilename = path.basename(filename);

    const filePath = path.join(
      process.cwd(),
      'public',
      'studio',
      'carteles',
      'ia',
      safeFilename
    );

    const buffer = await fs.readFile(filePath);
    const ext = path.extname(safeFilename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };
    const contentType = mimeTypes[ext] ?? 'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=2592000',
        'Content-Length': String(buffer.length),
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
```

- [ ] **Step 3: Crear el directorio de imágenes en public**

```bash
mkdir -p /home/ubuntu/luisgranero-com/public/studio/carteles/ia
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/studio/cartel-ia/
git commit -m "feat(studio): add image-serving route for IA-generated cartels"
```

---

## Task 6: Crear API route generate-cartel-prompt

**Files:**
- Create: `src/app/api/studio/generate-cartel-prompt/route.ts`

Toma datos del evento en lenguaje natural y devuelve un prompt en inglés optimizado para generadores de imagen (Flux/SD).

- [ ] **Step 1: Crear el directorio**

```bash
mkdir -p /home/ubuntu/luisgranero-com/src/app/api/studio/generate-cartel-prompt
```

- [ ] **Step 2: Crear la ruta**

Crear `src/app/api/studio/generate-cartel-prompt/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { callLLM, type LLMConfig } from '@/lib/studio/llm-client';

interface PromptRequest {
  nombre_evento: string;
  nombre_dj: string;
  fecha: string;
  descripcion_estilo: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await request.json() as PromptRequest;

    if (!body.nombre_evento || !body.nombre_dj) {
      return NextResponse.json({ error: 'nombre_evento y nombre_dj son obligatorios' }, { status: 400 });
    }

    await connectDB();
    const canal = await StudioCanal.findById(session.canal_id).lean();
    const canalConfig = ((canal as { config?: LLMConfig } | null)?.config ?? {}) as LLMConfig;

    const userMessage = `Create an English image generation prompt for an event poster with these details:
- Event: ${body.nombre_evento}
- DJ: ${body.nombre_dj}
- Date: ${body.fecha || 'not specified'}
- Style/vibe: ${body.descripcion_estilo || 'dark, atmospheric, professional'}

Requirements for the prompt:
- Write for Flux or Stable Diffusion image generation
- Focus on: background atmosphere, lighting, colors, textures, mood
- Do NOT include readable text, logos, or typography in the prompt (models render text poorly)
- Make it vivid and specific: lighting type, color palette, atmosphere keywords
- Length: 40-60 words
- Return ONLY the prompt text, nothing else`;

    const prompt = await callLLM({
      system: 'You are an expert at writing image generation prompts for AI art models. You write concise, vivid English prompts optimized for Flux and Stable Diffusion. Return ONLY the prompt text with no introduction, explanation, or formatting.',
      messages: [{ role: 'user', content: userMessage }],
      maxTokens: 200,
      model: 'fast',
      canalConfig,
    });

    return NextResponse.json({ prompt: prompt.trim() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verificar TS**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/studio/generate-cartel-prompt/
git commit -m "feat(studio): add generate-cartel-prompt route (LLM → Flux/SD prompt)"
```

---

## Task 7: Crear API route generate-cartel-ia

**Files:**
- Create: `src/app/api/studio/generate-cartel-ia/route.ts`

GET devuelve los motores disponibles para el canal activo.
POST genera la imagen con el motor especificado.

- [ ] **Step 1: Crear el directorio**

```bash
mkdir -p /home/ubuntu/luisgranero-com/src/app/api/studio/generate-cartel-ia
```

- [ ] **Step 2: Crear la ruta**

Crear `src/app/api/studio/generate-cartel-ia/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { runComfyWorkflow } from '@/lib/studio/comfyui-client';
import fs from 'fs';
import path from 'path';

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

    fs.mkdirSync(CARTELES_IA_DIR, { recursive: true });
    const filename = `${Date.now()}.jpg`;
    const outputPath = path.join(CARTELES_IA_DIR, filename);

    if (engine === 'comfyui') {
      const comfyKey = rawCanal?.config?.comfyui_api_key;
      if (!comfyKey) return NextResponse.json({ error: 'API key ComfyUI no configurada' }, { status: 400 });
      const overrides = rawCanal?.config?.comfyui_workflow_overrides ?? {};
      const buffer = await runComfyWorkflow('cartel', { prompt }, comfyKey, overrides.cartel);
      fs.writeFileSync(outputPath, buffer);
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

  for (let attempt = 0; attempt < 3; attempt++) {
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
      await new Promise((r) => setTimeout(r, 20000));
      continue;
    }

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HuggingFace error ${response.status}: ${err.slice(0, 200)}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 1000) throw new Error('Imagen demasiado pequeña');
    fs.writeFileSync(outputPath, buffer);
    return;
  }

  throw new Error('HuggingFace: demasiados reintentos');
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
      fs.writeFileSync(outputPath, Buffer.from(first.base64, 'base64'));
      return;
    }
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
    if (!pollRes.ok) continue;

    const pollData = await pollRes.json() as {
      data?: { status?: string; generated?: Array<{ base64?: string }> };
    };

    const status = pollData.data?.status;
    if (status === 'DONE' || status === 'completed') {
      const base64 = pollData.data?.generated?.[0]?.base64;
      if (base64) {
        fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'));
        return;
      }
    }
    if (status === 'FAILED' || status === 'error') throw new Error('Freepik: tarea fallida');
  }

  throw new Error('Freepik: timeout esperando imagen');
}
```

- [ ] **Step 3: Verificar TS**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/studio/generate-cartel-ia/
git commit -m "feat(studio): add generate-cartel-ia route (Freepik/HF/ComfyUI poster generation)"
```

---

## Task 8: Crear página /studio/carteles/nuevo-ia

**Files:**
- Create: `src/app/studio/carteles/nuevo-ia/page.tsx`

- [ ] **Step 1: Crear el directorio**

```bash
mkdir -p /home/ubuntu/luisgranero-com/src/app/studio/carteles/nuevo-ia
```

- [ ] **Step 2: Crear la página**

Crear `src/app/studio/carteles/nuevo-ia/page.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StudioLayout from '@/components/studio/StudioLayout';

type Step = 'form' | 'prompt' | 'result';
type Engine = 'freepik' | 'huggingface' | 'comfyui';

const ENGINE_LABELS: Record<Engine, string> = {
  freepik: 'Freepik Mystic',
  huggingface: 'HuggingFace Flux',
  comfyui: 'ComfyUI',
};

export default function NuevoCartelIAPage() {
  const [step, setStep] = useState<Step>('form');

  // Step 1 — form
  const [nombreEvento, setNombreEvento] = useState('');
  const [nombreDj, setNombreDj] = useState('');
  const [fecha, setFecha] = useState('');
  const [estilo, setEstilo] = useState('');
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [promptError, setPromptError] = useState('');

  // Step 2 — prompt
  const [prompt, setPrompt] = useState('');
  const [engines, setEngines] = useState<Engine[]>([]);
  const [selectedEngine, setSelectedEngine] = useState<Engine>('freepik');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  // Step 3 — result
  const [imageUrl, setImageUrl] = useState('');
  const [engineUsed, setEngineUsed] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch('/api/studio/generate-cartel-ia')
      .then((r) => r.json())
      .then((d: { engines?: Engine[]; default?: Engine }) => {
        if (d.engines && d.engines.length > 0) {
          setEngines(d.engines);
          setSelectedEngine(d.default ?? d.engines[0]);
        }
      })
      .catch(() => null);
  }, []);

  async function handleGeneratePrompt() {
    if (!nombreEvento.trim() || !nombreDj.trim()) {
      setPromptError('Nombre del evento y DJ son obligatorios');
      return;
    }
    setPromptError('');
    setGeneratingPrompt(true);
    try {
      const res = await fetch('/api/studio/generate-cartel-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_evento: nombreEvento,
          nombre_dj: nombreDj,
          fecha,
          descripcion_estilo: estilo,
        }),
      });
      const data = await res.json() as { prompt?: string; error?: string };
      if (!res.ok || !data.prompt) throw new Error(data.error ?? 'Error generando prompt');
      setPrompt(data.prompt);
      setStep('prompt');
    } catch (e) {
      setPromptError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setGeneratingPrompt(false);
    }
  }

  async function handleGenerateImage() {
    setGenError('');
    setGenerating(true);
    try {
      const res = await fetch('/api/studio/generate-cartel-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, engine: selectedEngine }),
      });
      const data = await res.json() as { image_url?: string; engine?: string; error?: string };
      if (!res.ok || !data.image_url) throw new Error(data.error ?? 'Error generando imagen');
      setImageUrl(data.image_url);
      setEngineUsed(data.engine ?? selectedEngine);
      setStep('result');
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/studio/carteles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_evento: nombreEvento,
          nombre_dj: nombreDj,
          fecha,
          cartel_path: imageUrl,
          prompt_ia: prompt,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error guardando');
      setSaved(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  }

  return (
    <StudioLayout>
      <div className="p-8 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/studio/carteles" className="text-gray-600 hover:text-gray-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Generar cartel con IA</h1>
            <p className="text-xs text-gray-600 mt-0.5">Describe el evento → revisa el prompt → genera la imagen</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {(['form', 'prompt', 'result'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s ? 'bg-violet-600 text-white' :
                (i < ['form','prompt','result'].indexOf(step)) ? 'bg-violet-900/50 text-violet-400' :
                'bg-white/[0.05] text-gray-600'
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-px ${i < ['form','prompt','result'].indexOf(step) ? 'bg-violet-700' : 'bg-white/[0.08]'}`} />}
            </div>
          ))}
          <span className="ml-2 text-xs text-gray-600">
            {step === 'form' ? 'Describe el evento' : step === 'prompt' ? 'Revisa el prompt' : 'Resultado'}
          </span>
        </div>

        {/* ── Step 1: Form ── */}
        {step === 'form' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Nombre del evento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nombreEvento}
                onChange={(e) => setNombreEvento(e.target.value)}
                placeholder="Ej: Noche Techno Valencia"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-700 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Nombre del DJ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nombreDj}
                onChange={(e) => setNombreDj(e.target.value)}
                placeholder="Ej: DJ Martina"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-700 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Fecha</label>
              <input
                type="text"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                placeholder="Ej: 14 de junio de 2026"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-700 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Estilo / ambiente
              </label>
              <textarea
                value={estilo}
                onChange={(e) => setEstilo(e.target.value)}
                placeholder="Ej: techno oscuro, luces azules y moradas, ambiente underground, industrial"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-700 focus:outline-none focus:border-violet-500/50 transition-colors text-sm resize-none"
              />
            </div>

            {promptError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {promptError}
              </p>
            )}

            <button
              onClick={handleGeneratePrompt}
              disabled={generatingPrompt}
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/50 disabled:text-violet-700 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2"
            >
              {generatingPrompt ? (
                <>
                  <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  Generando prompt...
                </>
              ) : (
                'Generar prompt con IA →'
              )}
            </button>
          </div>
        )}

        {/* ── Step 2: Prompt review ── */}
        {step === 'prompt' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Prompt generado — edítalo si quieres
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-200 focus:outline-none focus:border-violet-500/50 transition-colors text-sm resize-none leading-relaxed font-mono"
              />
              <p className="text-xs text-gray-700 mt-2">
                En inglés, optimizado para Flux/Stable Diffusion. Sin texto legible (los modelos no renderizan letras bien).
              </p>
            </div>

            {engines.length > 1 && (
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-3">Motor</label>
                <div className="flex gap-2 flex-wrap">
                  {engines.map((eng) => (
                    <button
                      key={eng}
                      onClick={() => setSelectedEngine(eng)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        selectedEngine === eng
                          ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                          : 'bg-white/[0.03] border-white/[0.08] text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {ENGINE_LABELS[eng]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {engines.length === 1 && (
              <p className="text-xs text-gray-600">
                Motor: <span className="text-gray-400">{ENGINE_LABELS[selectedEngine]}</span>
              </p>
            )}

            {genError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {genError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('form')}
                className="px-5 py-3 rounded-xl border border-white/[0.08] text-gray-500 hover:text-gray-300 transition-colors text-sm"
              >
                ← Volver
              </button>
              <button
                onClick={handleGenerateImage}
                disabled={generating || !prompt.trim()}
                className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/50 disabled:text-violet-700 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                    Generando imagen...
                  </>
                ) : (
                  'Generar cartel →'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Result ── */}
        {step === 'result' && (
          <div className="space-y-6">
            <div className="rounded-2xl overflow-hidden border border-white/[0.08]" style={{ aspectRatio: '3/4' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={nombreEvento}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs text-gray-600 text-center">
              Generado con <span className="text-gray-400">{ENGINE_LABELS[engineUsed as Engine] ?? engineUsed}</span>
            </p>

            {saveError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {saveError}
              </p>
            )}

            {saved ? (
              <div className="text-center space-y-3">
                <p className="text-emerald-400 text-sm font-medium">✓ Guardado en carteles</p>
                <Link
                  href="/studio/carteles"
                  className="inline-block px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
                >
                  Ver todos los carteles
                </Link>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('prompt')}
                  className="px-4 py-3 rounded-xl border border-white/[0.08] text-gray-500 hover:text-gray-300 transition-colors text-sm"
                >
                  Editar prompt
                </button>
                <button
                  onClick={handleGenerateImage}
                  disabled={generating}
                  className="px-4 py-3 rounded-xl border border-white/[0.08] text-gray-500 hover:text-gray-300 disabled:opacity-40 transition-colors text-sm flex items-center gap-2"
                >
                  {generating ? (
                    <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  Regenerar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/50 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  {saving ? 'Guardando...' : 'Guardar en carteles'}
                </button>
              </div>
            )}

            {/* Download */}
            {!saved && (
              <a
                href={imageUrl}
                download={`cartel-${nombreEvento.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                className="block text-center text-xs text-gray-700 hover:text-gray-500 transition-colors"
              >
                Descargar imagen directamente
              </a>
            )}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
```

- [ ] **Step 3: Verificar TS**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
git add src/app/studio/carteles/nuevo-ia/
git commit -m "feat(studio): add nuevo-ia page — 3-step AI cartel generator"
```

---

## Task 9: Build final y deploy

- [ ] **Step 1: Build completo**

```bash
cd /home/ubuntu/luisgranero-com && npm run build 2>&1 | tail -30
```

Esperado: sin errores. Warnings de ESLint aceptables siempre que no sean errores de tipo.

- [ ] **Step 2: Deploy con PM2**

```bash
cd /home/ubuntu/luisgranero-com && pm2 restart luisgranero-com
```

- [ ] **Step 3: Verificar que el sidebar ya no tiene el bloque APIs**

```bash
curl -s http://localhost:3000/studio 2>/dev/null | grep -c "APIs" || echo "0 — correcto"
```

- [ ] **Step 4: Commit final si quedan cambios**

```bash
git status && git diff --stat
```

---

## Self-review

**Spec coverage:**
- [x] Quitar bloque APIs sidebar → Task 1
- [x] Botón "Generar con IA" en carteles → Task 2
- [x] Modelo StudioCartel actualizado con tipo/prompt_ia → Task 3
- [x] POST carteles para guardar → Task 4
- [x] Servir imágenes IA → Task 5
- [x] generate-cartel-prompt → Task 6
- [x] generate-cartel-ia (GET engines + POST generate) → Task 7
- [x] Página nuevo-ia 3 pasos → Task 8
- [x] Build y deploy → Task 9

**Type consistency:**
- `Engine` type usado consistentemente en todo el frontend
- `callLLM` con `LLMConfig` de `llm-client.ts` — mismo patrón que generate-thumbnail
- `getStudioSession` importado de `@/lib/studio/session` en todas las rutas
- `StudioCartel.create({ tipo: 'ia' })` — campo añadido en Task 3

**Placeholder check:** Ningún TBD ni TODO en el plan.
