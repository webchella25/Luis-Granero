# Plan: Editor de Carteles V2 — Visual en Tiempo Real

> Generado el 2026-04-12  
> Rama de trabajo: feature/editor-carteles-v2  
> Archivos clave existentes documentados abajo

---

## Contexto del código existente

| Artefacto | Path exacto |
|---|---|
| Página actual (reemplazar) | `src/app/studio/carteles/nuevo/page.tsx` |
| Puppeteer (actualizar) | `src/lib/studio/cartel-puppeteer.ts` |
| Generar fondo FLUX | `src/app/api/studio/carteles/generate/route.ts` |
| Recomponer | `src/app/api/studio/carteles/[id]/recompose/route.ts` |
| Listar/obtener cartel | `src/app/api/studio/carteles/route.ts` + `[id]/route.ts` |
| Modelo StudioCartel | `src/models/StudioCartel.ts` |
| Modelo StudioDj | `src/models/StudioDj.ts` |
| Modelo StudioAsset | `src/models/StudioAsset.ts` |
| DJs API | `src/app/api/studio/djs/route.ts` + `[id]/upload/route.ts` |
| DJs página | `src/app/studio/carteles/djs/page.tsx` |
| Fuentes Puppeteer | `/public/studio/fonts/BebasNeue-Regular.ttf` + `Montserrat-Bold.ttf` |
| Assets DJs | `/public/studio/assets/djs/{djId}/foto_{ts}.jpg` |
| Fondos generados | `/public/studio/carteles/{id}-fondo.jpg` |

### ComposeParams actuales en cartel-puppeteer.ts
```typescript
fondoBuffer, djNombre, nombreEvento, fecha, horaInicio, horaFin,
lugar, tematica, infoExtra, generos, usarFotoDj,
djFotoBuffer, logoLocalBuffer, logoDjBuffer, qrBuffer
```

### Colores actuales en Puppeteer
- Título: #FFFFFF, Acento: #FFE566, Secundario: #DDDDDD, Terciario: #AAAAAA
- Overlay top: black gradiente 0-500px (85%-0%)
- Overlay bottom: black gradiente 1240-1920px (0%-87%)
- Noise: SVG turbulence, opacity 6%

---

## Fase 1 — Capa de datos: modelo + fuentes nuevas

**Objetivo:** Ampliar StudioCartel con los campos del editor V2 y crear el modelo StudioFondo. Descargar las 4 fuentes nuevas para Puppeteer.

### 1.1 Actualizar `src/models/StudioCartel.ts`

Añadir estos campos al Schema (sin romper los existentes):

```typescript
// Nuevos campos V2
preset: { type: String, default: 'OSCURO_ELEGANTE' },
fuente: { type: String, default: 'Bebas Neue' },
color_acento: { type: String, default: '#FFD700' },
efecto_texto: { type: String, default: 'Normal' },
overlay_intensidad: { type: Number, default: 75 },
grano_intensidad: { type: Number, default: 10 },
layout: { type: String, default: 'CLASICO' },

// Textos con sus opciones
textos: {
  nombre_evento: { texto: String, visible: Boolean, color: String, size: Number },
  subtitulo:     { texto: String, visible: Boolean, color: String },
  nombre_dj:     { texto: String, visible: Boolean, color: String, size: Number },
  sesion:        { texto: String, visible: Boolean, color: String },
  dress_code:    { texto: String, visible: Boolean, color: String },
  info_extra:    { texto: String, visible: Boolean, color: String },
  dia_semana:    { texto: String, visible: Boolean },
  dia_numero:    { type: String },
  mes:           { texto: String, visible: Boolean, color: String },
  horario:       { texto: String, visible: Boolean },
  direccion:     { texto: String, visible: Boolean },
},

// Posiciones y tamaños
foto_dj_size: { type: Number, default: 300 },
foto_dj_position_y: { type: Number, default: 0 },
titulo_position_y: { type: Number, default: 0 },
fecha_position_y: { type: Number, default: 0 },

// Assets
logo_local_path: { type: String, default: null },
logo_dj_path: { type: String, default: null },
qr_url: { type: String, default: null },
usar_logo_local: { type: Boolean, default: true },
usar_logo_dj: { type: Boolean, default: true },
```

**Importante:** Todos los campos nuevos son opcionales con defaults para no romper carteles existentes.

### 1.2 Crear `src/models/StudioFondo.ts`

```typescript
interface IStudioFondo extends Document {
  path: string;        // /studio/carteles/fondos/{id}.jpg
  prompt: string;      // prompt FLUX usado
  used_count: number;  // veces reutilizado
  created_at: Date;
}

const StudioFondoSchema = new Schema({
  path: { type: String, required: true },
  prompt: { type: String, default: '' },
  used_count: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now },
});
```

### 1.3 Descargar fuentes para Puppeteer

Ejecutar script Node que descarga desde Google Fonts API y guarda TTF en `/public/studio/fonts/`:

```bash
# URLs de descarga directa Google Fonts API v2
Anton-Regular.ttf
Oswald-Bold.ttf
Playfair_Display-Bold.ttf
Pacifico-Regular.ttf
```

Verificar con: `ls -la public/studio/fonts/` — deben aparecer 6 ficheros TTF (los 2 existentes + 4 nuevos).

### Verificación Fase 1
- [ ] `grep -n "preset\|fuente\|color_acento" src/models/StudioCartel.ts` → campos presentes
- [ ] `ls src/models/StudioFondo.ts` → archivo existe
- [ ] `ls public/studio/fonts/*.ttf` → 6 archivos TTF

---

## Fase 2 — Puppeteer V2: nuevo HTML + API render

**Objetivo:** Actualizar `cartel-puppeteer.ts` con `ComposeParamsV2` que acepta todos los controles del editor. Crear la API route `POST /api/studio/carteles/render`.

### 2.1 Nueva interfaz ComposeParamsV2 en `src/lib/studio/cartel-puppeteer.ts`

```typescript
interface ComposeParamsV2 {
  // Assets (buffers igual que antes)
  fondoBuffer: Buffer;
  djFotoBuffer: Buffer | null;
  logoLocalBuffer: Buffer | null;
  logoDjBuffer: Buffer | null;
  qrBuffer: Buffer | null;

  // Estilo
  preset: string;
  fuente: string;           // 'Bebas Neue' | 'Anton' | 'Playfair Display' | 'Oswald' | 'Pacifico'
  colorAcento: string;      // '#FFD700'
  efectoTexto: string;      // 'Normal' | 'Sombra larga' | 'Stroke grueso' | 'Neón' | 'Desgastado'
  overlayIntensidad: number; // 0-100
  granoIntensidad: number;   // 0-30
  layout: string;            // 'CLASICO' | 'PORTADA' | 'MINIMALISTA' | 'DJ_PROTAGONISTA'

  // Textos
  textos: { /* mismo shape que el modelo */ };

  // Posiciones
  fotoDjSize: number;
  fotoDjPositionY: number;
  tituloPositionY: number;
  fechaPositionY: number;

  // Flags
  usarFotoDj: boolean;
  usarLogoLocal: boolean;
  usarLogoDj: boolean;
}
```

Mantener la interfaz `ComposeParams` original sin modificar (compatibilidad hacia atrás para la ruta `generate`).

### 2.2 Nueva función `generateCartelHTMLv2(p: ComposeParamsV2): string`

Añadir en `cartel-puppeteer.ts` junto a las funciones existentes. Genera el mismo HTML que el preview del browser pero con:

**Fuentes embebidas como base64** (patrón ya existente en el archivo):
```typescript
// Leer el TTF correspondiente a p.fuente
const fontMap: Record<string, string> = {
  'Bebas Neue': 'BebasNeue-Regular.ttf',
  'Anton': 'Anton-Regular.ttf',
  'Playfair Display': 'Playfair_Display-Bold.ttf',
  'Oswald': 'Oswald-Bold.ttf',
  'Pacifico': 'Pacifico-Regular.ttf',
};
const fontPath = path.join(process.cwd(), 'public', 'studio', 'fonts', fontMap[p.fuente]);
const fontBase64 = readFileSync(fontPath).toString('base64');
```

**Overlays calculados desde preset + overlayIntensidad:**
```typescript
const overlayOpacity = p.overlayIntensidad / 100;
// top: rgba(0,0,0,overlayOpacity * 0.85) → transparent
// bottom: rgba(0,0,0,overlayOpacity) → transparent
```

**Efecto texto calculado:**
```typescript
const efectosMap: Record<string, string> = {
  'Normal': '',
  'Sombra larga': 'text-shadow: 4px 4px 0 #000, 8px 8px 0 rgba(0,0,0,0.5)',
  'Stroke grueso': '-webkit-text-stroke: 3px #000',
  'Neón': `text-shadow: 0 0 10px ${p.colorAcento}, 0 0 20px ${p.colorAcento}, 0 0 40px ${p.colorAcento}`,
  'Desgastado': 'opacity: 0.85; letter-spacing: 6px',
};
```

**Layout posiciones** (offsets base + p.*PositionY):
```typescript
const layoutDefaults: Record<string, {...}> = {
  CLASICO: { tituloTop: 340, fotoDjTop: 680, nombreDjTop: 800, fechaBottom: 240 },
  PORTADA: { tituloTop: 150, fotoDjTop: 0, nombreDjTop: 960, fechaBottom: 120 },
  MINIMALISTA: { tituloTop: 280, fotoDjTop: 0, nombreDjTop: 0, fechaBottom: 340 },
  DJ_PROTAGONISTA: { tituloTop: 200, fotoDjTop: 500, nombreDjTop: 460, fechaBottom: 200 },
};
```

### 2.3 Nueva función `renderCartelV2(p: ComposeParamsV2, outputPath: string): Promise<void>`

Igual que `renderCartel()` existente pero usando `generateCartelHTMLv2()`. Viewport: 1080×1920, deviceScaleFactor: 1.5.

### 2.4 Nueva API `POST /api/studio/carteles/render` 

Crear `src/app/api/studio/carteles/render/route.ts`:

**Request body:**
```typescript
{
  // Estado completo del editor (mismo shape que ComposeParamsV2 sin buffers)
  fondo_path: string,          // /studio/carteles/fondos/{id}.jpg
  foto_dj_path: string | null,
  logo_local_path: string | null,
  logo_dj_path: string | null,
  qr_url: string | null,
  preset: string,
  fuente: string,
  color_acento: string,
  efecto_texto: string,
  overlay_intensidad: number,
  grano_intensidad: number,
  layout: string,
  textos: {...},
  foto_dj_size: number,
  foto_dj_position_y: number,
  titulo_position_y: number,
  fecha_position_y: number,
  usar_foto_dj: boolean,
  usar_logo_local: boolean,
  usar_logo_dj: boolean,
  // Opcional: guardar en MongoDB
  cartel_id?: string,
}
```

**Proceso:**
1. Cargar buffers desde paths (igual que en `generate/route.ts`)
2. Si `qr_url`: generar QR buffer via `qrcode` (ya instalado)
3. Llamar `renderCartelV2(params, outputPath)`
4. Devolver `{ cartelPath: '/studio/carteles/{uuid}.jpg' }`
5. Si `cartel_id`: actualizar `cartel_path` en MongoDB

**Response headers para descarga directa:**
```typescript
// El cliente hace window.location.href = cartelPath para descargar
```

### Verificación Fase 2
- [ ] `grep -n "ComposeParamsV2\|generateCartelHTMLv2\|renderCartelV2" src/lib/studio/cartel-puppeteer.ts` → 3 hits
- [ ] `ls src/app/api/studio/carteles/render/route.ts` → existe
- [ ] Test manual: POST `/api/studio/carteles/render` con body mínimo → devuelve JPG path

---

## Fase 3 — Nueva página: editor dos paneles

**Objetivo:** Reescribir completamente `src/app/studio/carteles/nuevo/page.tsx` con el layout de dos paneles y el preview en tiempo real.

**Archivo:** `src/app/studio/carteles/nuevo/page.tsx` (sobreescribir)

### 3.1 Estado del editor (TypeScript interface)

```typescript
interface EditorState {
  // Bloque 1: Estilo
  preset: PresetKey;
  colorAcento: string;
  overlayIntensidad: number;
  granoActivo: boolean;
  granoIntensidad: number;

  // Bloque 2: Tipografía
  fuente: string;
  efectoTexto: string;

  // Bloque 3: Textos
  textos: {
    nombre_evento: { texto: string; visible: boolean; color: string; size: number };
    subtitulo:     { texto: string; visible: boolean; color: string };
    nombre_dj:     { texto: string; visible: boolean; color: string; size: number };
    sesion:        { texto: string; visible: boolean; color: string };
    dress_code:    { texto: string; visible: boolean; color: string };
    info_extra:    { texto: string; visible: boolean; color: string };
    dia_semana:    { texto: string; visible: boolean };
    dia_numero:    string;
    mes:           { texto: string; visible: boolean; color: string };
    horario:       { texto: string; visible: boolean };
    direccion:     { texto: string; visible: boolean };
  };

  // Bloque 4: Layout
  layout: LayoutKey;
  fotoDjSize: number;
  fotoDjPositionY: number;
  tituloPositionY: number;
  fechaPositionY: number;

  // Bloque 5: Fondo
  fondoTab: 'ia' | 'foto' | 'solido';
  fondoPath: string | null;    // path en servidor
  fondoDataUrl: string | null; // data URL para preview local
  fondoColor: string;
  fondoPrompt: string;
  fondoColorHint: string;
  generandoFondo: boolean;

  // Bloque 6: DJ y assets
  djId: string;
  usarFotoDj: boolean;
  djFotoIndex: number;       // índice en dj.fotos[]
  usarLogoDj: boolean;
  usarLogoLocal: boolean;
  qrUrl: string;

  // UI
  renderizando: boolean;
}
```

### 3.2 Layout principal del componente

```tsx
<StudioLayout>
  {/* Cargar Google Fonts */}
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Anton&family=Playfair+Display:wght@700&family=Oswald:wght@700&family=Pacifico&display=swap');`}</style>

  <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
    
    {/* Panel izquierdo: controles */}
    <div style={{ width: 340, overflowY: 'auto', background: '#0f0f0f',
                  borderRight: '1px solid #222', flexShrink: 0 }}>
      <div style={{ padding: 16, paddingBottom: 120 }}>
        <Bloque1Estilo state={state} onChange={updateState} />
        <Bloque2Tipografia state={state} onChange={updateState} />
        <Bloque3Textos state={state} onChange={updateState} />
        <Bloque4Layout state={state} onChange={updateState} />
        <Bloque5Fondo state={state} onChange={updateState} onGenerarFondo={handleGenerarFondo} fondos={fondosGaleria} />
        <Bloque6Dj state={state} djs={djs} onChange={updateState} />
      </div>

      {/* Botones fijos abajo */}
      <div style={{ position: 'fixed', bottom: 0, width: 340, background: '#0f0f0f',
                    borderTop: '1px solid #222', padding: 12, display: 'flex', gap: 8 }}>
        <button onClick={handleRenderizar}>Recomponer</button>
        <button onClick={handleDescargar}>Descargar JPG</button>
        <button onClick={handleGuardar}>Guardar</button>
      </div>
    </div>

    {/* Panel derecho: preview */}
    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start',
                  justifyContent: 'center', background: '#1a1a1a',
                  overflow: 'hidden', paddingTop: 20 }}>
      <div style={{ position: 'relative',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    width: 1080, height: 1920 }}>
        <CartelPreviewV2 state={state} djData={djSeleccionado} />
      </div>
    </div>
  </div>
</StudioLayout>
```

**Cálculo de escala:**
```typescript
const [scale, setScale] = useState(0.4);
useEffect(() => {
  const calcScale = () => {
    const availableH = window.innerHeight - 100;
    setScale(Math.min(availableH / 1920, (window.innerWidth - 380) / 1080));
  };
  calcScale();
  window.addEventListener('resize', calcScale);
  return () => window.removeEventListener('resize', calcScale);
}, []);
```

### 3.3 Componente `CartelPreviewV2`

Componente puro que recibe `state` y renderiza el HTML del cartel como JSX React inline styles. Cada vez que `state` cambia, React re-renderiza automáticamente.

Estructura de capas (en orden de z-index):
1. Fondo: `<img>` con `objectFit: cover`, `width: '100%'`, `height: '100%'`
2. Overlay top: `<div>` con `background: linear-gradient(...)`
3. Overlay bottom: `<div>`
4. Logo local top: `<img>`
5. Nombre evento: `<div>` con fuente, colorAcento, efectoTexto
6. Subtítulo: `<div>` (si visible)
7. Foto DJ: `<div>` circular con `<img>` (si usarFotoDj)
8. Nombre DJ: `<div>`
9. Sesión, dress code, info extra: `<div>`s
10. Día semana, número día, mes: `<div>`s
11. Horario: `<div>`
12. Logo local bottom: `<img>`
13. Logo DJ bottom: `<img>`
14. QR: `<img>`
15. Dirección: `<div>`
16. Noise overlay: `<svg>` con filtro SVG

**Para las imágenes en preview:** usar directamente las URLs del servidor (`/api/studio/...`) con `<img src=...>`.

### 3.4 Bloques de controles

Cada bloque es un subcomponente que recibe `state` y `onChange`. Estilo: fondo `#111`, borde `#222`, texto blanco.

**Bloque 1 — Estilo visual:**
- 5 presets en grid 5 columnas, cada uno: div 60×100px con fondo de color representativo, nombre debajo. Al hacer click aplica preset y actualiza `colorAcento`, `fuente`, `overlayIntensidad`.
- Color picker: `<input type="color" value={state.colorAcento} onChange={...}/>`
- Overlay: `<input type="range" min="0" max="100" value={state.overlayIntensidad}/>`
- Grano: toggle + `<input type="range" min="0" max="30"/>`

**Bloque 2 — Tipografía:**
- 5 cards en grid 2-3 columnas. Cada card: texto "Nombre Evento" renderizado en esa fuente, 14px. Al click: `updateState({fuente: 'Anton'})`.
- Select de efecto texto: Normal / Sombra larga / Stroke grueso / Neón / Desgastado.

**Bloque 3 — Textos:**
- Para cada campo: `<input>` + toggle visible + `<input type="color">` + (si aplica) range tamaño.
- Organización: sección "Evento", sección "DJ", sección "Fecha", sección "Otros".

**Bloque 4 — Layout:**
- 4 presets layout en grid 2×2 (thumbnails 70×120px con texto descriptivo).
- Sliders de ajuste fino: posición Y título (-200 a +200), posición Y foto DJ, posición Y fecha, tamaño foto DJ (200-450).

**Bloque 5 — Fondo:**
- Tabs: "IA" | "Foto" | "Color".
- Tab IA: textarea prompt + select color hint + botón "Generar fondo" + galería 6 thumbnails.
- Tab Foto: dropzone (drag & drop o click).
- Tab Color: `<input type="color">`.

**Bloque 6 — DJ:**
- Select de DJ (carga djs desde API).
- Al seleccionar DJ: auto-rellena nombre_dj.texto, carga fotos disponibles.
- Toggle foto DJ + selector de foto si tiene varias (radio buttons con thumbnails).
- Toggle logo DJ + toggle logo local.
- Input URL QR.

### 3.5 localStorage persistence

```typescript
const STORAGE_KEY = 'cartel-editor-v2-state';

// Al cargar
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) setState(JSON.parse(saved));
}, []);

// Al cambiar state (debounced 500ms)
useEffect(() => {
  const t = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, 500);
  return () => clearTimeout(t);
}, [state]);
```

### 3.6 Handlers de acción

```typescript
// Generar fondo IA
async function handleGenerarFondo() {
  setState(s => ({...s, generandoFondo: true}));
  const res = await fetch('/api/studio/carteles/generate-fondo', {
    method: 'POST',
    body: JSON.stringify({ prompt: state.fondoPrompt, color_hint: state.fondoColorHint }),
  });
  const { fondo_path, fondo_url } = await res.json();
  setState(s => ({...s, generandoFondo: false, fondoPath: fondo_path, fondoDataUrl: fondo_url}));
  fetchFondosGaleria(); // actualizar galería
}

// Renderizar (llama a Puppeteer)
async function handleRenderizar() {
  setState(s => ({...s, renderizando: true}));
  const res = await fetch('/api/studio/carteles/render', {
    method: 'POST',
    body: JSON.stringify(buildRenderPayload(state)),
  });
  const { cartelPath } = await res.json();
  setCartelPath(cartelPath);
  setState(s => ({...s, renderizando: false}));
}

// Descargar: renderizar + trigger download
async function handleDescargar() {
  await handleRenderizar();
  window.open(cartelPath, '_blank');
}
```

### Verificación Fase 3
- [ ] `/studio/carteles/nuevo` carga sin errores en navegador
- [ ] Cambiar color acento → preview actualiza instantáneamente sin llamada servidor
- [ ] Cambiar fuente → texto del preview cambia de fuente
- [ ] Recargar página → estado se restaura desde localStorage
- [ ] Panel derecho muestra cartel escalado en proporción 9:16

---

## Fase 4 — Generación de fondo independiente + galería

**Objetivo:** Separar la generación de fondo FLUX en su propia API route sin generar el cartel. Crear galería de fondos reutilizables.

### 4.1 Nueva API `POST /api/studio/carteles/generate-fondo`

Crear `src/app/api/studio/carteles/generate-fondo/route.ts`.

Extraer la lógica de FLUX de `generate/route.ts`:
- Función `buildFluxPrompt()` ya existe en `generate/route.ts` → moverla a `src/lib/studio/flux.ts` (shared)
- Función `generateFondoFlux()` ya existe → moverla también

**Request body:**
```typescript
{ prompt: string; color_hint?: string; }
```

**Proceso:**
1. Llamar `buildFluxPrompt(color_hint, false, prompt)`
2. Llamar `generateFondoFlux(prompt_flux)`
3. Guardar en `/public/studio/carteles/fondos/{uuid}.jpg`
4. Crear documento `StudioFondo` en MongoDB
5. Devolver `{ fondo_path, fondo_url: '/studio/carteles/fondos/{uuid}.jpg', fondo_id }`

**Actualizar `generate/route.ts`:** importar las funciones desde `src/lib/studio/flux.ts` en lugar de tenerlas inline.

### 4.2 API `GET /api/studio/fondos`

Crear `src/app/api/studio/fondos/route.ts`:

```typescript
// GET — últimos 6 fondos generados
const fondos = await StudioFondo.find().sort({ created_at: -1 }).limit(6).lean();
return NextResponse.json({ fondos });
```

### 4.3 Integración en el editor (Bloque 5)

En el tab "IA" del Bloque 5:
```tsx
{/* Galería últimos 6 fondos */}
<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
  {fondosGaleria.map(fondo => (
    <img
      key={fondo._id}
      src={fondo.fondo_path}
      style={{ width: 80, height: 140, objectFit: 'cover', cursor: 'pointer',
               border: state.fondoPath === fondo.fondo_path ? '2px solid #7c3aed' : '2px solid transparent',
               borderRadius: 6 }}
      onClick={() => updateState({ fondoPath: fondo.fondo_path, fondoDataUrl: null })}
    />
  ))}
</div>
```

Al cargar el componente: `fetch('/api/studio/fondos')` → `setFondosGaleria(data.fondos)`.

### Verificación Fase 4
- [ ] POST `/api/studio/carteles/generate-fondo` → genera JPG y crea doc en MongoDB
- [ ] GET `/api/studio/fondos` → devuelve array con `fondo_path`
- [ ] Galería muestra thumbnails clicables en el editor
- [ ] Clicar thumbnail → preview actualiza fondo instantáneamente

---

## Fase 5 — Gestión de DJs mejorada

**Objetivo:** Añadir edición, gestión de múltiples fotos y eliminación de DJs en `/studio/carteles/djs`.

### 5.1 Nuevas API routes para DJs

**PATCH `/api/studio/djs/[id]/route.ts`** (ya existe el archivo — añadir handler PATCH):
```typescript
// Actualizar nombre
const { nombre } = await request.json();
const dj = await StudioDj.findByIdAndUpdate(id, { nombre }, { new: true });
return NextResponse.json({ dj });
```

**DELETE `/api/studio/djs/[id]/route.ts`** (añadir handler DELETE):
```typescript
// Eliminar DJ + sus archivos en disco
const dj = await StudioDj.findById(id);
// Borrar todas las fotos y logo de /public/studio/assets/djs/{id}/
await StudioDj.findByIdAndDelete(id);
return NextResponse.json({ success: true });
```

**DELETE `/api/studio/djs/[id]/fotos/[foto_id]/route.ts`** (nuevo archivo):
```typescript
// Eliminar foto específica del array fotos[]
// foto_id es el index o el filename encoded
const dj = await StudioDj.findById(id);
dj.fotos = dj.fotos.filter(f => f !== decodedFotoPath);
await dj.save();
// Borrar archivo del disco
return NextResponse.json({ dj });
```

**POST `/api/studio/djs/[id]/fotos/route.ts`** (nuevo archivo — wrapper de upload existente):
Redirigir a la lógica de `djs/[id]/upload/route.ts` con `tipo: 'foto'`.

### 5.2 Modal de edición en `/studio/carteles/djs/page.tsx`

Añadir estado en la página existente:
```typescript
const [editingDj, setEditingDj] = useState<DJ | null>(null);
```

Añadir botón "Editar" en cada DJ card que abre el modal.

**Modal `<EditDjModal dj={editingDj} onClose={...} onSave={...} />`:**
- Input nombre con botón Guardar → PATCH
- Grid de fotos actuales con ✕ para eliminar → DELETE
- Botón "Añadir foto" → POST fotos (input file oculto)
- Foto principal marcada con estrella (click → actualiza `fotos[0]`)
- Botón "Eliminar DJ" con confirmación → DELETE /api/studio/djs/[id]

### Verificación Fase 5
- [ ] Modal de edición abre con datos del DJ
- [ ] Cambiar nombre → se actualiza en la lista
- [ ] Eliminar foto → desaparece de la galería del modal
- [ ] Eliminar DJ → desaparece de la lista de DJs
- [ ] En el editor, seleccionar DJ muestra todas sus fotos disponibles

---

## Anti-patterns a evitar

| Anti-pattern | Correcto |
|---|---|
| Llamar al servidor en cada cambio de control | Actualizar solo el DOM/state React — sin fetch |
| Usar `renderCartel()` existente para el preview | Usar el componente React `CartelPreviewV2` |
| Inventar parámetros en la API FLUX | Copiar exactamente los params de `generate/route.ts` |
| CSS con clases Tailwind en el preview | Solo inline styles (para que Puppeteer y preview sean idénticos) |
| Fuentes Google Fonts en Puppeteer | Siempre base64 TTF embebido |
| `updateMany` en la galería de fondos | Cada fondo es un doc independiente en StudioFondo |

---

## Orden de ejecución recomendado

```
Fase 1 (30 min) → Fase 2 (90 min) → Fase 3 (180 min) → Fase 4 (45 min) → Fase 5 (60 min)
```

Cada fase es autónoma. Se puede verificar antes de pasar a la siguiente.

## Riesgos conocidos

1. **Google Fonts en Puppeteer:** Las fuentes nuevas (Anton, Playfair, Oswald, Pacifico) deben descargarse como TTF antes de la Fase 2. Si no están disponibles, Puppeteer caerá a fuente genérica.

2. **Paridad preview ↔ Puppeteer:** El HTML generado por `generateCartelHTMLv2()` debe ser idéntico al JSX de `CartelPreviewV2`. Mantener un archivo de constantes compartido `src/lib/studio/cartel-constants.ts` con los `layoutDefaults`, `presets` y `efectosMap`.

3. **Compatibilidad hacia atrás:** Los carteles generados antes del V2 (sin campos `preset`, `fuente`, etc.) deben seguir siendo renderizables. El modelo tiene defaults para todos los campos nuevos.

4. **FLUX quota:** La galería de fondos reduce el consumo al reutilizar fondos ya generados. Implementar primero la galería para no gastar cuota en pruebas.
