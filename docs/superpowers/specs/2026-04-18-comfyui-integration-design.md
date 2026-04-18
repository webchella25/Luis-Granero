# ComfyUI Cloud API Integration — Design Spec
**Fecha:** 2026-04-18  
**Proyecto:** luisgranero-com studio  
**Estado:** Aprobado

---

## Objetivo

Integrar ComfyUI Cloud API como motor adicional de generación de imágenes, vídeo y edición en el studio, configurable por canal, sin romper los motores existentes (HuggingFace, Freepik).

---

## Arquitectura

### Nuevos ficheros

```
src/lib/studio/comfyui-client.ts
src/lib/studio/comfyui-workflows/
  thumbnail.json
  cartel.json
  fondo.json
  video.json
  edit-image.json
  dj-photo.json
src/app/api/studio/comfyui/generate/route.ts
src/app/api/studio/comfyui/status/route.ts
```

### Ficheros modificados

| Fichero | Cambio |
|---------|--------|
| `src/models/StudioCanal.ts` | Añadir `config.comfyui_api_key` y `config.comfyui_workflow_overrides` |
| `src/app/api/studio/generate-images/route.ts` | Delegar a comfyui-client si `imagen_motor === 'comfyui'` |
| `src/app/api/studio/generate-thumbnail/route.ts` | Idem |
| `src/app/api/studio/carteles/generate-fondo/route.ts` | Idem |
| `src/app/studio/configuracion/page.tsx` | Nueva sección ComfyUI (API key + workflow overrides) |
| `src/app/studio/canales/page.tsx` | Añadir opción "comfyui" al selector de imagen_motor |

### Flujo de ejecución

```
Ruta existente
  → detecta imagen_motor === 'comfyui'
  → llama comfyui-client.ts(tipo, parámetros, canalConfig)
    → carga workflow (override de canal > default)
    → sustituye placeholders {{prompt}}, {{seed}}, {{width}}, {{height}}, {{steps}}, {{cfg}}
    → POST cloud.comfy.org/api/prompt  (X-API-Key del canal)
    → polling cada 2s hasta completed | timeout 120s
    → GET cloud.comfy.org/api/view?filename=...
    → devuelve buffer de imagen
```

---

## Modelo de datos

Extensión del tipo `StudioCanal.config`:

```typescript
config: {
  // existentes
  imagen_motor?: 'huggingface' | 'freepik' | 'auto' | 'comfyui'
  voz_motor?: string
  // nuevos
  comfyui_api_key?: string
  comfyui_workflow_overrides?: {
    thumbnail?: string    // JSON serializado del workflow
    cartel?: string
    fondo?: string
    video?: string
    edit_image?: string
    dj_photo?: string
  }
}
```

No requiere migración de BD — los campos son opcionales.

### Placeholders estándar

Todos los workflows (default y custom) deben contener estos nodos con estos valores:

| Placeholder | Descripción | Default |
|-------------|-------------|---------|
| `{{prompt}}` | Prompt de imagen generado por LLM | requerido |
| `{{seed}}` | Seed aleatoria | `Math.random() * 999999999` |
| `{{width}}` | Ancho en px | según tipo (1280 thumbnail, 1080 cartel...) |
| `{{height}}` | Alto en px | según tipo |
| `{{steps}}` | Pasos de diffusion | 20 |
| `{{cfg}}` | CFG scale | 7 |

---

## API Routes

### `POST /api/studio/comfyui/generate`

Endpoint unificado para todos los tipos de generación.

**Request body:**
```json
{
  "tipo": "thumbnail" | "cartel" | "fondo" | "video" | "edit_image" | "dj_photo",
  "prompt": "string",
  "width": 1280,
  "height": 720,
  "seed": 12345,
  "steps": 20,
  "cfg": 7
}
```

**Response (imagen sincrónica):**
```json
{ "url": "/api/studio/image/..." }
```

**Response (vídeo asíncrono):**
```json
{ "jobId": "prompt_id_de_comfyui", "status": "pending" }
```

### `GET /api/studio/comfyui/status?jobId=xxx`

Polling de estado para jobs asíncronos (vídeo).

**Response:**
```json
{
  "status": "pending" | "in_progress" | "completed" | "failed",
  "url": "/api/studio/video/..." // solo cuando completed
}
```

---

## UI

### `/studio/configuracion` — nueva sección "ComfyUI"

- Campo API Key (input tipo password + botón Guardar)
- Tabla de workflows por tipo: columna tipo, columna estado (default/custom), botón Subir JSON, botón eliminar override
- Validación al subir: el JSON debe contener todos los placeholders requeridos del tipo

### `/studio/canales`

- Selector `imagen_motor` añade opción "ComfyUI"
- La opción aparece deshabilitada con tooltip si el canal no tiene API key configurada

### Páginas con generación asíncrona (vídeo)

- Botón "Generar con ComfyUI" devuelve `jobId`
- Frontend hace polling a `/api/studio/comfyui/status` cada 3s
- Muestra spinner con estado textual ("En cola...", "Generando...", "Listo")

---

## Manejo de errores

| Escenario | Comportamiento |
|-----------|---------------|
| Timeout 120s | Fallback al motor anterior del canal; si no hay fallback, error al usuario |
| 401 API key inválida | Error claro: "API key inválida — revísala en Configuración" |
| 429 rate limit | Reintento con backoff exponencial (3 intentos: 1s, 2s, 4s) |
| Workflow JSON inválido | Validación al subir — error antes de guardar si faltan placeholders |
| Job fallido en ComfyUI | Mostrar mensaje de error, opción de reintentar |

---

## Casos de uso soportados

| Tipo | Uso en studio | Dimensiones default |
|------|--------------|-------------------|
| `thumbnail` | Miniaturas YouTube | 1280×720 |
| `cartel` | Carteles completos | 1080×1920 |
| `fondo` | Fondos para carteles | 1080×1920 |
| `video` | Clips cortos (Shorts) | 1080×1920 |
| `edit_image` | Inpainting / upscaling | según input |
| `dj_photo` | Mejora fotos de DJs | según input |

---

## Fuera de alcance (v1)

- Gestión de assets de entrada en ComfyUI Cloud (upload de imágenes fuente para inpainting)
- Interfaz visual de edición de nodos del workflow
- Múltiples outputs por ejecución
- Historial de jobs de ComfyUI en el studio
