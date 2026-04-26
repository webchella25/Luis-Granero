# Tipos de Guión por Canal + Configuración con Tabs — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir soporte de múltiples tipos de guión por canal (receta, top recetas, divulgativo mejorado) y reorganizar la página de configuración del studio en 3 pestañas para eliminar el scroll excesivo.

**Architecture:** El campo `tipos_guion` (JSON string) se almacena en `CanalConfig`. La ruta `generate-script` recibe el `tipo_guion` elegido y busca las secciones correspondientes en la config del canal. La página de configuración se reorganiza con un `activeTab` local sin cambiar ninguna lógica existente.

**Tech Stack:** Next.js App Router, TypeScript, MongoDB/Mongoose, React hooks

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/models/StudioCanal.ts` | Añadir `tipos_guion?: string` a CanalConfig interface + schema |
| `src/app/api/studio/canales/[id]/route.ts` | Aceptar `tipos_guion` en PATCH |
| `src/app/api/studio/canal/current/route.ts` | Exponer `tipos_guion` en la respuesta |
| `src/app/api/studio/generate-script/route.ts` | Recibir `tipo_guion`, nueva lógica de resolución de secciones |
| `src/app/studio/page.tsx` | Cargar tipos_guion del canal, añadir dropdown de tipo |
| `src/app/studio/configuracion/page.tsx` | Tabs (3 pestañas) + editor de tipos de guión |

---

## Task 1: Modelo — añadir tipos_guion a StudioCanal

**Files:**
- Modify: `src/models/StudioCanal.ts`

- [ ] **Step 1: Añadir tipos_guion a CanalConfig interface**

En `src/models/StudioCanal.ts`, en la interface `CanalConfig` (alrededor de la línea donde está `secciones_personalizadas?: string`), añadir después de esa línea:

```typescript
  tipos_guion?: string;
```

- [ ] **Step 2: Añadir tipos_guion al schema Mongoose**

En el bloque `config: { ... }` del `StudioCanalSchema`, después de la línea `secciones_personalizadas: { type: String, default: '' },`:

```typescript
    tipos_guion: { type: String, default: '' },
```

- [ ] **Step 3: Verificar que compila sin errores**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | head -20
```

Esperado: 0 errores relacionados con StudioCanal.

- [ ] **Step 4: Commit**

```bash
git add src/models/StudioCanal.ts
git commit -m "feat(studio): add tipos_guion field to CanalConfig"
```

---

## Task 2: PATCH canales/[id] — aceptar tipos_guion

**Files:**
- Modify: `src/app/api/studio/canales/[id]/route.ts`

- [ ] **Step 1: Añadir tipos_guion al handler PATCH**

En `src/app/api/studio/canales/[id]/route.ts`, buscar la línea:

```typescript
  if (body.secciones_personalizadas !== undefined) update['config.secciones_personalizadas'] = body.secciones_personalizadas;
```

Añadir inmediatamente después:

```typescript
  if (body.tipos_guion !== undefined) update['config.tipos_guion'] = body.tipos_guion;
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/studio/canales/\[id\]/route.ts
git commit -m "feat(studio): accept tipos_guion in canal PATCH handler"
```

---

## Task 3: canal/current — exponer tipos_guion

**Files:**
- Modify: `src/app/api/studio/canal/current/route.ts`

- [ ] **Step 1: Incluir config en la consulta**

En `src/app/api/studio/canal/current/route.ts`, la consulta actual es:

```typescript
  const canal = await StudioCanal.findById(session.canal_id)
    .select('_id nombre nicho pipeline_tipo')
    .lean();
```

Cambiar a:

```typescript
  const canal = await StudioCanal.findById(session.canal_id)
    .select('_id nombre nicho pipeline_tipo config.tipos_guion')
    .lean();
```

- [ ] **Step 2: Añadir tipos_guion a la respuesta**

La respuesta actual devuelve el objeto `canal` con 4 campos. Cambiar:

```typescript
  return NextResponse.json({
    canal: {
      _id: canal._id.toString(),
      nombre: canal.nombre,
      nicho: canal.nicho,
      pipeline_tipo: (canal as { pipeline_tipo?: string }).pipeline_tipo ?? 'narrativo',
    },
  });
```

Por:

```typescript
  const canalTyped = canal as { pipeline_tipo?: string; config?: { tipos_guion?: string } };
  return NextResponse.json({
    canal: {
      _id: canal._id.toString(),
      nombre: canal.nombre,
      nicho: canal.nicho,
      pipeline_tipo: canalTyped.pipeline_tipo ?? 'narrativo',
      tipos_guion: canalTyped.config?.tipos_guion ?? '',
    },
  });
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/studio/canal/current/route.ts
git commit -m "feat(studio): expose tipos_guion in canal/current response"
```

---

## Task 4: generate-script — resolver secciones por tipo_guion

**Files:**
- Modify: `src/app/api/studio/generate-script/route.ts`

- [ ] **Step 1: Añadir tipo_guion al tipo de request body**

En `route.ts`, buscar la definición del tipo del body de la request (donde están `personaje`, `epoca`, `tono`, `duracion`). Añadir el campo opcional:

```typescript
  tipo_guion?: string;
```

- [ ] **Step 2: Actualizar el tipo de canalConfig para incluir tipos_guion**

Buscar la línea donde se declara el tipo de `canalData`:

```typescript
const canalData = canal as { config?: LLMConfig & { system_prompt_guion?: string; secciones_personalizadas?: string }; nicho?: string; descripcion?: string } | null;
```

Añadir `tipos_guion?: string` a la intersección de config:

```typescript
const canalData = canal as { config?: LLMConfig & { system_prompt_guion?: string; secciones_personalizadas?: string; tipos_guion?: string }; nicho?: string; descripcion?: string } | null;
```

- [ ] **Step 3: Añadir resolución por tipo_guion antes del fallback actual**

Buscar este bloque en el route:

```typescript
    let seccionesActivas = SECCIONES;
    const seccionesRaw = canalConfig.secciones_personalizadas?.trim();
    if (seccionesRaw) {
      try {
        const parsed = JSON.parse(seccionesRaw) as SeccionDef[];
        if (Array.isArray(parsed) && parsed.length >= 2 && parsed[0]?.titulo && parsed[0]?.instruccion) {
          seccionesActivas = parsed;
        }
      } catch {
        // JSON inválido → usar secciones por defecto
      }
    }
```

Reemplazar por:

```typescript
    let seccionesActivas = SECCIONES;

    // Prioridad 1: tipo_guion del request → buscar en tipos_guion del canal
    const tiposGuionRaw = canalConfig.tipos_guion?.trim();
    if (validBody.tipo_guion && tiposGuionRaw) {
      try {
        const tipos = JSON.parse(tiposGuionRaw) as Array<{ id: string; nombre: string; secciones: SeccionDef[] }>;
        const tipoMatch = tipos.find((t) => t.id === validBody.tipo_guion);
        if (tipoMatch?.secciones && Array.isArray(tipoMatch.secciones) && tipoMatch.secciones.length >= 2) {
          seccionesActivas = tipoMatch.secciones;
        }
      } catch {
        // JSON inválido → continuar al siguiente fallback
      }
    }

    // Prioridad 2: secciones_personalizadas (backward compat)
    if (seccionesActivas === SECCIONES) {
      const seccionesRaw = canalConfig.secciones_personalizadas?.trim();
      if (seccionesRaw) {
        try {
          const parsed = JSON.parse(seccionesRaw) as SeccionDef[];
          if (Array.isArray(parsed) && parsed.length >= 2 && parsed[0]?.titulo && parsed[0]?.instruccion) {
            seccionesActivas = parsed;
          }
        } catch {
          // JSON inválido → usar SECCIONES por defecto
        }
      }
    }
```

- [ ] **Step 4: Verificar tipos**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | head -20
```

Esperado: 0 errores en generate-script/route.ts.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/studio/generate-script/route.ts
git commit -m "feat(studio): resolve script sections by tipo_guion with fallback chain"
```

---

## Task 5: studio/page.tsx — dropdown de tipo de guión

**Files:**
- Modify: `src/app/studio/page.tsx`

- [ ] **Step 1: Definir tipo TipoGuion y actualizar FormData**

Al inicio del archivo, añadir la interfaz (junto a los demás tipos):

```typescript
interface TipoGuion {
  id: string;
  nombre: string;
  secciones: Array<{ id: string; titulo: string; instruccion: string }>;
}
```

En `FormData`, añadir el campo opcional:

```typescript
interface FormData {
  personaje: string;
  epoca: string;
  tono: Tono;
  duracion: Duracion;
  tipo_guion?: string;
}
```

- [ ] **Step 2: Añadir estado tiposGuion**

Dentro de `StudioPageInner`, junto a los demás `useState`, añadir:

```typescript
  const [tiposGuion, setTiposGuion] = useState<TipoGuion[]>([]);
```

- [ ] **Step 3: Cargar tipos_guion desde canal/current**

Modificar el `useEffect` existente que llama a `/api/studio/music` para añadir una segunda llamada en paralelo. El useEffect actual es:

```typescript
  useEffect(() => {
    fetch('/api/studio/music')
      .then((r) => r.json())
      .then((d: { counts?: Record<MusicCategory, number> }) => {
        if (d.counts) setMusicCounts(d.counts);
      })
      .catch(() => {});
  }, []);
```

Añadir un useEffect separado para cargar el canal:

```typescript
  useEffect(() => {
    fetch('/api/studio/canal/current')
      .then((r) => r.json())
      .then((d: { canal?: { tipos_guion?: string } }) => {
        const raw = d.canal?.tipos_guion?.trim();
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as TipoGuion[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTiposGuion(parsed);
              setForm((prev) => ({ ...prev, tipo_guion: parsed[0].id }));
            }
          } catch {
            // tipos_guion inválido, ignorar
          }
        }
      })
      .catch(() => {});
  }, []);
```

- [ ] **Step 4: Añadir el dropdown en el formulario**

En el JSX del formulario, encontrar el campo de `tono` (el `<select>` o `<input>` con `value={form.tono}`). Añadir antes de ese campo el dropdown de tipo, condicionado a que haya tipos configurados:

```tsx
{tiposGuion.length > 0 && (
  <div>
    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
      Tipo de guión
    </label>
    <select
      value={form.tipo_guion ?? ''}
      onChange={(e) => handleChange('tipo_guion', e.target.value)}
      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
    >
      {tiposGuion.map((t) => (
        <option key={t.id} value={t.id} className="bg-gray-900">
          {t.nombre}
        </option>
      ))}
    </select>
  </div>
)}
```

- [ ] **Step 5: Verificar tipos**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | head -20
```

Esperado: 0 errores en studio/page.tsx.

- [ ] **Step 6: Commit**

```bash
git add src/app/studio/page.tsx
git commit -m "feat(studio): add tipo_guion dropdown to script generation form"
```

---

## Task 6: configuracion/page.tsx — tabs (3 pestañas)

**Files:**
- Modify: `src/app/studio/configuracion/page.tsx`

Los rangos de líneas de las secciones actuales (aproximados, usar grep para confirmar):
- L461-531: YouTube OAuth
- L532-674: Motor de imágenes
- L675-774: Motor de IA (guiones)
- L775-841: ComfyUI Cloud
- L842-948: Motores de narración
- L949-1010: NVIDIA TTS
- L1011-1028: Cuotas de APIs
- L1029-1213: Canal activo
- L1214-1303: Notificaciones Telegram

- [ ] **Step 1: Añadir estado activeTab**

En `ConfigContent`, al inicio de la función junto a los otros `useState`, añadir:

```typescript
  const [activeTab, setActiveTab] = useState<'integraciones' | 'motores' | 'canal'>('integraciones');
```

- [ ] **Step 2: Añadir el tab bar al principio del JSX**

En `return (`, inmediatamente después de `<div className="max-w-2xl mx-auto px-6 py-10 space-y-8">` (L459), añadir el tab bar:

```tsx
      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/8 rounded-2xl">
        {(['integraciones', 'motores', 'canal'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'integraciones' ? 'Integraciones' : tab === 'motores' ? 'Motores IA' : 'Canal'}
          </button>
        ))}
      </div>
```

- [ ] **Step 3: Envolver secciones en tab Integraciones**

Las secciones YouTube OAuth (L461-531) y Cuotas de APIs (L1011-1028) deben quedar dentro de `{activeTab === 'integraciones' && (...)}`.

Envolver con:
```tsx
      {activeTab === 'integraciones' && (<>
        {/* YouTube OAuth — bloque existente */}
        {/* Cuotas de APIs — bloque existente, mover aquí */}
      </>)}
```

- [ ] **Step 4: Envolver secciones en tab Motores IA**

Las secciones Motor de imágenes (L532-674), Motor IA guiones (L675-774), ComfyUI Cloud (L775-841), Motores de narración (L842-948), NVIDIA TTS (L949-1010) quedan dentro de `{activeTab === 'motores' && (...)}`:

```tsx
      {activeTab === 'motores' && (<>
        {/* Motor de imágenes — bloque existente */}
        {/* Motor de IA guiones — bloque existente */}
        {/* ComfyUI Cloud — bloque existente */}
        {/* Motores de narración — bloque existente */}
        {/* NVIDIA TTS — bloque existente */}
      </>)}
```

- [ ] **Step 5: Envolver secciones en tab Canal**

Las secciones Canal activo (L1029-1213) y Telegram (L1214-1303) quedan dentro de `{activeTab === 'canal' && (...)}`:

```tsx
      {activeTab === 'canal' && (<>
        {/* Canal activo — bloque existente */}
        {/* Notificaciones Telegram — bloque existente */}
      </>)}
```

- [ ] **Step 6: Cambiar el wrapper exterior de space-y-8 a space-y-6**

El div exterior `<div className="max-w-2xl mx-auto px-6 py-10 space-y-8">` puede quedar como `space-y-6` para dar menos separación entre el tab bar y el contenido activo.

- [ ] **Step 7: Verificar compilación**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | head -30
```

Esperado: 0 errores.

- [ ] **Step 8: Commit**

```bash
git add src/app/studio/configuracion/page.tsx
git commit -m "feat(studio): reorganize config page into 3 tabs (Integraciones, Motores IA, Canal)"
```

---

## Task 7: configuracion/page.tsx — editor de tipos de guión

**Files:**
- Modify: `src/app/studio/configuracion/page.tsx`

Los 3 presets de fábrica a incluir como constante en el archivo:

```typescript
const TIPOS_GUION_PRESETS = [
  {
    id: 'divulgativo',
    nombre: 'Divulgativo mejorado',
    secciones: [
      { id: 'hook_impacto', titulo: 'Hook de impacto (0-30s)', instruccion: 'Gancho de 50-70 palabras. Arranca con el dato más sorprendente, la pregunta que más pica, o el beneficio más obvio del tema. Sin presentaciones. El espectador decide en 5 segundos si sigue.' },
      { id: 'beneficio_directo', titulo: 'Por qué te importa esto', instruccion: '100-150 palabras. Conecta el tema directamente con la vida del espectador. ¿Qué problema resuelve? ¿Qué puede mejorar en su día a día? Concreto, sin rodeos.' },
      { id: 'dato_ciencia', titulo: 'El dato / La ciencia detrás', instruccion: '200-300 palabras. Explica qué hay detrás del tema con datos, estudios o mecanismos reales. Usa cifras concretas. Nada de generalidades como "los expertos dicen".' },
      { id: 'como_aplicarlo', titulo: 'Cómo aplicarlo hoy', instruccion: '200-300 palabras. Pasos prácticos y específicos que el espectador puede usar ahora mismo. Ejemplos reales. Nada de "depende" o "consulta a un profesional".' },
      { id: 'error_comun', titulo: 'El error que comete todo el mundo', instruccion: '150-200 palabras. Identifica el error o mito más común relacionado con el tema. Explica por qué es un error y qué hacer en su lugar.' },
      { id: 'cta_accionable', titulo: 'Cierre + CTA accionable', instruccion: '80-120 palabras. Cierre con una idea que se lleven a casa. Pregunta retórica o dato final. CTA natural para suscribirse o guardar el vídeo.' },
    ],
  },
  {
    id: 'receta',
    nombre: 'Receta individual',
    secciones: [
      { id: 'hook_visual', titulo: 'Hook visual (0-15s)', instruccion: '40-60 palabras. Arranca describiendo el resultado final con lenguaje sensorial: color, textura, sabor. Incluye el tiempo de preparación o el beneficio principal. Ejemplo: "Este smoothie de 3 ingredientes tiene más proteína que un yogur y se hace en 2 minutos".' },
      { id: 'ingredientes', titulo: 'Ingredientes', instruccion: '80-120 palabras. Lista todos los ingredientes con cantidades exactas y posibles sustitutos para los más inaccesibles. Menciona brevemente por qué cada ingrediente clave está ahí (nutricionalmente o por sabor).' },
      { id: 'preparacion', titulo: 'Preparación paso a paso', instruccion: '200-300 palabras. Pasos numerados, claros y ordenados. Tiempo de cada paso. Temperatura si aplica. Describe texturas y señales visuales ("hasta que quede dorado", "cuando espese"). Sin tecnicismos.' },
      { id: 'truco_secreto', titulo: 'Truco o variante', instruccion: '100-150 palabras. Un truco de chef o variante que mejore la receta o la adapte a distintos gustos: versión vegana, sin gluten, más económica, o más rápida.' },
      { id: 'resultado_cta', titulo: 'Resultado + CTA', instruccion: '60-80 palabras. Describe el resultado final con entusiasmo: sabor, textura, beneficios. Invita al espectador a probarla y a comentar su resultado. CTA para guardar o compartir el vídeo.' },
    ],
  },
  {
    id: 'top_recetas',
    nombre: 'Top recetas',
    secciones: [
      { id: 'hook_promesa', titulo: 'Hook + promesa del top', instruccion: '50-70 palabras. Arranca con la promesa del top. Ejemplo: "5 recetas que te cambiarán los desayunos para siempre". Menciona el criterio del ranking para crear expectativa.' },
      { id: 'por_que_este_top', titulo: 'Por qué este top', instruccion: '100-150 palabras. Explica el criterio de selección: facilidad, sabor, beneficio nutricional. Crea expectativa sobre las posiciones.' },
      { id: 'recetas_lista', titulo: 'Las recetas del top (1 a N)', instruccion: 'Para cada receta: nombre, ingredientes clave, tiempo de preparación, y 1-2 frases sobre por qué está en el top. Cada receta ocupa 60-100 palabras. Ordena de menor a mayor impacto para mantener la atención.' },
      { id: 'la_favorita', titulo: 'La favorita / ganadora', instruccion: '150-200 palabras. La receta número 1 merece más detalle: ingredientes principales, preparación en 3-4 pasos, y por qué es la mejor. Crea el momento de reveal con algo de drama.' },
      { id: 'cta_top', titulo: 'Cierre + CTA', instruccion: '60-80 palabras. Invita al espectador a probar su favorita y a compartir en comentarios cuál es la suya. CTA para guardar el vídeo o suscribirse.' },
    ],
  },
];
```

- [ ] **Step 1: Añadir la constante TIPOS_GUION_PRESETS**

Añadir la constante `TIPOS_GUION_PRESETS` (con el contenido de arriba) al inicio del archivo, después de los imports y antes de la función `ConfigContent`.

- [ ] **Step 2: Añadir estado tiposGuion**

Dentro de `ConfigContent`, añadir junto a los otros estados:

```typescript
  const [tiposGuion, setTiposGuion] = useState<typeof TIPOS_GUION_PRESETS>([]);
```

- [ ] **Step 3: Cargar tiposGuion al inicializar canalConfig**

Buscar el bloque donde se carga `canalConfig` (el fetch a `canales/[id]` o el bloque de inicialización de estado). En el mismo lugar donde se lee `secciones_personalizadas`, añadir la carga de `tipos_guion`:

```typescript
const tiposGuionRaw = (d.canal as unknown as { config?: { tipos_guion?: string } }).config?.tipos_guion?.trim();
if (tiposGuionRaw) {
  try {
    const parsed = JSON.parse(tiposGuionRaw);
    if (Array.isArray(parsed)) setTiposGuion(parsed);
  } catch {
    setTiposGuion([]);
  }
}
```

- [ ] **Step 4: Incluir tiposGuion en saveCanalConfig**

En la función `saveCanalConfig`, añadir `tipos_guion` al body del PATCH:

```typescript
tipos_guion: JSON.stringify(tiposGuion),
```

- [ ] **Step 5: Añadir el editor en el tab Canal**

Dentro del bloque `{activeTab === 'canal' && ...}`, en la sección Canal activo, después del bloque de `secciones_personalizadas` y antes del botón "Guardar configuración del canal", añadir el editor de tipos de guión:

```tsx
{canalConfig.pipeline_tipo !== 'musica_ambiental' && (
  <div>
    <div className="flex items-center justify-between mb-3">
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
        Tipos de guión
      </label>
      {tiposGuion.length === 0 && (
        <button
          type="button"
          onClick={() => setTiposGuion(TIPOS_GUION_PRESETS)}
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          + Cargar presets por defecto
        </button>
      )}
    </div>

    {tiposGuion.length === 0 ? (
      <p className="text-gray-600 text-xs">Sin tipos configurados. Pulsa "Cargar presets" para añadir Divulgativo, Receta y Top recetas.</p>
    ) : (
      <div className="space-y-2">
        {tiposGuion.map((tipo, idx) => (
          <div key={tipo.id} className="flex items-center justify-between px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl">
            <div>
              <span className="text-sm text-white font-medium">{tipo.nombre}</span>
              <span className="ml-2 text-xs text-gray-500">{tipo.secciones.length} secciones</span>
            </div>
            <button
              type="button"
              onClick={() => setTiposGuion(tiposGuion.filter((_, i) => i !== idx))}
              className="text-xs text-red-400 hover:text-red-300 transition-colors ml-4"
            >
              Eliminar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setTiposGuion(TIPOS_GUION_PRESETS)}
          className="text-xs text-gray-500 hover:text-gray-400 transition-colors mt-1"
        >
          Restaurar presets por defecto
        </button>
      </div>
    )}
    <p className="text-gray-600 text-xs mt-2">Se guardan al pulsar "Guardar configuración del canal".</p>
  </div>
)}
```

- [ ] **Step 6: Verificar compilación**

```bash
cd /home/ubuntu/luisgranero-com && npx tsc --noEmit 2>&1 | head -30
```

Esperado: 0 errores.

- [ ] **Step 7: Commit**

```bash
git add src/app/studio/configuracion/page.tsx
git commit -m "feat(studio): add tipos_guion editor with 3 default presets to Canal tab"
```

---

## Task 8: Build y verificación

- [ ] **Step 1: Build de producción**

```bash
cd /home/ubuntu/luisgranero-com && npm run build 2>&1 | tail -30
```

Esperado: build exitoso, sin errores de tipo ni de compilación.

- [ ] **Step 2: Reiniciar PM2**

```bash
pm2 restart luisgranero-com
```

- [ ] **Step 3: Verificar en el studio**

1. Ir a `/studio/configuracion` → comprobar que aparecen 3 tabs (Integraciones, Motores IA, Canal)
2. En tab Canal → sección "Tipos de guión" → pulsar "Cargar presets por defecto" → deben aparecer los 3 tipos
3. Pulsar "Guardar configuración del canal"
4. Ir a `/studio` (formulario de generación) → debe aparecer el dropdown "Tipo de guión" con los 3 tipos
5. Seleccionar "Receta individual" y generar un guión → verificar que el guión tiene 5 secciones con estructura de receta

- [ ] **Step 4: Commit final si todo OK**

```bash
git add -p && git commit -m "feat(studio): tipos_guion per canal + config tabs complete"
```
