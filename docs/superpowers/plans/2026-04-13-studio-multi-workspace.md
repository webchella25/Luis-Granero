# Studio Multi-Workspace y Multi-Canal — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir sistema multi-workspace y multi-canal al Studio con autenticación JWT real, selector de canal, y aislamiento completo de datos en MongoDB por `canal_id`.

**Architecture:** Dos nuevas colecciones MongoDB (`studio_workspaces`, `studio_canales`) + JWT firmado con `{ workspace_id, canal_id }` en la cookie `studio_session`. El middleware de Next.js verifica el JWT e inyecta `x-studio-workspace-id` y `x-studio-canal-id` como headers en todas las peticiones autenticadas. Un script de migración no-destructivo asigna `canal_id` a todos los documentos existentes del canal "Almas Corruptas" antes de que el código empiece a filtrar. Los tokens de YouTube se mueven de `studio_config` al documento del canal.

**Tech Stack:** Next.js 14 App Router, MongoDB/Mongoose, `jose` (JWT — ya instalado), `bcryptjs` (ya instalado como `^3.0.3`), TypeScript

---

## Estructura de archivos

**Archivos nuevos:**
- `src/models/StudioWorkspace.ts` — modelo workspace con password_hash
- `src/models/StudioCanal.ts` — modelo canal con config, youtube_tokens
- `src/lib/studio/session.ts` — helpers JWT (crear, verificar, leer de headers)
- `scripts/migrate-studio-multicanal.ts` — script de migración no-destructivo
- `src/app/studio/seleccionar-canal/page.tsx` — pantalla selector de canal post-login
- `src/app/api/studio/canal/select/route.ts` — POST para actualizar canal_id en JWT
- `src/app/api/studio/canales/route.ts` — GET lista canales, POST crear canal
- `src/app/api/studio/canales/[id]/route.ts` — GET, PATCH canal individual
- `src/app/studio/canales/page.tsx` — página de gestión de canales

**Archivos modificados:**
- `src/app/api/studio/auth/route.ts` — validar contra workspace, emitir JWT
- `middleware.js` — verificar JWT en lugar de cookie simple
- `src/components/studio/StudioLayout.tsx` — añadir selector de canal
- `src/models/StudioScript.ts` — añadir campo `canal_id`
- `src/models/StudioCalendario.ts` — añadir campo `canal_id`
- `src/models/StudioCartel.ts` — añadir campo `canal_id`
- `src/models/StudioFondo.ts` — añadir campo `canal_id`
- `src/models/StudioDj.ts` — añadir campo `workspace_id`
- `src/app/api/studio/generate-script/route.ts` — filtrar por canal_id + usar system_prompt del canal
- `src/app/api/studio/scripts/route.ts` — filtrar por canal_id
- `src/app/api/studio/scripts/[id]/route.ts` — verificar canal_id en doc
- `src/app/api/studio/calendario/route.ts` — filtrar por canal_id
- `src/app/api/studio/calendario/entry/route.ts` — añadir canal_id al crear
- `src/app/api/studio/carteles/route.ts` — filtrar por canal_id
- `src/app/api/studio/carteles/[id]/route.ts` — verificar canal_id
- `src/app/api/studio/carteles/[id]/recompose/route.ts` — verificar canal_id
- `src/app/api/studio/carteles/generate/route.ts` — añadir canal_id al crear
- `src/app/api/studio/carteles/generate-fondo/route.ts` — añadir canal_id
- `src/app/api/studio/carteles/render/route.ts` — verificar canal_id
- `src/app/api/studio/fondos/route.ts` — filtrar por canal_id
- `src/app/api/studio/djs/route.ts` — filtrar por workspace_id
- `src/app/api/studio/djs/[id]/route.ts` — verificar workspace_id
- `src/app/api/studio/djs/[id]/fotos/route.ts` — verificar workspace_id
- `src/app/api/studio/djs/[id]/fotos/[foto_id]/route.ts` — verificar workspace_id
- `src/app/api/studio/youtube/auth/route.ts` — pasar canal_id en state param
- `src/app/api/studio/youtube/callback/route.ts` — guardar tokens en canal
- `src/app/api/studio/youtube/status/route.ts` — leer tokens del canal
- `src/app/api/studio/tts-config/route.ts` — leer/escribir config del canal
- `src/app/api/studio/image-engine-config/route.ts` — leer/escribir config del canal
- `src/app/api/studio/apply-hook/route.ts` — verificar canal_id
- `src/app/api/studio/regenerate-hooks/route.ts` — verificar canal_id
- `src/app/api/studio/regenerate-seo/route.ts` — verificar canal_id
- `src/app/api/studio/save-seo-selection/route.ts` — verificar canal_id
- `src/app/api/studio/generate-audio/route.ts` — verificar canal_id
- `src/app/api/studio/generate-audio-edge/route.ts` — verificar canal_id
- `src/app/api/studio/generate-images/route.ts` — verificar canal_id
- `src/app/api/studio/generate-images-hf/route.ts` — verificar canal_id
- `src/app/api/studio/generate-video/route.ts` — verificar canal_id
- `src/app/api/studio/generate-short/route.ts` — verificar canal_id
- `src/app/api/studio/generate-thumbnail/route.ts` — verificar canal_id
- `src/app/api/studio/recompose-thumbnail/route.ts` — verificar canal_id
- `src/app/api/studio/upload-youtube/route.ts` — verificar canal_id + leer tokens del canal
- `src/app/api/studio/upload-youtube-short/route.ts` — verificar canal_id + leer tokens del canal
- `src/app/studio/configuracion/page.tsx` — añadir sección "Canal"
- `src/lib/studio/youtube-auth.ts` — refactorizar para operar por canal
- `src/app/studio/login/page.tsx` — sin cambios de UI, ya funciona
- `src/app/studio/seleccionar-canal/page.tsx` — nueva (listado arriba)

**No se modifica:**
- `src/app/api/studio/music/` — música compartida entre canales (sin canal_id)
- `src/app/api/studio/api-status/` — estado global de APIs

---

## Task 1: Modelos StudioWorkspace + StudioCanal + helper de sesión

**Files:**
- Create: `src/models/StudioWorkspace.ts`
- Create: `src/models/StudioCanal.ts`
- Create: `src/lib/studio/session.ts`

- [ ] **Step 1: Crear StudioWorkspace.ts**

```typescript
// src/models/StudioWorkspace.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudioWorkspace extends Document {
  nombre: string;
  password_hash: string;
  creado_en: Date;
}

const StudioWorkspaceSchema = new Schema<IStudioWorkspace>({
  nombre: { type: String, required: true, trim: true },
  password_hash: { type: String, required: true },
  creado_en: { type: Date, default: Date.now },
});

const StudioWorkspace: Model<IStudioWorkspace> =
  mongoose.models.StudioWorkspace ||
  mongoose.model<IStudioWorkspace>('StudioWorkspace', StudioWorkspaceSchema);

export default StudioWorkspace;
```

- [ ] **Step 2: Crear StudioCanal.ts**

```typescript
// src/models/StudioCanal.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface YoutubeTokensCanal {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expiry_date: number;
  scope: string;
  canal_nombre?: string;
  canal_id_yt?: string;
}

export interface CanalConfig {
  voz_motor: 'elevenlabs' | 'edge-tts';
  voz_id: string;
  imagen_motor: 'huggingface' | 'freepik';
  system_prompt_guion: string;
  tono: string;
  idioma: string;
}

export interface IStudioCanal extends Document {
  workspace_id: string;
  nombre: string;
  descripcion: string;
  nicho: string;
  youtube_tokens: YoutubeTokensCanal | null;
  config: CanalConfig;
  creado_en: Date;
}

const StudioCanalSchema = new Schema<IStudioCanal>({
  workspace_id: { type: String, required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, default: '' },
  nicho: { type: String, default: '' },
  youtube_tokens: { type: Schema.Types.Mixed, default: null },
  config: {
    voz_motor: { type: String, enum: ['elevenlabs', 'edge-tts'], default: 'elevenlabs' },
    voz_id: { type: String, default: '' },
    imagen_motor: { type: String, enum: ['huggingface', 'freepik'], default: 'freepik' },
    system_prompt_guion: { type: String, default: '' },
    tono: { type: String, default: '' },
    idioma: { type: String, default: 'es-ES' },
  },
  creado_en: { type: Date, default: Date.now },
});

const StudioCanal: Model<IStudioCanal> =
  mongoose.models.StudioCanal ||
  mongoose.model<IStudioCanal>('StudioCanal', StudioCanalSchema);

export default StudioCanal;
```

- [ ] **Step 3: Crear src/lib/studio/session.ts**

```typescript
// src/lib/studio/session.ts
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error('JWT_SECRET o NEXTAUTH_SECRET no configurado');
  return new TextEncoder().encode(s);
}

export interface StudioSession {
  workspace_id: string;
  canal_id: string | null;
}

export async function createStudioJWT(session: StudioSession): Promise<string> {
  return new SignJWT({ workspace_id: session.workspace_id, canal_id: session.canal_id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyStudioJWT(token: string): Promise<StudioSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const workspace_id = payload.workspace_id as string | undefined;
    if (!workspace_id) return null;
    return {
      workspace_id,
      canal_id: (payload.canal_id as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

// Leer sesión desde headers inyectados por middleware
export function getStudioSession(request: NextRequest): StudioSession | null {
  const workspace_id = request.headers.get('x-studio-workspace-id');
  if (!workspace_id) return null;
  const canal_id = request.headers.get('x-studio-canal-id') || null;
  return { workspace_id, canal_id };
}
```

- [ ] **Step 4: Verificar que TypeScript compila los nuevos archivos**

```bash
cd /home/ubuntu/luisgranero-com
npx tsc --noEmit 2>&1 | grep -E "StudioWorkspace|StudioCanal|session" | head -20
```

Expected: sin errores en los nuevos archivos (puede haber errores preexistentes en otros).

- [ ] **Step 5: Commit**

```bash
git add src/models/StudioWorkspace.ts src/models/StudioCanal.ts src/lib/studio/session.ts
git commit -m "feat(studio): add StudioWorkspace, StudioCanal models and session JWT helper"
```

---

## Task 2: Script de migración

**Files:**
- Create: `scripts/migrate-studio-multicanal.ts`

El script es idempotente: comprueba si el workspace ya existe antes de crear nada. Ejecutar UNA VEZ en producción antes de desplegar el nuevo código. 

**Prerequisito:** El .env debe tener `STUDIO_PASSWORD` y `MONGODB_URI`.

- [ ] **Step 1: Crear scripts/migrate-studio-multicanal.ts**

```typescript
// scripts/migrate-studio-multicanal.ts
// Ejecutar: npx ts-node --project tsconfig.json scripts/migrate-studio-multicanal.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const STUDIO_PASSWORD = process.env.STUDIO_PASSWORD;

if (!MONGODB_URI) { console.error('MONGODB_URI no configurado'); process.exit(1); }
if (!STUDIO_PASSWORD) { console.error('STUDIO_PASSWORD no configurado'); process.exit(1); }

const SYSTEM_PROMPT_ALMAS = `Eres un guionista experto en contenido de divulgación histórica para YouTube.
Escribes guiones para vídeos faceless narrados en voz en off, en español de España.

Reglas de escritura:
- Español de España (vosotros, castellano peninsular estándar)
- Sin emojis, sin asteriscos de markdown
- Frases cortas y contundentes, ritmo ágil
- Optimizado para ser narrado en voz en off (nada de "a continuación veremos" o lenguaje de texto)
- Tiempo verbal: pasado preferentemente, presente histórico para dramatismo
- Nunca uses "En conclusión" ni "Para finalizar"
- Cada sección debe fluir naturalmente hacia la siguiente
- Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes ni después

Formato de respuesta obligatorio:
{
  "sections": [
    { "title": "título de la sección", "content": "texto completo de la sección" },
    ...
  ]
}`;

const SYSTEM_PROMPT_SABORES = `Eres un experto en nutrición y cocina saludable. 
Generas guiones para vídeos de YouTube sobre recetas sanas, 
consejos nutricionales y alimentación equilibrada. El tono es 
cercano, motivador y accesible. Los guiones están en español 
de España, sin tecnicismos innecesarios.`;

async function main() {
  await mongoose.connect(MONGODB_URI!);
  console.log('✅ Conectado a MongoDB');

  const db = mongoose.connection.db!;

  // 1. Verificar si ya migrado
  const existingWorkspace = await db.collection('studio_workspaces').findOne({ nombre: 'Luis Granero' });
  if (existingWorkspace) {
    console.log('⚠️  Workspace "Luis Granero" ya existe. Migración ya aplicada o parcialmente aplicada.');
    const canales = await db.collection('studio_canales').find({ workspace_id: existingWorkspace._id.toString() }).toArray();
    console.log(`   Canales existentes: ${canales.map((c) => c.nombre).join(', ')}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  // 2. Crear workspace
  const passwordHash = await bcrypt.hash(STUDIO_PASSWORD!, 12);
  const wsResult = await db.collection('studio_workspaces').insertOne({
    nombre: 'Luis Granero',
    password_hash: passwordHash,
    creado_en: new Date(),
  });
  const workspaceId = wsResult.insertedId.toString();
  console.log(`✅ Workspace creado: ${workspaceId}`);

  // 3. Migrar tokens de YouTube si existen en studio_config
  const ytConfig = await db.collection('studio_config').findOne({ key: 'youtube_oauth' });
  const youtubeTokens = ytConfig ? ytConfig.data : null;
  if (youtubeTokens) {
    console.log('   Tokens de YouTube encontrados en studio_config — se migrarán al canal Almas Corruptas');
  }

  // 4. Crear canal Almas Corruptas
  const canalAlmasResult = await db.collection('studio_canales').insertOne({
    workspace_id: workspaceId,
    nombre: 'Almas Corruptas',
    descripcion: 'Canal de true crime e historia oscura',
    nicho: 'true crime e historia oscura',
    youtube_tokens: youtubeTokens,
    config: {
      voz_motor: 'elevenlabs',
      voz_id: '',
      imagen_motor: 'freepik',
      system_prompt_guion: SYSTEM_PROMPT_ALMAS,
      tono: 'Oscuro y serio',
      idioma: 'es-ES',
    },
    creado_en: new Date(),
  });
  const canalAlmasId = canalAlmasResult.insertedId.toString();
  console.log(`✅ Canal "Almas Corruptas" creado: ${canalAlmasId}`);

  // 5. Crear canal Sabores Saludables (vacío, sin YouTube)
  const canalSaboresResult = await db.collection('studio_canales').insertOne({
    workspace_id: workspaceId,
    nombre: 'Sabores Saludables',
    descripcion: 'Canal de recetas saludables y nutrición',
    nicho: 'recetas saludables y nutrición',
    youtube_tokens: null,
    config: {
      voz_motor: 'elevenlabs',
      voz_id: '',
      imagen_motor: 'freepik',
      system_prompt_guion: SYSTEM_PROMPT_SABORES,
      tono: 'Amigable y cercano',
      idioma: 'es-ES',
    },
    creado_en: new Date(),
  });
  console.log(`✅ Canal "Sabores Saludables" creado: ${canalSaboresResult.insertedId.toString()}`);

  // 6. Asignar canal_id a documentos existentes sin él
  const collections = ['studio_scripts', 'studio_calendario', 'studio_carteles', 'studio_fondos'];
  for (const col of collections) {
    const result = await db.collection(col).updateMany(
      { canal_id: { $exists: false } },
      { $set: { canal_id: canalAlmasId } }
    );
    console.log(`✅ ${col}: ${result.modifiedCount} documentos actualizados con canal_id`);
  }

  // 7. Asignar workspace_id a DJs existentes
  const djResult = await db.collection('studio_djs').updateMany(
    { workspace_id: { $exists: false } },
    { $set: { workspace_id: workspaceId } }
  );
  console.log(`✅ studio_djs: ${djResult.modifiedCount} documentos actualizados con workspace_id`);

  // 8. Migrar tts_config a canal (si existe)
  const ttsConfig = await db.collection('studio_config').findOne({ key: 'tts_config' });
  const imageConfig = await db.collection('studio_config').findOne({ key: 'image_engine_config' });
  if (ttsConfig?.data) {
    const ttsData = ttsConfig.data as { preferred_engine?: string };
    await db.collection('studio_canales').updateOne(
      { _id: canalAlmasResult.insertedId },
      { $set: { 'config.voz_motor': ttsData.preferred_engine === 'edge-tts' ? 'edge-tts' : 'elevenlabs' } }
    );
    console.log(`✅ tts_config migrado al canal Almas Corruptas`);
  }
  if (imageConfig?.data) {
    const imgData = imageConfig.data as { image_engine?: string };
    const motor = imgData.image_engine === 'huggingface' ? 'huggingface' : 'freepik';
    await db.collection('studio_canales').updateOne(
      { _id: canalAlmasResult.insertedId },
      { $set: { 'config.imagen_motor': motor } }
    );
    console.log(`✅ image_engine_config migrado al canal Almas Corruptas`);
  }

  console.log('\n🎉 Migración completada exitosamente.');
  console.log('   Siguiente paso: desplegar el nuevo código con autenticación JWT.');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error en migración:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Verificar que el script compila**

```bash
cd /home/ubuntu/luisgranero-com
npx tsc --noEmit scripts/migrate-studio-multicanal.ts 2>&1 | head -20
```

Si hay errores de tipos en imports de mongoose, instalar `@types/bcryptjs` si falta:
```bash
npm list @types/bcryptjs 2>&1 | head -3
```
Si no está: `npm install -D @types/bcryptjs`

- [ ] **Step 3: Commit**

```bash
git add scripts/migrate-studio-multicanal.ts
git commit -m "feat(studio): add multi-canal migration script (non-destructive)"
```

---

## Task 3: Actualizar auth API — validar workspace, emitir JWT

**Files:**
- Modify: `src/app/api/studio/auth/route.ts`

El endpoint POST ahora busca un workspace cuya contraseña coincida. Si el workspace tiene solo un canal, incluye `canal_id` directamente en el JWT. Si tiene más de uno, pone `canal_id: null` para que el selector aparezca.

- [ ] **Step 1: Reemplazar src/app/api/studio/auth/route.ts**

```typescript
// src/app/api/studio/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import StudioWorkspace from '@/models/StudioWorkspace';
import StudioCanal from '@/models/StudioCanal';
import { createStudioJWT } from '@/lib/studio/session';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { password } = (await request.json()) as { password?: string };
    if (!password) {
      return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 });
    }

    await connectDB();

    // Buscar todos los workspaces (en este proyecto hay uno)
    const workspaces = await StudioWorkspace.find({}).lean();
    if (workspaces.length === 0) {
      // Fallback: si no hay workspaces aún (pre-migración), comparar con STUDIO_PASSWORD
      const studioPassword = process.env.STUDIO_PASSWORD;
      if (studioPassword && password === studioPassword) {
        // Emitir JWT temporal sin workspace real — solo para emergencias pre-migración
        const token = await createStudioJWT({ workspace_id: 'pre-migration', canal_id: null });
        const response = NextResponse.json({ success: true, requiresCanalSelection: true });
        response.cookies.set('studio_session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });
        return response;
      }
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Verificar contraseña contra cada workspace
    let matchedWorkspace = null;
    for (const ws of workspaces) {
      const ok = await bcrypt.compare(password, ws.password_hash);
      if (ok) { matchedWorkspace = ws; break; }
    }

    if (!matchedWorkspace) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const workspaceId = matchedWorkspace._id.toString();

    // Obtener canales del workspace
    const canales = await StudioCanal.find({ workspace_id: workspaceId }).lean();

    // Si solo hay un canal, entramos directamente
    let canalId: string | null = null;
    let requiresCanalSelection = false;

    if (canales.length === 1) {
      canalId = canales[0]._id.toString();
    } else if (canales.length > 1) {
      requiresCanalSelection = true;
    }

    const token = await createStudioJWT({ workspace_id: workspaceId, canal_id: canalId });

    const response = NextResponse.json({ success: true, requiresCanalSelection });
    response.cookies.set('studio_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Error en auth studio:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('studio_session');
  return response;
}
```

- [ ] **Step 2: Actualizar login page para redirigir al selector si hay múltiples canales**

Modificar `src/app/studio/login/page.tsx`, función `handleSubmit`, reemplazar el bloque `if (res.ok)`:

```typescript
if (res.ok) {
  const data = (await res.json()) as { success: boolean; requiresCanalSelection?: boolean };
  if (data.requiresCanalSelection) {
    window.location.href = '/studio/seleccionar-canal';
  } else {
    window.location.href = '/studio';
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/studio/auth/route.ts src/app/studio/login/page.tsx
git commit -m "feat(studio): auth API issues JWT with workspace_id+canal_id"
```

---

## Task 4: Actualizar middleware para verificar JWT de studio

**Files:**
- Modify: `middleware.js`

Reemplazar el bloque de verificación de studio (líneas 14–40) para verificar el JWT con `jose` y añadir los headers. Si `canal_id` es null y la ruta es una página (no API), redirigir al selector de canal.

- [ ] **Step 1: Reemplazar el bloque studio en middleware.js**

Reemplazar desde `// Proteger rutas Studio con cookie simple` hasta `return NextResponse.next()` (el return antes del bloque admin):

```javascript
// Proteger rutas Studio con JWT
if (pathname.startsWith('/studio') || pathname.startsWith('/api/studio')) {
  // Rutas públicas — sin autenticación
  const isPublic =
    pathname === '/studio/login' ||
    pathname === '/api/studio/auth' ||
    pathname.startsWith('/studio/audio/') ||
    pathname.startsWith('/studio/images/') ||
    pathname.startsWith('/studio/videos/') ||
    pathname.startsWith('/studio/thumbnails/') ||
    pathname.startsWith('/studio/carteles/') ||
    pathname.startsWith('/studio/assets/') ||
    pathname.startsWith('/api/studio/image/') ||
    pathname.startsWith('/api/studio/video/');

  if (isPublic) return NextResponse.next();

  const studioSession = request.cookies.get('studio_session')?.value;

  if (!studioSession) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/studio/login', request.url));
  }

  // Verificar JWT
  let session = null;
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET
    );
    const { payload } = await jwtVerify(studioSession, secret);
    if (payload.workspace_id) {
      session = { workspace_id: payload.workspace_id, canal_id: payload.canal_id ?? null };
    }
  } catch {
    // Token inválido o expirado
  }

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/studio/login', request.url));
    response.cookies.delete('studio_session');
    return response;
  }

  // Inyectar workspace_id y canal_id en headers para los route handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-studio-workspace-id', session.workspace_id);
  if (session.canal_id) requestHeaders.set('x-studio-canal-id', session.canal_id);

  // Si no hay canal seleccionado y no estamos en el selector, redirigir al selector
  const requiresCanal = !pathname.startsWith('/api/') &&
    pathname !== '/studio/seleccionar-canal' &&
    !session.canal_id;
  if (requiresCanal) {
    return NextResponse.redirect(new URL('/studio/seleccionar-canal', request.url));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}
```

También añadir `/studio/seleccionar-canal` al matcher en el `config` export (ya está cubierto por `/studio/:path*`).

- [ ] **Step 2: Verificar que el middleware compila (Next.js lo compilará en dev)**

```bash
cd /home/ubuntu/luisgranero-com
node --input-type=module -e "import('./middleware.js').then(() => console.log('OK')).catch(console.error)" 2>&1 | head -5
```

- [ ] **Step 3: Commit**

```bash
git add middleware.js
git commit -m "feat(studio): middleware verifies JWT and injects workspace/canal headers"
```

---

## Task 5: Selector de canal — página + API

**Files:**
- Create: `src/app/studio/seleccionar-canal/page.tsx`
- Create: `src/app/api/studio/canal/select/route.ts`

- [ ] **Step 1: Crear API route para seleccionar canal**

```typescript
// src/app/api/studio/canal/select/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession, createStudioJWT } from '@/lib/studio/session';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { canal_id } = (await request.json()) as { canal_id?: string };
  if (!canal_id) return NextResponse.json({ error: 'canal_id requerido' }, { status: 400 });

  await connectDB();
  const canal = await StudioCanal.findOne({
    _id: canal_id,
    workspace_id: session.workspace_id,
  }).lean();

  if (!canal) return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 });

  const token = await createStudioJWT({ workspace_id: session.workspace_id, canal_id });

  const response = NextResponse.json({ success: true });
  response.cookies.set('studio_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
  return response;
}
```

- [ ] **Step 2: Crear página selector de canal**

```typescript
// src/app/studio/seleccionar-canal/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface Canal { _id: string; nombre: string; nicho: string }

const EMOJIS: Record<string, string> = {
  'Almas Corruptas': '🎭',
  'Sabores Saludables': '🍎',
};

function getEmoji(nombre: string): string {
  return EMOJIS[nombre] ?? '📺';
}

export default function SeleccionarCanalPage() {
  const [canales, setCanales] = useState<Canal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/studio/canales')
      .then((r) => r.json())
      .then((d: { canales?: Canal[] }) => {
        if (d.canales) setCanales(d.canales);
      })
      .catch(() => setError('Error cargando canales'))
      .finally(() => setLoading(false));
  }, []);

  async function selectCanal(canal_id: string) {
    setSelecting(canal_id);
    setError('');
    try {
      const res = await fetch('/api/studio/canal/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canal_id }),
      });
      if (res.ok) {
        window.location.href = '/studio';
      } else {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? 'Error seleccionando canal');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSelecting(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Seleccionar canal</h1>
          <p className="text-gray-500 text-sm mt-1">Elige con qué canal quieres trabajar</p>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {canales.map((canal) => (
              <button
                key={canal._id}
                onClick={() => selectCanal(canal._id)}
                disabled={!!selecting}
                className="w-full flex items-center gap-4 px-5 py-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-violet-500/40 rounded-2xl text-left transition-all disabled:opacity-60"
              >
                <span className="text-2xl">{getEmoji(canal.nombre)}</span>
                <div>
                  <p className="font-semibold text-white">{canal.nombre}</p>
                  {canal.nicho && <p className="text-xs text-gray-500 mt-0.5">{canal.nicho}</p>}
                </div>
                {selecting === canal._id && (
                  <div className="ml-auto w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                )}
              </button>
            ))}

            <a
              href="/studio/canales"
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-transparent border border-dashed border-white/15 hover:border-white/30 text-gray-600 hover:text-gray-400 text-sm rounded-2xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nuevo canal
            </a>
          </div>
        )}

        {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Crear GET /api/studio/canales**

```typescript
// src/app/api/studio/canales/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();
  const canales = await StudioCanal.find({ workspace_id: session.workspace_id })
    .select('_id nombre nicho descripcion youtube_tokens creado_en')
    .lean();

  const result = canales.map((c) => ({
    _id: c._id.toString(),
    nombre: c.nombre,
    nicho: c.nicho,
    descripcion: c.descripcion,
    youtube_conectado: !!c.youtube_tokens,
    creado_en: c.creado_en,
  }));

  return NextResponse.json({ canales: result });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = (await request.json()) as {
    nombre?: string;
    nicho?: string;
    descripcion?: string;
    tono?: string;
    system_prompt_guion?: string;
    idioma?: string;
  };

  if (!body.nombre?.trim()) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
  }

  await connectDB();
  const canal = await StudioCanal.create({
    workspace_id: session.workspace_id,
    nombre: body.nombre.trim(),
    nicho: body.nicho?.trim() ?? '',
    descripcion: body.descripcion?.trim() ?? '',
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

  return NextResponse.json({ success: true, canal_id: canal._id.toString() }, { status: 201 });
}
```

- [ ] **Step 4: Crear GET/PATCH /api/studio/canales/[id]**

```typescript
// src/app/api/studio/canales/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const canal = await StudioCanal.findOne({ _id: id, workspace_id: session.workspace_id }).lean();
  if (!canal) return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 });

  return NextResponse.json({ canal: { ...canal, _id: canal._id.toString() } });
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  // Campos permitidos para actualización
  const allowed = ['nombre', 'nicho', 'descripcion', 'config'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }
  // Permitir actualización de campos de config individualmente
  if (body.system_prompt_guion !== undefined) update['config.system_prompt_guion'] = body.system_prompt_guion;
  if (body.tono !== undefined) update['config.tono'] = body.tono;
  if (body.voz_motor !== undefined) update['config.voz_motor'] = body.voz_motor;
  if (body.imagen_motor !== undefined) update['config.imagen_motor'] = body.imagen_motor;
  if (body.idioma !== undefined) update['config.idioma'] = body.idioma;

  await connectDB();
  const canal = await StudioCanal.findOneAndUpdate(
    { _id: id, workspace_id: session.workspace_id },
    { $set: update },
    { new: true }
  ).lean();

  if (!canal) return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 });
  return NextResponse.json({ success: true, canal: { ...canal, _id: canal._id.toString() } });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/studio/canal/select/route.ts src/app/studio/seleccionar-canal/page.tsx src/app/api/studio/canales/route.ts src/app/api/studio/canales/[id]/route.ts
git commit -m "feat(studio): canal selector page and API endpoints"
```

---

## Task 6: Canal switcher en el sidebar

**Files:**
- Modify: `src/components/studio/StudioLayout.tsx`

Añadir un selector de canal en la parte superior del sidebar (debajo del logo, encima de la nav). Muestra el canal activo y un dropdown para cambiar de canal sin cerrar sesión.

- [ ] **Step 1: Modificar StudioLayout.tsx**

Añadir nuevos types e imports al inicio (después de los imports existentes):

```typescript
interface Canal { _id: string; nombre: string; nicho: string }

const CANAL_EMOJIS: Record<string, string> = {
  'Almas Corruptas': '🎭',
  'Sabores Saludables': '🍎',
};
function getCanalEmoji(nombre: string): string {
  return CANAL_EMOJIS[nombre] ?? '📺';
}
```

En el componente `StudioLayout`, añadir estado después de `const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);`:

```typescript
const [canales, setCanales] = useState<Canal[]>([]);
const [canalActivo, setCanalActivo] = useState<Canal | null>(null);
const [showCanalDropdown, setShowCanalDropdown] = useState(false);
const [switchingCanal, setSwitchingCanal] = useState(false);
```

En el `useEffect`, añadir fetch de canales:

```typescript
fetch('/api/studio/canales')
  .then((r) => r.json())
  .then((d: { canales?: Canal[] }) => {
    if (d.canales) {
      setCanales(d.canales);
      // Detectar canal activo (hay que añadir endpoint /api/studio/canal/current o leer de otro lado)
      // Por simplicidad: el canal activo es el primero que el servidor ya tiene en sesión.
      // El sidebar recibe este dato del endpoint que ya existe.
    }
  })
  .catch(() => null);
```

Añadir endpoint `/api/studio/canal/current`:

```typescript
// src/app/api/studio/canal/current/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ canal: null });

  await connectDB();
  const canal = await StudioCanal.findById(session.canal_id)
    .select('_id nombre nicho')
    .lean();

  if (!canal) return NextResponse.json({ canal: null });
  return NextResponse.json({ canal: { _id: canal._id.toString(), nombre: canal.nombre, nicho: canal.nicho } });
}
```

Actualizar el useEffect en StudioLayout para cargar el canal actual:

```typescript
useEffect(() => {
  fetch('/api/studio/api-status')
    .then((r) => r.json())
    .then((d) => setApiStatus(d as ApiStatus))
    .catch(() => null);

  fetch('/api/studio/canales')
    .then((r) => r.json())
    .then((d: { canales?: Canal[] }) => { if (d.canales) setCanales(d.canales); })
    .catch(() => null);

  fetch('/api/studio/canal/current')
    .then((r) => r.json())
    .then((d: { canal?: Canal }) => { if (d.canal) setCanalActivo(d.canal); })
    .catch(() => null);
}, []);
```

Añadir función `switchCanal`:

```typescript
async function switchCanal(canal_id: string) {
  setSwitchingCanal(true);
  setShowCanalDropdown(false);
  try {
    const res = await fetch('/api/studio/canal/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canal_id }),
    });
    if (res.ok) window.location.reload();
  } finally {
    setSwitchingCanal(false);
  }
}
```

Insertar el selector de canal en el sidebar, justo después del bloque `{/* Logo */}` y antes de `{/* Nav */}`:

```tsx
{/* Canal selector */}
{canales.length > 0 && (
  <div className="px-3 py-2 border-b border-white/[0.06] relative">
    <button
      onClick={() => setShowCanalDropdown(!showCanalDropdown)}
      disabled={switchingCanal}
      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/8 transition-all text-left"
    >
      <span className="text-base leading-none">
        {canalActivo ? getCanalEmoji(canalActivo.nombre) : '📺'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">
          {canalActivo?.nombre ?? 'Sin canal'}
        </p>
        {canalActivo?.nicho && (
          <p className="text-[10px] text-gray-600 truncate">{canalActivo.nicho}</p>
        )}
      </div>
      {switchingCanal ? (
        <div className="w-3 h-3 rounded-full border border-white/20 border-t-white/60 animate-spin shrink-0" />
      ) : (
        <svg className="w-3 h-3 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </button>

    {showCanalDropdown && (
      <div className="absolute left-3 right-3 top-full mt-1 bg-[#0D1220] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
        {canales.map((canal) => (
          <button
            key={canal._id}
            onClick={() => switchCanal(canal._id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/[0.06] transition-colors ${
              canal._id === canalActivo?._id ? 'bg-violet-600/10 text-violet-300' : 'text-gray-300'
            }`}
          >
            <span className="text-sm">{getCanalEmoji(canal.nombre)}</span>
            <span className="text-xs font-medium">{canal.nombre}</span>
            {canal._id === canalActivo?._id && (
              <svg className="w-3 h-3 text-violet-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </button>
        ))}
        <div className="border-t border-white/5">
          <a
            href="/studio/canales"
            className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-600 hover:text-gray-400 hover:bg-white/[0.04] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Gestionar canales
          </a>
        </div>
      </div>
    )}
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/studio/StudioLayout.tsx src/app/api/studio/canal/current/route.ts
git commit -m "feat(studio): canal switcher in sidebar with dropdown"
```

---

## Task 7: Añadir canal_id a los modelos Mongoose

**Files:**
- Modify: `src/models/StudioScript.ts`
- Modify: `src/models/StudioCalendario.ts`
- Modify: `src/models/StudioCartel.ts`
- Modify: `src/models/StudioFondo.ts`
- Modify: `src/models/StudioDj.ts`

Leer los modelos completos con `smart_outline` antes de editar. Añadir `canal_id` (o `workspace_id` para DJs) como campo opcional con índice. El campo es opcional para no romper documentos existentes que aún no fueron migrados.

- [ ] **Step 1: Añadir canal_id a StudioScript**

Abrir el archivo y localizar el Schema. Añadir el campo en el esquema:

```typescript
canal_id: { type: String, index: true, default: null },
```

Y en la interfaz TypeScript:
```typescript
canal_id: string | null;
```

- [ ] **Step 2: Repetir para StudioCalendario, StudioCartel, StudioFondo**

Mismo cambio en los 3 archivos: campo `canal_id: { type: String, index: true, default: null }` en el schema y `canal_id: string | null` en la interfaz.

- [ ] **Step 3: Añadir workspace_id a StudioDj**

```typescript
// En la interfaz:
workspace_id: string | null;
// En el schema:
workspace_id: { type: String, index: true, default: null },
```

- [ ] **Step 4: Verificar compilación TypeScript**

```bash
cd /home/ubuntu/luisgranero-com
npx tsc --noEmit 2>&1 | grep -E "StudioScript|StudioCalendario|StudioCartel|StudioFondo|StudioDj" | head -20
```

- [ ] **Step 5: Commit**

```bash
git add src/models/StudioScript.ts src/models/StudioCalendario.ts src/models/StudioCartel.ts src/models/StudioFondo.ts src/models/StudioDj.ts
git commit -m "feat(studio): add canal_id/workspace_id fields to Studio mongoose models"
```

---

## Task 8: Actualizar rutas de guiones para filtrar por canal_id

**Patrón de cambio:** En cada route handler que accede a colecciones de guiones, añadir:

```typescript
import { getStudioSession } from '@/lib/studio/session';

// Al inicio del handler:
const session = getStudioSession(request);
if (!session?.canal_id) {
  return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
}
const { canal_id } = session;
```

Luego modificar las queries:
- `.find({})` → `.find({ canal_id })`
- `.create({ ... })` → `.create({ ..., canal_id })`
- `.findById(id)` → verificar `doc.canal_id === canal_id` o añadir a la query

**Files:**
- Modify: `src/app/api/studio/generate-script/route.ts`
- Modify: `src/app/api/studio/scripts/route.ts`
- Modify: `src/app/api/studio/scripts/[id]/route.ts`
- Modify: `src/app/api/studio/apply-hook/route.ts`
- Modify: `src/app/api/studio/regenerate-hooks/route.ts`
- Modify: `src/app/api/studio/regenerate-seo/route.ts`
- Modify: `src/app/api/studio/save-seo-selection/route.ts`
- Modify: `src/app/api/studio/generate-audio/route.ts`
- Modify: `src/app/api/studio/generate-audio-edge/route.ts`
- Modify: `src/app/api/studio/generate-images/route.ts`
- Modify: `src/app/api/studio/generate-images-hf/route.ts`
- Modify: `src/app/api/studio/generate-video/route.ts`
- Modify: `src/app/api/studio/generate-short/route.ts`
- Modify: `src/app/api/studio/generate-thumbnail/route.ts`
- Modify: `src/app/api/studio/recompose-thumbnail/route.ts`

- [ ] **Step 1: Actualizar generate-script/route.ts — añadir canal_id y system_prompt dinámico**

En `generate-script/route.ts`, añadir imports:

```typescript
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';
```

Reemplazar la función `buildSystemPrompt()` para aceptar un prompt override:

```typescript
function buildSystemPrompt(override?: string): string {
  if (override?.trim()) return override.trim();
  return `Eres un guionista experto en contenido de divulgación histórica para YouTube.
Escribes guiones para vídeos faceless narrados en voz en off, en español de España.

Reglas de escritura:
- Español de España (vosotros, castellano peninsular estándar)
- Sin emojis, sin asteriscos de markdown
- Frases cortas y contundentes, ritmo ágil
- Optimizado para ser narrado en voz en off (nada de "a continuación veremos" o lenguaje de texto)
- Tiempo verbal: pasado preferentemente, presente histórico para dramatismo
- Nunca uses "En conclusión" ni "Para finalizar"
- Cada sección debe fluir naturalmente hacia la siguiente
- Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes ni después

Formato de respuesta obligatorio:
{
  "sections": [
    { "title": "título de la sección", "content": "texto completo de la sección" },
    ...
  ]
}`;
}
```

Al inicio del handler POST, antes de validar el body:

```typescript
const session = getStudioSession(request);
if (!session?.canal_id) {
  return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
}

await connectDB();
const canal = await StudioCanal.findById(session.canal_id).lean();
const systemPromptOverride = canal?.config?.system_prompt_guion ?? '';
```

Al crear en Anthropic, pasar el override:

```typescript
system: buildSystemPrompt(systemPromptOverride),
```

Al guardar en MongoDB, añadir `canal_id`:

```typescript
const script = await StudioScript.create({
  personaje: validBody.personaje.trim(),
  epoca: validBody.epoca.trim(),
  tono: validBody.tono,
  duracion: validBody.duracion,
  guion_json: parsed.sections,
  canal_id: session.canal_id,
});
```

- [ ] **Step 2: Actualizar scripts/route.ts**

Leer el archivo. Añadir `getStudioSession` import. Reemplazar la query `.find({})` con `.find({ canal_id })`.

- [ ] **Step 3: Actualizar scripts/[id]/route.ts**

Leer el archivo. Para los métodos GET/PATCH/DELETE, añadir verificación de sesión. En las queries de findById, añadir verificación: si el script encontrado tiene `canal_id` diferente al de la sesión (y no es null), devolver 404.

- [ ] **Step 4: Actualizar las 12 rutas restantes que operan sobre studio_scripts**

Para cada una de las rutas: `apply-hook`, `regenerate-hooks`, `regenerate-seo`, `save-seo-selection`, `generate-audio`, `generate-audio-edge`, `generate-images`, `generate-images-hf`, `generate-video`, `generate-short`, `generate-thumbnail`, `recompose-thumbnail`:

1. Leer el archivo con Read
2. Añadir import de `getStudioSession`
3. Añadir al inicio del handler: `const session = getStudioSession(request); if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });`
4. En el findById de StudioScript, no es necesario filtrar por canal_id (el ID ya es suficientemente específico), pero verificar que `script.canal_id === session.canal_id || script.canal_id === null` para retrocompatibilidad

- [ ] **Step 5: Verificar TypeScript**

```bash
cd /home/ubuntu/luisgranero-com
npx tsc --noEmit 2>&1 | grep "api/studio/scripts\|generate-script\|generate-audio\|generate-video" | head -20
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/studio/generate-script/route.ts \
  src/app/api/studio/scripts/route.ts \
  src/app/api/studio/scripts/\[id\]/route.ts \
  src/app/api/studio/apply-hook/route.ts \
  src/app/api/studio/regenerate-hooks/route.ts \
  src/app/api/studio/regenerate-seo/route.ts \
  src/app/api/studio/save-seo-selection/route.ts \
  src/app/api/studio/generate-audio/route.ts \
  src/app/api/studio/generate-audio-edge/route.ts \
  src/app/api/studio/generate-images/route.ts \
  src/app/api/studio/generate-images-hf/route.ts \
  src/app/api/studio/generate-video/route.ts \
  src/app/api/studio/generate-short/route.ts \
  src/app/api/studio/generate-thumbnail/route.ts \
  src/app/api/studio/recompose-thumbnail/route.ts
git commit -m "feat(studio): filter scripts routes by canal_id, use canal system_prompt"
```

---

## Task 9: Actualizar rutas de calendario, carteles y fondos

**Files:**
- Modify: `src/app/api/studio/calendario/route.ts`
- Modify: `src/app/api/studio/calendario/entry/route.ts`
- Modify: `src/app/api/studio/carteles/route.ts`
- Modify: `src/app/api/studio/carteles/[id]/route.ts`
- Modify: `src/app/api/studio/carteles/[id]/recompose/route.ts`
- Modify: `src/app/api/studio/carteles/generate/route.ts`
- Modify: `src/app/api/studio/carteles/generate-fondo/route.ts`
- Modify: `src/app/api/studio/carteles/render/route.ts`
- Modify: `src/app/api/studio/fondos/route.ts`

Aplicar el mismo patrón que Task 8:
1. Import `getStudioSession`
2. Verificar `session?.canal_id`
3. Añadir `canal_id` a todas las queries y operaciones de creación

Para las rutas de carteles que llaman a `StudioScript.findById(scriptId)`, verificar la existencia pero NO añadir filtro por canal_id ahí (los carteles tienen su propio canal_id).

- [ ] **Step 1: Leer y actualizar calendario/route.ts**

Añadir `import { getStudioSession } from '@/lib/studio/session';`

En GET handler: `const { canal_id } = session; const entries = await StudioCalendario.find({ canal_id }).sort(...)...`

En POST handler de creación de entry: añadir `canal_id` al objeto creado.

- [ ] **Step 2: Actualizar calendario/entry/route.ts**

Mismo patrón: sesión + canal_id en queries y creación.

- [ ] **Step 3: Actualizar carteles/route.ts, carteles/[id]/route.ts**

Añadir sesión y filtrar por canal_id en GET (listing) y verificar en operaciones por ID.

- [ ] **Step 4: Actualizar carteles/generate/route.ts y carteles/generate-fondo/route.ts**

Añadir `canal_id` al objeto que se crea en MongoDB.

- [ ] **Step 5: Actualizar carteles/[id]/recompose/route.ts y carteles/render/route.ts**

Añadir verificación de sesión. No es necesario filtrar si ya se accede por ID específico, pero añadir la verificación de canal para mayor seguridad.

- [ ] **Step 6: Actualizar fondos/route.ts**

Añadir sesión y `canal_id` en queries y creación.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/studio/calendario/ src/app/api/studio/carteles/ src/app/api/studio/fondos/
git commit -m "feat(studio): filter calendario, carteles, fondos routes by canal_id"
```

---

## Task 10: Actualizar rutas de DJs (scope workspace)

**Files:**
- Modify: `src/app/api/studio/djs/route.ts`
- Modify: `src/app/api/studio/djs/[id]/route.ts`
- Modify: `src/app/api/studio/djs/[id]/fotos/route.ts`
- Modify: `src/app/api/studio/djs/[id]/fotos/[foto_id]/route.ts`
- Modify: `src/app/api/studio/djs/[id]/upload/route.ts`

Los DJs son por workspace (no por canal). Usar `session.workspace_id` en lugar de `session.canal_id`.

- [ ] **Step 1: Actualizar djs/route.ts**

```typescript
const session = getStudioSession(request);
if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
const { workspace_id } = session;
// En GET: StudioDj.find({ $or: [{ workspace_id }, { workspace_id: { $exists: false } }] })
// Retrocompatibilidad: también devolver DJs sin workspace_id (los que existían antes)
// En POST creación: añadir workspace_id
```

La query retrocompatible para GET:
```typescript
const djs = await StudioDj.find({
  $or: [{ workspace_id }, { workspace_id: null }, { workspace_id: { $exists: false } }]
}).lean();
```

- [ ] **Step 2: Actualizar djs/[id]/route.ts, djs/[id]/fotos/route.ts, djs/[id]/fotos/[foto_id]/route.ts, djs/[id]/upload/route.ts**

Añadir verificación de sesión en cada route. Para acceso por ID no es estrictamente necesario filtrar por workspace pero añadir `getStudioSession` y verificar que existe.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/studio/djs/
git commit -m "feat(studio): scope DJs routes to workspace_id"
```

---

## Task 11: YouTube OAuth por canal

Los tokens de YouTube se almacenan en el documento del canal (ya migrado en Task 2). Hay que actualizar `youtube-auth.ts` para operar con un `canal_id` en lugar de la clave global de `studio_config`.

**Files:**
- Modify: `src/lib/studio/youtube-auth.ts`
- Modify: `src/app/api/studio/youtube/auth/route.ts`
- Modify: `src/app/api/studio/youtube/callback/route.ts`
- Modify: `src/app/api/studio/youtube/status/route.ts`
- Modify: `src/app/api/studio/upload-youtube/route.ts`
- Modify: `src/app/api/studio/upload-youtube-short/route.ts`

- [ ] **Step 1: Refactorizar src/lib/studio/youtube-auth.ts**

Reemplazar `saveTokens` y `getTokens` (que usan `StudioConfig`) por versiones que operan sobre `StudioCanal`:

```typescript
// src/lib/studio/youtube-auth.ts
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
// ... mantener getOAuthConfig, buildAuthUrl, getChannelInfo, getValidAccessToken igual
// pero cambiar saveTokens y getTokens:

export async function saveTokensForCanal(canalId: string, tokens: YoutubeTokens): Promise<void> {
  await connectDB();
  await StudioCanal.findByIdAndUpdate(canalId, {
    $set: { youtube_tokens: tokens }
  });
}

export async function getTokensForCanal(canalId: string): Promise<YoutubeTokens | null> {
  await connectDB();
  const canal = await StudioCanal.findById(canalId).select('youtube_tokens').lean();
  if (!canal?.youtube_tokens) return null;
  return canal.youtube_tokens as YoutubeTokens;
}

export async function getValidAccessTokenForCanal(canalId: string): Promise<string> {
  const tokens = await getTokensForCanal(canalId);
  if (!tokens) throw new Error('YouTube no está conectado para este canal. Ve a configuración para autenticar.');

  if (tokens.expiry_date > Date.now() + 5 * 60 * 1000) {
    return tokens.access_token;
  }

  // Refrescar
  const { clientId, clientSecret } = getOAuthConfig();
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: tokens.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error refrescando token: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number; token_type: string };
  const newTokens: YoutubeTokens = { ...tokens, access_token: data.access_token, expiry_date: Date.now() + data.expires_in * 1000 };
  await saveTokensForCanal(canalId, newTokens);
  return newTokens.access_token;
}
```

Mantener las funciones antiguas `saveTokens`, `getTokens`, `getValidAccessToken` como wrappers que devuelven error con mensaje claro, para no romper nada que pudiera usarlas.

- [ ] **Step 2: Actualizar youtube/auth/route.ts — pasar canal_id en state**

```typescript
// src/app/api/studio/youtube/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { buildAuthUrl } from '@/lib/studio/youtube-auth';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.redirect(
      new URL('/studio/configuracion?error=Canal+no+seleccionado', request.url)
    );
  }
  try {
    const url = buildAuthUrl(session.canal_id); // pasar canal_id como state
    return NextResponse.redirect(url);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.redirect(
      new URL(`/studio/configuracion?error=${encodeURIComponent(msg)}`, request.url)
    );
  }
}
```

Actualizar `buildAuthUrl` en youtube-auth.ts para aceptar `state`:

```typescript
export function buildAuthUrl(canalId: string): string {
  const { clientId, redirectUri } = getOAuthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: canalId, // canal_id en state para recuperarlo en callback
  });
  return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
}
```

- [ ] **Step 3: Actualizar youtube/callback/route.ts — guardar tokens en canal**

```typescript
// src/app/api/studio/youtube/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokensForCanal } from '@/lib/studio/youtube-auth';

const BASE = process.env.NEXTAUTH_URL ?? 'https://www.luisgranero.com';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const canalId = searchParams.get('state'); // canal_id recuperado del state

  if (error) {
    return NextResponse.redirect(`${BASE}/studio/configuracion?error=${encodeURIComponent(error)}`);
  }
  if (!code || !canalId) {
    return NextResponse.redirect(`${BASE}/studio/configuracion?error=${encodeURIComponent('Datos de autorización incompletos')}`);
  }

  try {
    await exchangeCodeForTokensForCanal(code, canalId);
    return NextResponse.redirect(`${BASE}/studio/configuracion?connected=1`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.redirect(`${BASE}/studio/configuracion?error=${encodeURIComponent(msg)}`);
  }
}
```

Añadir `exchangeCodeForTokensForCanal` en youtube-auth.ts (igual que `exchangeCodeForTokens` pero llama a `saveTokensForCanal`):

```typescript
export async function exchangeCodeForTokensForCanal(code: string, canalId: string): Promise<YoutubeTokens> {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: clientId, client_secret: clientSecret,
      redirect_uri: redirectUri, grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) throw new Error(`Error intercambiando code: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as {
    access_token: string; refresh_token?: string; token_type: string; expires_in: number; scope: string;
  };
  if (!data.refresh_token) throw new Error('No se recibió refresh_token. Revoca el acceso en Google y vuelve a autorizar.');
  const tokens: YoutubeTokens = {
    access_token: data.access_token, refresh_token: data.refresh_token,
    token_type: data.token_type, expiry_date: Date.now() + data.expires_in * 1000, scope: data.scope,
  };
  await saveTokensForCanal(canalId, tokens);
  return tokens;
}
```

- [ ] **Step 4: Actualizar youtube/status/route.ts**

```typescript
// src/app/api/studio/youtube/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTokensForCanal, getChannelInfo } from '@/lib/studio/youtube-auth';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ connected: false });

  try {
    const tokens = await getTokensForCanal(session.canal_id);
    if (!tokens) return NextResponse.json({ connected: false });

    const channelInfo = await getChannelInfo(tokens.access_token);
    return NextResponse.json({ connected: true, channel: channelInfo });
  } catch (err) {
    return NextResponse.json({ connected: false, error: err instanceof Error ? err.message : 'Error' });
  }
}
```

- [ ] **Step 5: Actualizar upload-youtube/route.ts y upload-youtube-short/route.ts**

En ambas rutas, reemplazar `getValidAccessToken()` por `getValidAccessTokenForCanal(session.canal_id)`. Añadir `getStudioSession` al inicio para obtener `canal_id`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/studio/youtube-auth.ts \
  src/app/api/studio/youtube/ \
  src/app/api/studio/upload-youtube/route.ts \
  src/app/api/studio/upload-youtube-short/route.ts
git commit -m "feat(studio): YouTube OAuth and tokens per canal"
```

---

## Task 12: Config TTS e imagen por canal

Las configuraciones de TTS e imagen pasan de `studio_config` (global) al documento del canal activo.

**Files:**
- Modify: `src/app/api/studio/tts-config/route.ts`
- Modify: `src/app/api/studio/image-engine-config/route.ts`

- [ ] **Step 1: Reemplazar tts-config/route.ts**

```typescript
// src/app/api/studio/tts-config/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ preferred_engine: 'auto' });

  await connectDB();
  const canal = await StudioCanal.findById(session.canal_id).select('config').lean();
  const motor = canal?.config?.voz_motor ?? 'elevenlabs';
  // Mapear a los valores que espera la UI
  const preferred_engine = motor === 'edge-tts' ? 'edge-tts' : motor === 'elevenlabs' ? 'elevenlabs' : 'auto';
  return NextResponse.json({ preferred_engine });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const { preferred_engine } = (await request.json()) as { preferred_engine?: string };
  if (!['auto', 'elevenlabs', 'edge-tts'].includes(preferred_engine ?? '')) {
    return NextResponse.json({ error: 'Motor no válido' }, { status: 400 });
  }

  const voz_motor = preferred_engine === 'edge-tts' ? 'edge-tts' : 'elevenlabs';

  await connectDB();
  await StudioCanal.findByIdAndUpdate(session.canal_id, { $set: { 'config.voz_motor': voz_motor } });
  return NextResponse.json({ success: true, preferred_engine });
}
```

- [ ] **Step 2: Reemplazar image-engine-config/route.ts**

```typescript
// src/app/api/studio/image-engine-config/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import StudioConfig from '@/models/StudioConfig';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ image_engine: 'auto', hf_token_configured: false, hf_token_preview: null });
  }

  await connectDB();
  const canal = await StudioCanal.findById(session.canal_id).select('config').lean();
  const motor = canal?.config?.imagen_motor ?? 'freepik';
  const image_engine = motor === 'huggingface' ? 'huggingface' : motor === 'freepik' ? 'freepik' : 'auto';

  // El token de HuggingFace sigue siendo global (es una API key, no por canal)
  const hfConfig = await StudioConfig.findOne({ key: 'image_engine_config' }).lean();
  const hfData = (hfConfig?.data ?? {}) as { hf_token?: string };
  const hf_token_configured = !!hfData.hf_token;
  const hf_token_preview = hf_token_configured ? `${hfData.hf_token!.slice(0, 6)}...` : null;

  return NextResponse.json({ image_engine, hf_token_configured, hf_token_preview });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const body = (await request.json()) as { image_engine?: string; hf_token?: string };
  const { image_engine, hf_token } = body;

  await connectDB();

  if (image_engine && ['auto', 'freepik', 'huggingface'].includes(image_engine)) {
    const imagen_motor = image_engine === 'huggingface' ? 'huggingface' : 'freepik';
    await StudioCanal.findByIdAndUpdate(session.canal_id, { $set: { 'config.imagen_motor': imagen_motor } });
  }

  // El token HF sigue siendo global
  if (hf_token?.trim()) {
    const existing = await StudioConfig.findOne({ key: 'image_engine_config' }).lean();
    const existingData = (existing?.data ?? {}) as Record<string, unknown>;
    await StudioConfig.findOneAndUpdate(
      { key: 'image_engine_config' },
      { key: 'image_engine_config', data: { ...existingData, hf_token: hf_token.trim() }, updated_at: new Date() },
      { upsert: true }
    );
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/studio/tts-config/route.ts src/app/api/studio/image-engine-config/route.ts
git commit -m "feat(studio): TTS and image engine config per canal"
```

---

## Task 13: Página /studio/canales — gestión de canales

**Files:**
- Create: `src/app/studio/canales/page.tsx`

- [ ] **Step 1: Crear página de gestión de canales**

```typescript
// src/app/studio/canales/page.tsx
'use client';

import { useState, useEffect } from 'react';
import StudioLayout from '@/components/studio/StudioLayout';

interface Canal {
  _id: string;
  nombre: string;
  nicho: string;
  descripcion: string;
  youtube_conectado: boolean;
  creado_en: string;
}

const EMOJIS: Record<string, string> = { 'Almas Corruptas': '🎭', 'Sabores Saludables': '🍎' };
function getEmoji(nombre: string) { return EMOJIS[nombre] ?? '📺'; }

export default function CanalesPage() {
  const [canales, setCanales] = useState<Canal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNuevo, setShowNuevo] = useState(false);
  const [form, setForm] = useState({ nombre: '', nicho: '', tono: '', system_prompt_guion: '', idioma: 'es-ES' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function loadCanales() {
    const res = await fetch('/api/studio/canales');
    const d = (await res.json()) as { canales?: Canal[] };
    if (d.canales) setCanales(d.canales);
    setLoading(false);
  }

  useEffect(() => { loadCanales(); }, []);

  async function createCanal(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/studio/canales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowNuevo(false);
        setForm({ nombre: '', nicho: '', tono: '', system_prompt_guion: '', idioma: 'es-ES' });
        await loadCanales();
      } else {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? 'Error creando canal');
      }
    } finally {
      setCreating(false);
    }
  }

  async function enterCanal(canal_id: string) {
    const res = await fetch('/api/studio/canal/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canal_id }),
    });
    if (res.ok) window.location.href = '/studio';
  }

  return (
    <StudioLayout>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-white">Canales</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona los canales de tu workspace</p>
          </div>
          <button
            onClick={() => setShowNuevo(!showNuevo)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo canal
          </button>
        </div>

        {/* Formulario nuevo canal */}
        {showNuevo && (
          <div className="mb-6 bg-white/[0.03] border border-violet-500/20 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">Nuevo canal</h2>
            <form onSubmit={createCanal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Nombre *</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Mi canal" required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Nicho / Temática</label>
                <input type="text" value={form.nicho} onChange={(e) => setForm({ ...form, nicho: e.target.value })}
                  placeholder="true crime, recetas, tecnología..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Tono</label>
                <input type="text" value={form.tono} onChange={(e) => setForm({ ...form, tono: e.target.value })}
                  placeholder="Oscuro y serio, amigable, divulgativo..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">System prompt del guión</label>
                <textarea value={form.system_prompt_guion} onChange={(e) => setForm({ ...form, system_prompt_guion: e.target.value })}
                  placeholder="Instrucciones para Claude al generar guiones (dejar vacío para usar el prompt por defecto)"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 text-sm resize-none" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={creating}
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
                  {creating ? 'Creando...' : 'Crear canal'}
                </button>
                <button type="button" onClick={() => setShowNuevo(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 rounded-xl text-sm transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de canales */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {canales.map((canal) => (
              <div key={canal._id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getEmoji(canal.nombre)}</span>
                    <div>
                      <h3 className="font-semibold text-white">{canal.nombre}</h3>
                      {canal.nicho && <p className="text-xs text-gray-500 mt-0.5">{canal.nicho}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      canal.youtube_conectado
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-gray-600 bg-white/5 border-white/8'
                    }`}>
                      {canal.youtube_conectado ? 'YouTube ✓' : 'Sin YouTube'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => enterCanal(canal._id)}
                    className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors">
                    Entrar
                  </button>
                  <a href={`/studio/canales/${canal._id}/editar`}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-sm rounded-xl transition-colors">
                    Editar
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
```

- [ ] **Step 2: Añadir "Canales" al nav de StudioLayout**

En `src/components/studio/StudioLayout.tsx`, añadir al array `NAV_ITEMS`:

```typescript
{
  href: '/studio/canales',
  label: 'Canales',
  exact: false,
  icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  ),
},
```

Añadirlo justo antes de `Configuración` en el array.

- [ ] **Step 3: Commit**

```bash
git add src/app/studio/canales/page.tsx src/components/studio/StudioLayout.tsx
git commit -m "feat(studio): canal management page at /studio/canales"
```

---

## Task 14: Sección Canal en /studio/configuracion

Añadir una sección editable del canal activo en la página de configuración existente.

**Files:**
- Modify: `src/app/studio/configuracion/page.tsx`

- [ ] **Step 1: Añadir estado para configuración del canal**

Añadir en `ConfigContent` después de los estados existentes:

```typescript
// Canal config
interface CanalConfigData {
  _id: string;
  nombre: string;
  nicho: string;
  system_prompt_guion: string;
  tono: string;
}
const [canalConfig, setCanalConfig] = useState<CanalConfigData | null>(null);
const [savingCanal, setSavingCanal] = useState(false);
const [canalSaved, setCanalSaved] = useState(false);
```

En el `useEffect`, añadir:

```typescript
fetch('/api/studio/canal/current')
  .then((r) => r.json())
  .then((d: { canal?: { _id: string; nombre: string; nicho: string } }) => {
    if (d.canal) {
      // Cargar config completa del canal
      return fetch(`/api/studio/canales/${d.canal._id}`);
    }
  })
  .then((r) => r?.json())
  .then((d: { canal?: CanalConfigData & { config?: { system_prompt_guion?: string; tono?: string } } }) => {
    if (d?.canal) {
      setCanalConfig({
        _id: d.canal._id,
        nombre: d.canal.nombre,
        nicho: d.canal.nicho ?? '',
        system_prompt_guion: d.canal.config?.system_prompt_guion ?? '',
        tono: d.canal.config?.tono ?? '',
      });
    }
  })
  .catch(() => null);
```

Añadir función `saveCanalConfig`:

```typescript
async function saveCanalConfig() {
  if (!canalConfig) return;
  setSavingCanal(true);
  try {
    await fetch(`/api/studio/canales/${canalConfig._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: canalConfig.nombre,
        nicho: canalConfig.nicho,
        system_prompt_guion: canalConfig.system_prompt_guion,
        tono: canalConfig.tono,
      }),
    });
    setCanalSaved(true);
    setTimeout(() => setCanalSaved(false), 2500);
  } finally {
    setSavingCanal(false);
  }
}
```

- [ ] **Step 2: Añadir sección visual en el JSX**

Insertar justo antes del cierre `</div>` final del componente:

```tsx
{/* Configuración del canal */}
{canalConfig && (
  <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
        <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">Canal activo</h2>
        <p className="text-xs text-gray-500">Configuración de {canalConfig.nombre}</p>
      </div>
      {savingCanal && <span className="ml-auto text-xs text-gray-600 animate-pulse">Guardando...</span>}
      {canalSaved && <span className="ml-auto text-xs text-emerald-400">Guardado ✓</span>}
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Nombre</label>
        <input
          type="text"
          value={canalConfig.nombre}
          onChange={(e) => setCanalConfig({ ...canalConfig, nombre: e.target.value })}
          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Nicho</label>
        <input
          type="text"
          value={canalConfig.nicho}
          onChange={(e) => setCanalConfig({ ...canalConfig, nicho: e.target.value })}
          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>
    </div>

    <div>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Tono</label>
      <input
        type="text"
        value={canalConfig.tono}
        onChange={(e) => setCanalConfig({ ...canalConfig, tono: e.target.value })}
        placeholder="Oscuro y serio, amigable, divulgativo..."
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
        System prompt para guiones
      </label>
      <textarea
        value={canalConfig.system_prompt_guion}
        onChange={(e) => setCanalConfig({ ...canalConfig, system_prompt_guion: e.target.value })}
        rows={6}
        placeholder="Instrucciones para Claude al generar guiones. Dejar vacío para usar el prompt por defecto de true crime."
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
      />
    </div>

    <div className="flex items-center justify-between">
      <button
        onClick={saveCanalConfig}
        disabled={savingCanal}
        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Guardar configuración del canal
      </button>
      <a href="/studio/canales" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
        Gestionar canales →
      </a>
    </div>
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/studio/configuracion/page.tsx
git commit -m "feat(studio): canal config section in /studio/configuracion"
```

---

## Task 15: Deploy y verificación final

- [ ] **Step 1: Ejecutar TypeScript check completo**

```bash
cd /home/ubuntu/luisgranero-com
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -30
```

Corregir cualquier error nuevo introducido en estas tareas. Los errores preexistentes en `User.test.ts` son aceptables.

- [ ] **Step 2: Build de producción**

```bash
cd /home/ubuntu/luisgranero-com
npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Ejecutar script de migración en producción**

```
IMPORTANTE: Ejecutar ANTES de reiniciar PM2.
```

```bash
cd /home/ubuntu/luisgranero-com
npx ts-node --project tsconfig.json scripts/migrate-studio-multicanal.ts
```

Verificar output: workspace creado, 2 canales creados, documentos actualizados.

- [ ] **Step 4: Reiniciar PM2**

```bash
pm2 restart luisgranero-com
pm2 logs luisgranero-com --lines 20
```

- [ ] **Step 5: Verificar que el Studio sigue funcionando**

Flujo de verificación:
1. Ir a `/studio/login` — formulario igual que antes
2. Introducir la contraseña de STUDIO_PASSWORD — debe redirigir al selector de canal
3. Seleccionar "Almas Corruptas" — debe entrar al Studio normal
4. Verificar que el historial de guiones sigue visible
5. Verificar que el calendario sigue funcionando
6. Verificar que los carteles siguen accesibles
7. Cambiar al canal "Sabores Saludables" desde el sidebar — Studio vacío (esperado)
8. Volver a "Almas Corruptas" — datos vuelven a aparecer

- [ ] **Step 6: Commit final si hay ajustes**

```bash
git add -p  # revisar cambios
git commit -m "fix(studio): post-deploy adjustments"
```

---

## Notas de retrocompatibilidad

1. **Login existente**: El formulario de login no cambia visualmente. La contraseña es la misma (STUDIO_PASSWORD). El cambio es transparente para el usuario.

2. **Datos existentes**: Todos los guiones, calendario, carteles del canal "Almas Corruptas" siguen visibles tras la migración. La migración asigna `canal_id` a todos los documentos existentes.

3. **YouTube**: Los tokens existentes en `studio_config` se migran al canal "Almas Corruptas". La reconexión no es necesaria.

4. **Fallback pre-migración**: Si el script de migración falla o no se ejecuta, el código de auth tiene un fallback que compara con `STUDIO_PASSWORD` directamente. El Studio seguirá siendo accesible.

5. **Música compartida**: `studio_music_tracks` no tiene `canal_id`. Las rutas `/api/studio/music/` no se modifican. La música es accesible desde cualquier canal.
```
