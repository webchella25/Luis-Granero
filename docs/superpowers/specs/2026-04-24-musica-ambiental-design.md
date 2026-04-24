# Diseño: Pipeline de Música Ambiental para Studio

**Fecha:** 2026-04-24  
**Alcance:** Soporte para múltiples tipos de pipeline en el sistema de canales del Studio. Primer nuevo tipo: "Música ambiental" para canales Lo-fi y música en bucle.

---

## 1. Contexto

El Studio actual tiene un único pipeline narrativo: guión → audio TTS → imágenes → vídeo montado. Todos los canales usan este pipeline.

Se añade soporte para un segundo tipo de pipeline — música ambiental — que no requiere guión ni voz, sino imagen estática animada + música en bucle. El tipo de pipeline se decide al crear el canal y no es editable posteriormente.

---

## 2. Modelo de datos

### 2.1 StudioCanal — campo nuevo

Se añade `pipeline_tipo` como campo de primer nivel del documento (no dentro de `config`):

```ts
pipeline_tipo: { type: String, enum: ['narrativo', 'musica_ambiental'], default: 'narrativo' }
```

- Los canales existentes obtienen `'narrativo'` por defecto automáticamente — sin migración.
- Se incluye en el SELECT del GET list (el sidebar lo necesita).
- Se añade al allowlist del PATCH route.
- No es editable desde la configuración del canal — es una decisión de creación.

### 2.2 Nueva colección: `studio_musica_ambiental`

Modelo Mongoose en `src/models/StudioMusicaAmbiental.ts`:

```ts
{
  _id: ObjectId,
  canal_id: string,           // referencia al canal
  workspace_id: string,       // scoping, igual que el resto del sistema
  mood: string,               // clave: 'LLUVIA_CIUDAD' | 'CAFE_ACOGEDOR' | etc.
  prompt_flux: string,        // prompt usado (mood default o personalizado)
  imagen_path: string,        // ruta del archivo de imagen generada
  musica_path: string,        // ruta del archivo de música
  musica_nombre: string,      // nombre original del archivo
  duracion_horas: number,     // 0.5 | 1 | 2 | 3
  efectos: string[],          // ['lluvia', 'parpadeo_luces', ...]
  titulo: string,
  descripcion: string,
  texto_overlay: {
    activo: boolean,
    linea1: string,
    linea2: string,
    color: string,
    posicion: 'top' | 'center' | 'bottom'
  } | null,
  video_path: string | null,
  youtube_id: string | null,
  youtube_url: string | null,
  estado: 'pendiente' | 'generando_imagen' | 'generando_video' | 'listo' | 'error',
  error_msg: string | null,
  scheduled_at: Date | null,
  creado_en: Date
}
```

---

## 3. Navegación dinámica (StudioLayout)

`StudioLayout` ya hace fetch de `canal/current`. Se amplía `CanalInfo` con `pipeline_tipo`:

```ts
interface CanalInfo { _id: string; nombre: string; nicho: string; pipeline_tipo?: string }
```

Se reemplaza el array `NAV_ITEMS` estático por un objeto de configuración:

```ts
const NAV_POR_PIPELINE: Record<string, NavItem[]> = {
  narrativo: [
    { href: '/studio',               label: 'Nuevo vídeo',       exact: true  },
    { href: '/studio/historial',     label: 'Historial',         exact: false },
    { href: '/studio/calendario',    label: 'Calendario',        exact: false },
    { href: '/studio/carteles',      label: 'Carteles',          exact: false },
    { href: '/studio/canales',       label: 'Canales',           exact: false },
    { href: '/studio/configuracion', label: 'Configuración',     exact: false },
  ],
  musica_ambiental: [
    { href: '/studio/musica-ambiental/nuevo', label: 'Nuevo vídeo musical', exact: true  },
    { href: '/studio/historial',              label: 'Historial',           exact: false },
    { href: '/studio/calendario',             label: 'Calendario',          exact: false },
    { href: '/studio/canales',                label: 'Canales',             exact: false },
    { href: '/studio/configuracion',          label: 'Configuración',       exact: false },
  ],
}
```

Render: `NAV_POR_PIPELINE[canalActivo?.pipeline_tipo ?? 'narrativo'] ?? NAV_POR_PIPELINE.narrativo`.

Mientras `canalActivo` es `null` (cargando), se muestra el nav narrativo — igual que ahora.

---

## 4. Formulario de creación de canal (dos pasos)

El formulario actual de `canales/page.tsx` se convierte en dos pasos con navegación entre ellos.

**Paso 1** (sin cambios): nombre, nicho, tono, system_prompt_guion, idioma.

**Paso 2** (nuevo): selector visual de pipeline:

```
┌────────────────────────────────────────────────┐
│ [●]  📹 Narrativo                              │
│  Guión + voz en off + imágenes + vídeo montado │
│  True crime, recetas, educación, historia      │
├────────────────────────────────────────────────┤
│ [ ]  🎵 Música ambiental                       │
│  Imagen animada + música en bucle              │
│  Lo-fi, jazz, naturaleza, focus music          │
└────────────────────────────────────────────────┘
```

Tarjetas clickables con borde de acento en la seleccionada. Botones "Atrás" y "Crear canal". Por defecto seleccionado: narrativo.

El POST añade `pipeline_tipo` al body. El PATCH allowlist lo acepta.

---

## 5. Página `/studio/musica-ambiental/nuevo`

Diseño de dos paneles (igual que el editor de carteles).

### Panel izquierdo — controles

**Bloque 1 — Mood**

Select con 6 opciones:

| Clave | Label | Prompt FLUX | Efectos |
|---|---|---|---|
| `LLUVIA_CIUDAD` | 🌧 Lluvia en la ciudad | anime style girl studying at window, rain outside, city lights, cozy room, warm lamp light, lo-fi aesthetic, detailed, peaceful | `lluvia`, `parpadeo_luces` |
| `CAFE_ACOGEDOR` | ☕ Café acogedor | cozy coffee shop interior, warm lighting, rain on window, books, plants, lo-fi anime aesthetic, peaceful atmosphere | `vapor_cafe`, `lluvia_suave` |
| `BOSQUE_NOCHE` | 🌲 Bosque nocturno | magical forest at night, fireflies, moonlight through trees, lo-fi anime style, peaceful and mysterious | `particulas_luz`, `niebla` |
| `CIUDAD_NOCTURNA` | 🌃 Ciudad nocturna | cyberpunk city at night, neon lights, rain, anime aesthetic, rooftop view, lo-fi mood | `lluvia`, `neon_parpadeo` |
| `PLAYA_ATARDECER` | 🌅 Playa al atardecer | anime girl on beach at sunset, warm colors, gentle waves, lo-fi aesthetic, peaceful, dreamy | `olas_suaves`, `particulas_luz` |
| `HABITACION_ACOGEDORA` | 🏠 Habitación acogedora | cozy bedroom at night, fairy lights, plants, books, lo-fi anime aesthetic, warm and peaceful | `parpadeo_luces`, `particulas_luz` |

Debajo del select: textarea "Personalizar prompt" (colapsada por defecto, toggle para expandir). Si el usuario escribe aquí, sobreescribe el prompt del mood.

Botón **"Generar preview"** al final del bloque — llama a `/api/studio/musica-ambiental/preview` y muestra la imagen en el panel derecho.

**Bloque 2 — Música**

Dropzone para MP3/WAV/FLAC con reproductor HTML5 que muestra la duración al cargar.

Sección colapsable "O elegir de la biblioteca" — lista los tracks del canal via `GET /api/studio/music?canal_id=...`. Al seleccionar un track de la biblioteca se carga en el reproductor igual que un archivo subido.

**Bloque 3 — Duración**

4 botones: 30 min / 1 hora / 2 horas / 3 horas. "1 hora" por defecto.

**Bloque 4 — Título y descripción**

- Input título con sugerencia automática: `"[Mood] lo-fi hip hop 🎵 beats to study/relax to"`
- Textarea descripción con template basado en mood y duración seleccionados.

Ambos editables libremente.

**Bloque 5 — Texto en el vídeo**

Toggle off por defecto. Si activado:
- Input línea 1 (ej: "lo-fi hip hop")
- Input línea 2 (ej: "beats to study/relax to")
- Color picker para el texto
- Posición: 3 botones (arriba / centro / abajo)

### Panel derecho — preview (sticky)

- **Estado inicial:** placeholder con emoji del mood y texto "Genera un preview para ver la imagen".
- **Tras "Generar preview":** imagen FLUX 1920×1080 + badges de efectos activos debajo.
- La imagen generada persiste en el estado del formulario. Solo se regenera si el usuario cambia mood/prompt y vuelve a hacer clic en "Generar preview".

**Botón principal: "Generar vídeo"**

- Deshabilitado hasta que haya imagen generada Y música seleccionada.
- Al hacer clic lanza SSE con progreso por pasos:
  ```
  Guardando música       ████░░░░ 20%
  Loop de música         ████████ 40%
  Aplicando efectos      ████████████ 60%
  Montando vídeo         ████████████████ 80%
  Guardando resultado    ████████████████████ 100%
  ```

---

## 6. Rutas API

### `POST /api/studio/musica-ambiental/preview`

Genera imagen FLUX con el prompt del mood (o prompt personalizado). Resolución 1920×1080. Guarda el archivo vía sistema de ficheros del servidor (no `public/`). Devuelve `{ imagen_url, imagen_path }`.

Reutiliza el motor de imagen configurado para el canal (`canal.config.imagen_motor`).

### `POST /api/studio/musica-ambiental/generate`

Pipeline completo con SSE para progreso. 5 pasos:

1. **Guardar música** — si es archivo subido, escribirlo a disco en `tmpDir`. Si es track de biblioteca, copiar.
2. **Loop de música con FFmpeg:**
   ```
   ffmpeg -stream_loop -1 -i musica.mp3 \
     -t [duracion_segundos] \
     -af "afade=t=in:d=3,afade=t=out:st=[dur-3]:d=3" \
     musica_loop.mp3
   ```
3. **Efectos visuales** — función `buildEfectosFFmpeg(efectos, duracion)`:
   - Si existe `/studio/efectos/[nombre].mp4`: usar como overlay.
   - Si no: usar filtro FFmpeg básico equivalente.
   - Efecto `parpadeo_luces`: `-vf "eq=brightness='0.03*sin(t/3)'"` (siempre disponible).
   - El vídeo funciona sin efectos — imagen estática + música es resultado válido.
4. **Montaje final:**
   ```
   ffmpeg \
     -loop 1 -i imagen_base.jpg \
     -i musica_loop.mp3 \
     -vf "[efectos],[drawtext opcional]" \
     -c:v libx264 -tune stillimage \
     -c:a aac -b:a 192k \
     -pix_fmt yuv420p \
     -t [duracion_segundos] \
     output.mp4
   ```
   `-tune stillimage` es crítico para el tamaño del archivo (200-500 MB vs 50 GB sin él).
5. **Guardar en MongoDB** — crea documento `studio_musica_ambiental` con estado `'listo'`.

Archivos temporales en `tmpDir` con `crypto.randomUUID()`. Output final servido vía API route (patrón existente del sistema).

### `GET /api/studio/musica-ambiental`

Lista de vídeos musicales del canal activo, ordenados por `creado_en` desc. Scoping por `workspace_id`.

### `GET|PATCH /api/studio/musica-ambiental/[id]`

GET detalle. PATCH para actualizar `youtube_id`, `youtube_url`, `estado`, `scheduled_at`.

### Upload a YouTube

Usa `POST /api/studio/upload-youtube` existente con un parámetro obligatorio `tipo: 'musica_ambiental'` en el body. El endpoint lo usa para leer de `studio_musica_ambiental` en lugar de `studio_scripts`. Sin este parámetro el endpoint no puede saber de qué colección obtener título, descripción y ruta de vídeo.

### Serving de archivos generados

Los archivos de imagen preview y vídeo final se sirven vía dos rutas nuevas:
- `GET /api/studio/musica-ambiental/imagen/[filename]/route.ts` — sirve la imagen FLUX generada
- `GET /api/studio/musica-ambiental/video/[filename]/route.ts` — sirve el vídeo final con streaming (igual que `/api/studio/video/[filename]`)

---

## 7. Historial (`/studio/historial`)

Detección del tipo de canal activo:

```ts
if (canal.pipeline_tipo === 'narrativo') {
  // Lista de guiones — comportamiento actual sin cambios
}

if (canal.pipeline_tipo === 'musica_ambiental') {
  // GET /api/studio/musica-ambiental?canal_id=...
  // Columnas: mood, duración, estado, youtube_url
  // Botones por fila: ver imagen, descargar vídeo, subir a YouTube
}
```

---

## 8. Resumen de archivos

### Modificados

| Archivo | Cambio |
|---|---|
| `src/models/StudioCanal.ts` | Añadir `pipeline_tipo` al schema |
| `src/app/api/studio/canales/route.ts` | Incluir `pipeline_tipo` en SELECT del GET list |
| `src/app/api/studio/canales/[id]/route.ts` | Añadir `pipeline_tipo` al allowlist del PATCH |
| `src/components/studio/StudioLayout.tsx` | Nav dinámico por `pipeline_tipo` |
| `src/app/studio/canales/page.tsx` | Selector de pipeline en paso 2 del formulario |
| `src/app/studio/historial/page.tsx` | Vista condicional por tipo de pipeline |
| `src/app/api/studio/upload-youtube/route.ts` | Soporte opcional para `tipo: 'musica_ambiental'` |

### Nuevos

| Archivo | Propósito |
|---|---|
| `src/models/StudioMusicaAmbiental.ts` | Modelo Mongoose nueva colección |
| `src/app/studio/musica-ambiental/nuevo/page.tsx` | Formulario de creación |
| `src/app/api/studio/musica-ambiental/preview/route.ts` | Genera imagen FLUX |
| `src/app/api/studio/musica-ambiental/generate/route.ts` | Pipeline completo con SSE |
| `src/app/api/studio/musica-ambiental/route.ts` | GET lista |
| `src/app/api/studio/musica-ambiental/[id]/route.ts` | GET detalle, PATCH estado |
| `src/app/api/studio/musica-ambiental/imagen/[filename]/route.ts` | Serving de imagen preview |
| `src/app/api/studio/musica-ambiental/video/[filename]/route.ts` | Serving de vídeo final (streaming) |

---

## 9. Consideraciones

- **Tamaño de vídeo:** `-tune stillimage` es obligatorio. Sin él, 1 hora de vídeo puede pesar 50 GB. Con él, 200-500 MB.
- **Efectos incrementales:** el directorio `/studio/efectos/` es opcional. Si no existe ningún overlay MP4, los efectos simples (parpadeo de brillo) funcionan siempre via filtros FFmpeg básicos. Los efectos complejos (lluvia real, vapor) se añaden descargando vídeos gratuitos de Pexels y depositándolos en esa carpeta.
- **Streaming upload a YouTube:** ya implementado en el sistema actual. Los vídeos de 1-3 horas no se cargan en memoria.
- **Calendario y Telegram:** sin cambios. Filtran por `canal_id` — funcionan para cualquier tipo de pipeline.
- **`pipeline_tipo` inmutable tras creación:** evita estado inconsistente (historial narrativo en un canal que cambia a musical).
