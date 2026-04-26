# Tipos de Guión por Canal + Rediseño Configuración con Tabs

**Fecha:** 2026-04-26  
**Canal objetivo inicial:** Sabores Saludables (aplica a todos los canales narrativos)

---

## Problema

1. La página `/studio/configuracion` tiene 9 bloques apilados (~1317 líneas) que requieren scroll excesivo.
2. Sabores Saludables solo puede generar guiones con estructura narrativa (6 secciones fijas), cuando los contenidos con más visitas son recetas individuales y tops de recetas.

---

## Solución

### Parte 1 — Tabs en configuración

Reorganizar `configuracion/page.tsx` en 3 pestañas sin cambiar ninguna lógica existente:

| Pestaña | Secciones que incluye |
|---|---|
| **Integraciones** | YouTube OAuth, Cuotas de APIs |
| **Motores IA** | Motor de imágenes (HF/FreePik/ComfyUI), Motor LLM (Claude/OpenAI/OpenRouter/Gemini), Motores de narración TTS, NVIDIA TTS, ComfyUI Cloud |
| **Canal** | Canal activo (logo, imagen referencia, system prompt, secciones), Tipos de guión (nuevo), Notificaciones Telegram |

El tab activo se guarda en estado local (`useState`). Sin routing de URL — la página ya usa `useSearchParams` para `canalId`, no se toca.

---

### Parte 2 — Tipos de guión por canal

#### Modelo de datos

Nuevo campo en `StudioCanal.config`:
```ts
tipos_guion?: string // JSON serializado de TipoGuion[]
```

```ts
interface TipoGuion {
  id: string        // slug único, e.g. "receta"
  nombre: string    // label en UI, e.g. "Receta individual"
  secciones: SeccionDef[]  // mismo tipo que secciones_personalizadas
}

interface SeccionDef {
  id: string
  titulo: string
  instruccion: string
}
```

Se almacena como string JSON (mismo patrón que `secciones_personalizadas`).

#### Presets de fábrica

Cuando el usuario hace clic en "Añadir presets por defecto" en el tab Canal, se cargan estos 3 tipos:

**Divulgativo mejorado**
```
hook_impacto → beneficio_directo → dato_ciencia → como_aplicarlo → error_comun → cta_accionable
```

**Receta individual**
```
hook_visual → ingredientes → pasos → truco_secreto → resultado_cta
```

**Top recetas**
```
hook_promesa → por_que_este_top → recetas_lista → la_favorita → cta
```

Cada sección incluye `instruccion` detallada para el LLM (ej: "Describe los ingredientes con cantidades exactas, usa lenguaje coloquial, máximo 60 palabras").

#### UI en configuración (tab Canal)

- Lista de tipos configurados con nombre + botón eliminar
- Botón "Añadir tipo" abre un formulario inline: nombre + editor JSON de secciones (mismo patrón que `secciones_personalizadas` actual)
- Botón "Cargar presets por defecto" → pre-carga los 3 tipos de fábrica (solo visible si `tipos_guion` está vacío)
- Se guarda junto con el resto del canal config en `saveCanalConfig`

#### UI en generación de guión

En el formulario de generación (historial/page.tsx o el modal/form de generar):
- Si el canal tiene `tipos_guion` con ≥1 tipo: mostrar dropdown `Tipo de guión` antes de los campos existentes
- Default: primer tipo de la lista
- Si el canal no tiene `tipos_guion`: comportamiento actual (usa `secciones_personalizadas` o default SECCIONES)

#### Backend generate-script

`generate-script/route.ts` recibe nuevo campo opcional `tipo_guion: string`.

Lógica de resolución de secciones (orden de prioridad):
1. Si `tipo_guion` está en el body y el canal tiene `tipos_guion` → usar las secciones del tipo matching
2. Si no, si `canalConfig.secciones_personalizadas` es válido → usar esas (backward compat)
3. Si no → usar `SECCIONES` por defecto

#### Compatibilidad con generate-video / música

Las secciones del tipo elegido pueden tener diferente número (5 en receta, vs 6 default). El `SECTION_MUSIC_MAP` en generate-video usa `Math.min(guionSections.length, SECTION_MUSIC_MAP.length)` — secciones extra simplemente no tienen música asignada. No requiere cambio.

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/models/StudioCanal.ts` | Añadir `tipos_guion?: String` al schema de config |
| `src/app/studio/configuracion/page.tsx` | Tabs UI + editor tipos de guión en tab Canal |
| `src/app/api/studio/generate-script/route.ts` | Recibir `tipo_guion`, resolver secciones con nueva prioridad |
| `src/app/studio/historial/page.tsx` (o form generación) | Dropdown tipo_guion condicional |

---

## Fuera de scope

- Cambiar el número de entradas en `SECTION_MUSIC_MAP` (se gestiona con `Math.min` existente)
- Migrar `secciones_personalizadas` a `tipos_guion` automáticamente (backward compat, coexisten)
- Añadir tipos de guión a otros canales (se hace manualmente desde config de cada canal)
