# Generador de Carteles con IA — Diseño

**Fecha:** 2026-04-22  
**Scope:** Studio — nueva página de creación de carteles asistida por IA + limpieza del sidebar

---

## 1. Cambio en Sidebar

**Archivo:** `src/components/studio/StudioLayout.tsx`

Eliminar el bloque "APIs" del footer del sidebar izquierdo:
- Quitar el array `API_LABELS` y su renderizado
- Quitar el `useEffect` que llama a `/api/studio/api-status` y el estado `apiStatus`
- Quitar la interfaz `ApiStatus`
- Resultado: sidebar sin scroll, todas las opciones de nav visibles

No se elimina la ruta `/api/studio/api-status` (puede usarse en configuración).

---

## 2. Acceso desde la página de carteles

**Archivo:** `src/app/studio/carteles/page.tsx`

Añadir botón "✨ Generar con IA" en el header, junto al botón existente "Nuevo cartel".  
Navega a `/studio/carteles/nuevo-ia`.

---

## 3. Nueva página: `/studio/carteles/nuevo-ia`

**Archivo:** `src/app/studio/carteles/nuevo-ia/page.tsx`

Flujo de 3 pasos secuenciales en una sola página (sin router entre pasos).

### Paso 1 — Describir el evento

Campos:
- `nombre_evento` (text, requerido)
- `nombre_dj` (text, requerido)
- `fecha` (text, ej: "14 de junio de 2026")
- `descripcion_estilo` (textarea, libre: "techno oscuro, luces azules, Valencia, 22h")

Botón: **"Generar prompt con IA"** → llama a `/api/studio/generate-cartel-prompt`

### Paso 2 — Revisar prompt y elegir motor

Muestra el prompt generado en un `<textarea>` editable.

Selector de motor (radio buttons o tabs) — solo muestra los motores configurados para el canal activo:
- Freepik
- HuggingFace
- ComfyUI

Relación de aspecto fija: **4:5 vertical (1080×1350px)** — estándar poster/Instagram.

Botón: **"Generar cartel"** → llama a la API del motor seleccionado.

### Paso 3 — Resultado

Muestra la imagen generada.  
Acciones:
- **"Guardar en carteles"** → POST `/api/studio/carteles` con los datos del evento + path de imagen
- **"Regenerar"** → vuelve a llamar al motor con el mismo prompt
- **"Editar prompt"** → vuelve al paso 2

---

## 4. Nueva API: `POST /api/studio/generate-cartel-prompt`

**Archivo:** `src/app/api/studio/generate-cartel-prompt/route.ts`

**Input:**
```json
{
  "nombre_evento": "string",
  "nombre_dj": "string",
  "fecha": "string",
  "descripcion_estilo": "string"
}
```

**Proceso:** Llama a Claude (via `llm-client.ts`) con un system prompt que instruye a generar un prompt en inglés optimizado para Flux/Stable Diffusion. El prompt debe incluir: composición del poster, estilo visual, paleta de colores, ambiente, iluminación. No debe incluir texto literal ni tipografía (el modelo de imagen no renderiza texto bien).

**Output:**
```json
{
  "prompt": "string"
}
```

---

## 5. Generación de imagen

Reutiliza la lógica existente de `src/app/api/studio/generate-fondo/route.ts` adaptada para 4:5.

Para Freepik: ajustar parámetros a ratio vertical.  
Para HuggingFace: ajustar width/height.  
Para ComfyUI: usar workflow existente con parámetros de tamaño override.

La imagen se guarda en el sistema de archivos (mismo patrón que fondos) y se devuelve la URL.

---

## 6. Guardado del cartel

Reutiliza el modelo `Cartel` existente en MongoDB.  
Al guardar desde Paso 3, se hace POST a `/api/studio/carteles` con:
- `nombre_evento`, `dj_nombre`, `fecha`
- `cartel_path` (ruta de la imagen generada)
- `tipo: 'ia'` (campo nuevo para distinguir de carteles compuestos)

---

## Archivos a crear/modificar

| Acción | Archivo |
|--------|---------|
| Modificar | `src/components/studio/StudioLayout.tsx` |
| Modificar | `src/app/studio/carteles/page.tsx` |
| Crear | `src/app/studio/carteles/nuevo-ia/page.tsx` |
| Crear | `src/app/api/studio/generate-cartel-prompt/route.ts` |

La ruta de generación de imagen se llama directamente desde el cliente a la API existente de fondo/imágenes, no requiere nueva ruta backend salvo el adaptador de tamaño.
