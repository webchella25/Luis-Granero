'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StudioLayout from '@/components/studio/StudioLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DJ {
  _id: string;
  nombre: string;
  logo_path: string | null;
  fotos: string[];
}

interface Fondo {
  _id: string;
  path: string;
}

interface TextoCampo {
  texto: string;
  visible: boolean;
  color: string;
}

interface TextoCampoConSize extends TextoCampo {
  size: number;
}

interface EditorState {
  // Bloque 1: Estilo
  preset: string;
  colorAcento: string;
  overlayIntensidad: number;
  granoActivo: boolean;
  granoIntensidad: number;

  // Bloque 2: Tipografía
  fuente: string;
  efectoTexto: string;

  // Bloque 3: Textos
  textos: {
    nombre_evento: TextoCampoConSize;
    subtitulo: TextoCampo;
    nombre_dj: TextoCampoConSize;
    sesion: TextoCampo;
    dress_code: TextoCampo;
    info_extra: TextoCampo;
    dia_semana: { texto: string; visible: boolean };
    dia_numero: string;
    mes: TextoCampo;
    horario: { texto: string; visible: boolean };
    direccion: { texto: string; visible: boolean };
  };

  // Bloque 4: Layout
  layout: string;
  fotoDjSize: number;
  fotoDjPositionY: number;
  tituloPositionY: number;
  fechaPositionY: number;

  // Bloque 5: Fondo
  fondoTab: 'ia' | 'foto' | 'solido';
  fondoPath: string | null;
  fondoDataUrl: string | null;
  fondoColor: string;
  fondoPrompt: string;
  fondoColorHint: string;
  generandoFondo: boolean;

  // Bloque 6: DJ y assets
  djId: string;
  usarFotoDj: boolean;
  djFotoIndex: number;
  usarLogoDj: boolean;
  usarLogoLocal: boolean;
  qrUrl: string;

  // UI
  renderizando: boolean;
}

const DEFAULT_STATE: EditorState = {
  preset: 'OSCURO_ELEGANTE',
  colorAcento: '#FFD700',
  overlayIntensidad: 75,
  granoActivo: true,
  granoIntensidad: 10,
  fuente: 'Bebas Neue',
  efectoTexto: 'Normal',
  textos: {
    nombre_evento: { texto: 'NOMBRE EVENTO', visible: true, color: '#FFFFFF', size: 180 },
    subtitulo: { texto: '', visible: false, color: '#FFD700' },
    nombre_dj: { texto: '', visible: true, color: '#FFFFFF', size: 100 },
    sesion: { texto: '', visible: false, color: '#CCCCCC' },
    dress_code: { texto: '', visible: false, color: '#FFD700' },
    info_extra: { texto: '', visible: false, color: '#CCCCCC' },
    dia_semana: { texto: 'VIERNES', visible: true },
    dia_numero: '14',
    mes: { texto: 'JUNIO', visible: true, color: '#FFFFFF' },
    horario: { texto: '22:00H', visible: true },
    direccion: { texto: '', visible: false },
  },
  layout: 'CLASICO',
  fotoDjSize: 300,
  fotoDjPositionY: 0,
  tituloPositionY: 0,
  fechaPositionY: 0,
  fondoTab: 'ia',
  fondoPath: null,
  fondoDataUrl: null,
  fondoColor: '#1a0a2e',
  fondoPrompt: '',
  fondoColorHint: '',
  generandoFondo: false,
  djId: '',
  usarFotoDj: false,
  djFotoIndex: 0,
  usarLogoDj: true,
  usarLogoLocal: true,
  qrUrl: '',
  renderizando: false,
};

const PRESETS = [
  { key: 'OSCURO_ELEGANTE', label: 'Elegante', color: '#1a1a2e', acento: '#FFD700', fuente: 'Bebas Neue' },
  { key: 'NEON_VIBRANTE', label: 'Neón', color: '#0d0d1a', acento: '#FF00FF', fuente: 'Anton' },
  { key: 'CLASICO_ORO', label: 'Clásico', color: '#0f0f0f', acento: '#C9A84C', fuente: 'Playfair Display' },
  { key: 'MINIMALISTA_BN', label: 'Minimal', color: '#111111', acento: '#FFFFFF', fuente: 'Oswald' },
  { key: 'ATARDECER_TARDEO', label: 'Tardeo', color: '#2d1b00', acento: '#FF8C00', fuente: 'Pacifico' },
];

const FUENTES = ['Bebas Neue', 'Anton', 'Playfair Display', 'Oswald', 'Pacifico'];
const EFECTOS = ['Normal', 'Sombra larga', 'Stroke grueso', 'Neón', 'Desgastado'];
const LAYOUTS = [
  { key: 'CLASICO', label: 'Clásico', desc: 'Foto DJ izq.' },
  { key: 'PORTADA', label: 'Portada', desc: 'Centrado' },
  { key: 'MINIMALISTA', label: 'Minimal', desc: 'Sin foto' },
  { key: 'DJ_PROTAGONISTA', label: 'DJ grande', desc: 'Foto entera' },
];

const STORAGE_KEY = 'cartel-editor-v2-state';

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '10px 14px 6px', fontSize: 10, fontWeight: 700, color: '#666',
      letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: '1px solid #1a1a1a' }}>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: 10, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{children}</label>;
}

function SliderRow({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <Row>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FieldLabel>{label}</FieldLabel>
        <span style={{ fontSize: 10, color: '#555' }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#7c3aed' }} />
    </Row>
  );
}

function ToggleRow({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <Row>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
          style={{ accentColor: '#7c3aed', width: 14, height: 14 }} />
        <span style={{ fontSize: 12, color: '#aaa' }}>{label}</span>
      </label>
    </Row>
  );
}

// ─── Bloque 1: Estilo ─────────────────────────────────────────────────────────

function Bloque1Estilo({ state, onChange }: { state: EditorState; onChange: (p: Partial<EditorState>) => void }) {
  return (
    <div>
      <SectionTitle>Estilo visual</SectionTitle>
      <Row>
        <FieldLabel>Preset</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
          {PRESETS.map(p => (
            <button key={p.key} onClick={() => onChange({ preset: p.key, colorAcento: p.acento, fuente: p.fuente })}
              style={{ background: state.preset === p.key ? p.color : '#111', border: `2px solid ${state.preset === p.key ? p.acento : '#2a2a2a'}`,
                borderRadius: 6, padding: '6px 2px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ width: '100%', height: 28, background: p.color, borderRadius: 3, marginBottom: 3,
                border: `1px solid ${p.acento}` }} />
              <span style={{ fontSize: 9, color: state.preset === p.key ? p.acento : '#555' }}>{p.label}</span>
            </button>
          ))}
        </div>
      </Row>
      <Row>
        <FieldLabel>Color acento</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="color" value={state.colorAcento} onChange={e => onChange({ colorAcento: e.target.value })}
            style={{ width: 36, height: 28, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
          <span style={{ fontSize: 11, color: '#777', fontFamily: 'monospace' }}>{state.colorAcento}</span>
        </div>
      </Row>
      <SliderRow label="Overlay" value={state.overlayIntensidad} min={0} max={100}
        onChange={v => onChange({ overlayIntensidad: v })} />
      <Row>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={state.granoActivo} onChange={e => onChange({ granoActivo: e.target.checked })}
              style={{ accentColor: '#7c3aed', width: 14, height: 14 }} />
            <span style={{ fontSize: 12, color: '#aaa' }}>Grano</span>
          </label>
          {state.granoActivo && (
            <input type="range" min={0} max={30} value={state.granoIntensidad}
              onChange={e => onChange({ granoIntensidad: Number(e.target.value) })}
              style={{ width: 100, accentColor: '#7c3aed' }} />
          )}
        </div>
      </Row>
    </div>
  );
}

// ─── Bloque 2: Tipografía ─────────────────────────────────────────────────────

function Bloque2Tipografia({ state, onChange }: { state: EditorState; onChange: (p: Partial<EditorState>) => void }) {
  return (
    <div>
      <SectionTitle>Tipografía</SectionTitle>
      <Row>
        <FieldLabel>Fuente</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 140px)', gap: 6, justifyContent: 'start' }}>
          {FUENTES.map(f => (
            <button key={f} onClick={() => onChange({ fuente: f })}
              style={{ width: 140, height: 70, padding: '8px 10px', display: 'flex', flexDirection: 'column',
                alignItems: 'flex-start', justifyContent: 'space-between',
                background: state.fuente === f ? '#1e1040' : '#111',
                border: `1px solid ${state.fuente === f ? '#7c3aed' : '#2a2a2a'}`, borderRadius: 6,
                cursor: 'pointer', overflow: 'hidden' }}>
              <span style={{ fontFamily: `'${f}', sans-serif`, fontSize: 18, lineHeight: 1,
                color: state.fuente === f ? '#fff' : '#999', whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'left' }}>
                Evento
              </span>
              <div style={{ fontSize: 9, color: state.fuente === f ? '#a78bfa' : '#444',
                letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis', width: '100%', textAlign: 'left' }}>
                {f}
              </div>
            </button>
          ))}
        </div>
      </Row>
      <Row>
        <FieldLabel>Efecto texto</FieldLabel>
        <select value={state.efectoTexto} onChange={e => onChange({ efectoTexto: e.target.value })}
          style={{ background: '#111', border: '1px solid #2a2a2a', color: '#ccc', borderRadius: 6,
            padding: '6px 8px', fontSize: 12 }}>
          {EFECTOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </Row>
    </div>
  );
}

// ─── Bloque 3: Textos ─────────────────────────────────────────────────────────

function TextoField({ label, value, colorValue, sizeValue, visible, onText, onColor, onSize, onVisible }: {
  label: string; value: string; colorValue: string; visible: boolean;
  sizeValue?: number;
  onText: (v: string) => void; onColor: (v: string) => void;
  onSize?: (v: number) => void; onVisible: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={visible} onChange={e => onVisible(e.target.checked)}
          style={{ accentColor: '#7c3aed', width: 12, height: 12 }} />
        <FieldLabel>{label}</FieldLabel>
        <input type="color" value={colorValue} onChange={e => onColor(e.target.value)}
          style={{ width: 22, height: 18, border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginLeft: 'auto' }} />
      </div>
      <input type="text" value={value} onChange={e => onText(e.target.value)} disabled={!visible}
        style={{ background: visible ? '#1a1a1a' : '#0d0d0d', border: '1px solid #2a2a2a', color: visible ? '#ddd' : '#444',
          borderRadius: 4, padding: '4px 8px', fontSize: 11 }} />
      {sizeValue !== undefined && onSize && (
        <input type="range" min={60} max={260} value={sizeValue} onChange={e => onSize(Number(e.target.value))}
          style={{ accentColor: '#7c3aed' }} />
      )}
    </div>
  );
}

function Bloque3Textos({ state, onChange }: { state: EditorState; onChange: (p: Partial<EditorState>) => void }) {
  const t = state.textos;
  const setT = useCallback((partial: Partial<typeof t>) => {
    onChange({ textos: { ...t, ...partial } });
  }, [t, onChange]);

  return (
    <div>
      <SectionTitle>Textos</SectionTitle>
      <Row>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 10, color: '#444', marginBottom: 2 }}>EVENTO</div>
          <TextoField label="Nombre evento" value={t.nombre_evento.texto} colorValue={t.nombre_evento.color}
            sizeValue={t.nombre_evento.size} visible={t.nombre_evento.visible}
            onText={v => setT({ nombre_evento: { ...t.nombre_evento, texto: v } })}
            onColor={v => setT({ nombre_evento: { ...t.nombre_evento, color: v } })}
            onSize={v => setT({ nombre_evento: { ...t.nombre_evento, size: v } })}
            onVisible={v => setT({ nombre_evento: { ...t.nombre_evento, visible: v } })} />
          <TextoField label="Subtítulo" value={t.subtitulo.texto} colorValue={t.subtitulo.color}
            visible={t.subtitulo.visible}
            onText={v => setT({ subtitulo: { ...t.subtitulo, texto: v } })}
            onColor={v => setT({ subtitulo: { ...t.subtitulo, color: v } })}
            onVisible={v => setT({ subtitulo: { ...t.subtitulo, visible: v } })} />
          <TextoField label="Info extra" value={t.info_extra.texto} colorValue={t.info_extra.color}
            visible={t.info_extra.visible}
            onText={v => setT({ info_extra: { ...t.info_extra, texto: v } })}
            onColor={v => setT({ info_extra: { ...t.info_extra, color: v } })}
            onVisible={v => setT({ info_extra: { ...t.info_extra, visible: v } })} />

          <div style={{ fontSize: 10, color: '#444', marginTop: 4 }}>DJ</div>
          <TextoField label="Nombre DJ" value={t.nombre_dj.texto} colorValue={t.nombre_dj.color}
            sizeValue={t.nombre_dj.size} visible={t.nombre_dj.visible}
            onText={v => setT({ nombre_dj: { ...t.nombre_dj, texto: v } })}
            onColor={v => setT({ nombre_dj: { ...t.nombre_dj, color: v } })}
            onSize={v => setT({ nombre_dj: { ...t.nombre_dj, size: v } })}
            onVisible={v => setT({ nombre_dj: { ...t.nombre_dj, visible: v } })} />
          <TextoField label="Sesión" value={t.sesion.texto} colorValue={t.sesion.color}
            visible={t.sesion.visible}
            onText={v => setT({ sesion: { ...t.sesion, texto: v } })}
            onColor={v => setT({ sesion: { ...t.sesion, color: v } })}
            onVisible={v => setT({ sesion: { ...t.sesion, visible: v } })} />
          <TextoField label="Dress code" value={t.dress_code.texto} colorValue={t.dress_code.color}
            visible={t.dress_code.visible}
            onText={v => setT({ dress_code: { ...t.dress_code, texto: v } })}
            onColor={v => setT({ dress_code: { ...t.dress_code, color: v } })}
            onVisible={v => setT({ dress_code: { ...t.dress_code, visible: v } })} />

          <div style={{ fontSize: 10, color: '#444', marginTop: 4 }}>FECHA</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            <div>
              <FieldLabel>Día sem.</FieldLabel>
              <input type="text" value={t.dia_semana.texto}
                onChange={e => setT({ dia_semana: { ...t.dia_semana, texto: e.target.value } })}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ddd',
                  borderRadius: 4, padding: '4px 6px', fontSize: 11 }} />
            </div>
            <div>
              <FieldLabel>Día num.</FieldLabel>
              <input type="text" value={t.dia_numero}
                onChange={e => setT({ dia_numero: e.target.value })}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ddd',
                  borderRadius: 4, padding: '4px 6px', fontSize: 11 }} />
            </div>
            <div>
              <FieldLabel>Mes</FieldLabel>
              <input type="text" value={t.mes.texto}
                onChange={e => setT({ mes: { ...t.mes, texto: e.target.value } })}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ddd',
                  borderRadius: 4, padding: '4px 6px', fontSize: 11 }} />
            </div>
          </div>
          <div>
            <FieldLabel>Horario</FieldLabel>
            <input type="text" value={t.horario.texto}
              onChange={e => setT({ horario: { ...t.horario, texto: e.target.value } })}
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ddd',
                borderRadius: 4, padding: '4px 6px', fontSize: 11 }} />
          </div>
          <div>
            <FieldLabel>Dirección</FieldLabel>
            <input type="text" value={t.direccion.texto}
              onChange={e => setT({ direccion: { ...t.direccion, texto: e.target.value } })}
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ddd',
                borderRadius: 4, padding: '4px 6px', fontSize: 11 }} />
          </div>
        </div>
      </Row>
    </div>
  );
}

// ─── Bloque 4: Layout ─────────────────────────────────────────────────────────

function Bloque4Layout({ state, onChange }: { state: EditorState; onChange: (p: Partial<EditorState>) => void }) {
  return (
    <div>
      <SectionTitle>Layout</SectionTitle>
      <Row>
        <FieldLabel>Disposición</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
          {LAYOUTS.map(l => (
            <button key={l.key} onClick={() => onChange({ layout: l.key })}
              style={{ padding: '10px 6px', background: state.layout === l.key ? '#1e1040' : '#111',
                border: `1px solid ${state.layout === l.key ? '#7c3aed' : '#2a2a2a'}`, borderRadius: 6,
                cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ width: 40, height: 60, background: '#1a1a1a', borderRadius: 3, margin: '0 auto 4px',
                border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 8, color: '#555' }}>{l.label}</span>
              </div>
              <div style={{ fontSize: 10, color: state.layout === l.key ? '#a78bfa' : '#666' }}>{l.label}</div>
              <div style={{ fontSize: 9, color: '#444' }}>{l.desc}</div>
            </button>
          ))}
        </div>
      </Row>
      <SliderRow label="Tamaño foto DJ" value={state.fotoDjSize} min={200} max={450}
        onChange={v => onChange({ fotoDjSize: v })} />
      <SliderRow label="Pos. Y título" value={state.tituloPositionY} min={-200} max={200}
        onChange={v => onChange({ tituloPositionY: v })} />
      <SliderRow label="Pos. Y foto DJ" value={state.fotoDjPositionY} min={-300} max={300}
        onChange={v => onChange({ fotoDjPositionY: v })} />
      <SliderRow label="Pos. Y fecha" value={state.fechaPositionY} min={-200} max={200}
        onChange={v => onChange({ fechaPositionY: v })} />
    </div>
  );
}

// ─── Bloque 5: Fondo ──────────────────────────────────────────────────────────

function Bloque5Fondo({ state, onChange, onGenerarFondo, fondos }: {
  state: EditorState;
  onChange: (p: Partial<EditorState>) => void;
  onGenerarFondo: () => void;
  fondos: Fondo[];
}) {
  const COLOR_HINTS = ['oscuro', 'cálido', 'morado/rosa', 'dorado/negro', 'tardeo', 'retro'];

  return (
    <div>
      <SectionTitle>Fondo</SectionTitle>
      <Row>
        <div style={{ display: 'flex', gap: 0, marginBottom: 8 }}>
          {(['ia', 'foto', 'solido'] as const).map(tab => (
            <button key={tab} onClick={() => onChange({ fondoTab: tab })}
              style={{ flex: 1, padding: '6px 4px', fontSize: 10, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                background: state.fondoTab === tab ? '#7c3aed' : '#111',
                color: state.fondoTab === tab ? '#fff' : '#555',
                border: '1px solid #2a2a2a', cursor: 'pointer',
                borderRadius: tab === 'ia' ? '4px 0 0 4px' : tab === 'solido' ? '0 4px 4px 0' : '0' }}>
              {tab === 'ia' ? 'IA' : tab === 'foto' ? 'Foto' : 'Color'}
            </button>
          ))}
        </div>

        {state.fondoTab === 'ia' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea value={state.fondoPrompt} onChange={e => onChange({ fondoPrompt: e.target.value })}
              placeholder="ej: fiesta underground, neones morados, humo en el suelo..."
              rows={3}
              style={{ background: '#111', border: '1px solid #2a2a2a', color: '#ccc', borderRadius: 6,
                padding: '8px', fontSize: 11, resize: 'vertical' }} />
            <div>
              <FieldLabel>Tono de color</FieldLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {COLOR_HINTS.map(h => (
                  <button key={h} onClick={() => onChange({ fondoColorHint: h })}
                    style={{ padding: '3px 8px', fontSize: 10, borderRadius: 12,
                      background: state.fondoColorHint === h ? '#1e1040' : '#111',
                      border: `1px solid ${state.fondoColorHint === h ? '#7c3aed' : '#2a2a2a'}`,
                      color: state.fondoColorHint === h ? '#a78bfa' : '#555', cursor: 'pointer' }}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={onGenerarFondo} disabled={state.generandoFondo}
              style={{ padding: '8px 12px', background: state.generandoFondo ? '#333' : '#7c3aed',
                color: '#fff', border: 'none', borderRadius: 6, cursor: state.generandoFondo ? 'not-allowed' : 'pointer',
                fontSize: 12, fontWeight: 600 }}>
              {state.generandoFondo ? 'Generando...' : 'Generar fondo con IA'}
            </button>
            {fondos.length > 0 && (
              <div>
                <FieldLabel>Fondos recientes</FieldLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {fondos.map(f => (
                    <button key={f._id} onClick={() => onChange({ fondoPath: f.path, fondoDataUrl: null })}
                      style={{ padding: 0, border: `2px solid ${state.fondoPath === f.path ? '#7c3aed' : 'transparent'}`,
                        borderRadius: 6, cursor: 'pointer', overflow: 'hidden', background: 'none' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.path} alt="" style={{ width: 56, height: 100, objectFit: 'cover', display: 'block' }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {state.fondoTab === 'foto' && (
          <div>
            <label style={{ display: 'block', padding: '20px', background: '#111', border: '2px dashed #2a2a2a',
              borderRadius: 8, textAlign: 'center', cursor: 'pointer' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => onChange({ fondoDataUrl: ev.target?.result as string, fondoPath: null });
                  reader.readAsDataURL(file);
                }} />
              <div style={{ color: '#555', fontSize: 12 }}>Arrastra o haz click para subir</div>
              <div style={{ color: '#333', fontSize: 10, marginTop: 4 }}>JPG, PNG, WEBP</div>
            </label>
            {state.fondoDataUrl && (
              <div style={{ marginTop: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={state.fondoDataUrl} alt="Fondo" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} />
              </div>
            )}
          </div>
        )}

        {state.fondoTab === 'solido' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="color" value={state.fondoColor} onChange={e => onChange({ fondoColor: e.target.value, fondoPath: null, fondoDataUrl: null })}
              style={{ width: 44, height: 36, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
            <span style={{ fontSize: 11, color: '#777', fontFamily: 'monospace' }}>{state.fondoColor}</span>
          </div>
        )}
      </Row>
    </div>
  );
}

// ─── Bloque 6: DJ ─────────────────────────────────────────────────────────────

function Bloque6Dj({ state, djs, onChange }: {
  state: EditorState; djs: DJ[]; onChange: (p: Partial<EditorState>) => void;
}) {
  const djSeleccionado = djs.find(d => d._id === state.djId) ?? null;

  return (
    <div>
      <SectionTitle>DJ y assets</SectionTitle>
      <Row>
        <FieldLabel>DJ</FieldLabel>
        <select value={state.djId} onChange={e => {
          const newDj = djs.find(d => d._id === e.target.value);
          onChange({
            djId: e.target.value,
            djFotoIndex: 0,
            textos: {
              ...state.textos,
              nombre_dj: {
                ...state.textos.nombre_dj,
                texto: newDj ? newDj.nombre.toUpperCase() : state.textos.nombre_dj.texto,
              },
            },
          });
        }}
          style={{ background: '#111', border: '1px solid #2a2a2a', color: '#ccc', borderRadius: 6,
            padding: '6px 8px', fontSize: 12, width: '100%' }}>
          <option value="">Sin DJ específico</option>
          {djs.map(d => <option key={d._id} value={d._id}>DJ {d.nombre}</option>)}
        </select>
      </Row>

      {djSeleccionado && (
        <>
          <ToggleRow label="Incluir foto del DJ" checked={state.usarFotoDj}
            onChange={v => onChange({ usarFotoDj: v })} />
          {state.usarFotoDj && djSeleccionado.fotos.length > 0 && (
            <Row>
              <FieldLabel>Foto</FieldLabel>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {djSeleccionado.fotos.map((foto, i) => (
                  <button key={i} onClick={() => onChange({ djFotoIndex: i })}
                    style={{ padding: 0, border: `2px solid ${state.djFotoIndex === i ? '#f59e0b' : 'transparent'}`,
                      borderRadius: 6, cursor: 'pointer', overflow: 'hidden', background: 'none' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={foto} alt="" style={{ width: 44, height: 44, objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            </Row>
          )}
          <ToggleRow label="Logo del DJ" checked={state.usarLogoDj}
            onChange={v => onChange({ usarLogoDj: v })} />
        </>
      )}

      <ToggleRow label="Logo local (Cero Ocho)" checked={state.usarLogoLocal}
        onChange={v => onChange({ usarLogoLocal: v })} />

      <Row>
        <FieldLabel>URL para QR (opcional)</FieldLabel>
        <input type="text" value={state.qrUrl} onChange={e => onChange({ qrUrl: e.target.value })}
          placeholder="https://..."
          style={{ background: '#111', border: '1px solid #2a2a2a', color: '#ccc', borderRadius: 6,
            padding: '6px 8px', fontSize: 11 }} />
      </Row>
    </div>
  );
}

// ─── CartelPreviewV2 ──────────────────────────────────────────────────────────

function CartelPreviewV2({ state, djData }: { state: EditorState; djData: DJ | null }) {
  const t = state.textos;
  const fondoSrc = state.fondoDataUrl ?? state.fondoPath ?? null;
  const opa = Math.max(0, Math.min(1, state.overlayIntensidad / 100));

  let textShadow = '2px 2px 8px rgba(0,0,0,0.9)';
  let textStroke: string | undefined;
  if (state.efectoTexto === 'Sombra larga') textShadow = '4px 4px 0 rgba(0,0,0,0.8), 8px 8px 0 rgba(0,0,0,0.4)';
  else if (state.efectoTexto === 'Stroke grueso') { textStroke = `3px ${state.colorAcento}`; }
  else if (state.efectoTexto === 'Neón') textShadow = `0 0 10px ${state.colorAcento}, 0 0 30px ${state.colorAcento}`;
  else if (state.efectoTexto === 'Desgastado') textShadow = '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(255,255,255,0.1)';

  const djFotoUrl = (state.usarFotoDj && djData && djData.fotos.length > 0)
    ? (djData.fotos[state.djFotoIndex] ?? djData.fotos[0]) : null;
  const logoDjUrl = (state.usarLogoDj && djData?.logo_path) ? djData.logo_path : null;
  const ff = `'${state.fuente}', sans-serif`;
  const granoOpa = state.granoActivo ? state.granoIntensidad / 100 : 0;

  // Pixel positions (1080×1920 canvas)
  const tituloTop = 340 + state.tituloPositionY;
  const fotoDjTop = 860 + state.fotoDjPositionY;
  const nombreDjTop = fotoDjTop + 110;
  const sesionTop = nombreDjTop + t.nombre_dj.size + 20;
  const dresscodeTop = sesionTop + 50;
  const infoTop = dresscodeTop + 46;
  const diaSemanaBtm = 432 - state.fechaPositionY;
  const diaNumBtm = 272 - state.fechaPositionY;
  const mesBtm = 230 - state.fechaPositionY;
  const horarioBtm = 170 - state.fechaPositionY;

  return (
    <div style={{
      position: 'relative', width: 1080, height: 1920, overflow: 'hidden',
      background: state.fondoTab === 'solido' ? state.fondoColor : '#0a0a0a',
    }}>
      {/* Fondo z=0 */}
      {fondoSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fondoSrc} alt="" style={{
          position: 'absolute', top: 0, left: 0, width: 1080, height: 1920,
          objectFit: 'cover', zIndex: 0,
        }} />
      )}

      {/* Overlay top z=1 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 600, zIndex: 1,
        background: `linear-gradient(to bottom,rgba(0,0,0,${(opa*0.85).toFixed(2)}) 0%,rgba(0,0,0,${(opa*0.4).toFixed(2)}) 60%,transparent 100%)`,
      }} />
      {/* Overlay bottom z=1 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 700, zIndex: 1,
        background: `linear-gradient(to top,rgba(0,0,0,${opa.toFixed(2)}) 0%,rgba(0,0,0,${(opa*0.5).toFixed(2)}) 50%,transparent 100%)`,
      }} />
      {/* Grano z=1 */}
      {granoOpa > 0 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1,
          opacity: granoOpa, mixBlendMode: 'overlay', pointerEvents: 'none',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }} />
      )}

      {/* Subtítulo z=2 */}
      {t.subtitulo.visible && t.subtitulo.texto && (
        <div style={{
          position: 'absolute', top: tituloTop - 70, left: 50, width: 980,
          textAlign: 'center', zIndex: 2, fontFamily: 'system-ui,sans-serif',
          fontWeight: 700, fontSize: 52, color: t.subtitulo.color,
          textShadow: '2px 2px 8px rgba(0,0,0,0.9)', letterSpacing: 4,
        }}>
          {t.subtitulo.texto.toUpperCase()}
        </div>
      )}

      {/* Nombre evento z=2 */}
      {t.nombre_evento.visible && t.nombre_evento.texto && (
        <div style={{
          position: 'absolute', top: tituloTop, left: 50, width: 980,
          textAlign: 'center', zIndex: 2, fontFamily: ff,
          fontSize: t.nombre_evento.size, color: t.nombre_evento.color,
          letterSpacing: 4, lineHeight: 1, textShadow, WebkitTextStroke: textStroke,
        }}>
          {t.nombre_evento.texto.toUpperCase()}
        </div>
      )}

      {/* Foto DJ z=2 */}
      {state.usarFotoDj && djFotoUrl && (
        <div style={{
          position: 'absolute', top: fotoDjTop, left: 80,
          width: state.fotoDjSize, height: state.fotoDjSize,
          borderRadius: '50%', overflow: 'hidden', zIndex: 2,
          border: `3px solid ${state.colorAcento}`,
          boxShadow: '0 0 30px rgba(0,0,0,0.8)',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={djFotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Nombre DJ z=2 */}
      {t.nombre_dj.visible && t.nombre_dj.texto && (
        <div style={{
          position: 'absolute', top: nombreDjTop,
          left: state.usarFotoDj ? 420 : 50,
          width: state.usarFotoDj ? 580 : 980,
          textAlign: state.usarFotoDj ? 'left' : 'center',
          zIndex: 2, fontFamily: ff, fontSize: t.nombre_dj.size,
          color: t.nombre_dj.color, lineHeight: 1,
          textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
        }}>
          {t.nombre_dj.texto.toUpperCase()}
        </div>
      )}

      {/* Sesión z=2 */}
      {t.sesion.visible && t.sesion.texto && (
        <div style={{
          position: 'absolute', top: sesionTop,
          left: state.usarFotoDj ? 420 : 50, width: state.usarFotoDj ? 580 : 980,
          zIndex: 2, fontFamily: 'system-ui,sans-serif', fontSize: 36,
          color: t.sesion.color, letterSpacing: 3,
        }}>
          {t.sesion.texto.toUpperCase()}
        </div>
      )}

      {/* Dress code z=2 */}
      {t.dress_code.visible && t.dress_code.texto && (
        <div style={{
          position: 'absolute', top: dresscodeTop,
          left: state.usarFotoDj ? 420 : 50,
          zIndex: 2, fontFamily: 'system-ui,sans-serif', fontSize: 32,
          color: t.dress_code.color, letterSpacing: 2,
        }}>
          {t.dress_code.texto.toUpperCase()}
        </div>
      )}

      {/* Info extra z=2 */}
      {t.info_extra.visible && t.info_extra.texto && (
        <div style={{
          position: 'absolute', top: infoTop,
          left: state.usarFotoDj ? 420 : 50, width: state.usarFotoDj ? 580 : 980,
          zIndex: 2, fontFamily: 'system-ui,sans-serif', fontSize: 28,
          color: t.info_extra.color,
        }}>
          {t.info_extra.texto}
        </div>
      )}

      {/* Día semana z=2 */}
      {t.dia_semana.visible && t.dia_semana.texto && (
        <div style={{
          position: 'absolute', bottom: diaSemanaBtm, right: 80,
          zIndex: 2, fontFamily: 'system-ui,sans-serif', fontWeight: 700,
          fontSize: 38, color: state.colorAcento, letterSpacing: 4,
        }}>
          {t.dia_semana.texto.toUpperCase()}
        </div>
      )}

      {/* Número día z=2 */}
      {t.dia_numero && (
        <div style={{
          position: 'absolute', bottom: diaNumBtm, right: 80,
          zIndex: 2, fontFamily: ff, fontSize: 200,
          color: '#ffffff', lineHeight: 1,
          textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
        }}>
          {t.dia_numero}
        </div>
      )}

      {/* Mes z=2 */}
      {t.mes.visible && t.mes.texto && (
        <div style={{
          position: 'absolute', bottom: mesBtm, right: 80,
          zIndex: 2, fontFamily: 'system-ui,sans-serif', fontSize: 46,
          color: t.mes.color, letterSpacing: 5,
        }}>
          {t.mes.texto.toUpperCase()}
        </div>
      )}

      {/* Horario z=2 */}
      {t.horario.visible && t.horario.texto && (
        <div style={{
          position: 'absolute', bottom: horarioBtm, left: 0, right: 0,
          textAlign: 'center', zIndex: 2, fontFamily: 'system-ui,sans-serif',
          fontSize: 44, color: '#dddddd', letterSpacing: 3,
        }}>
          {t.horario.texto}
        </div>
      )}

      {/* Logo DJ z=2 */}
      {logoDjUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoDjUrl} alt="" style={{
          position: 'absolute', bottom: 80, right: 80,
          maxWidth: 220, maxHeight: 120, objectFit: 'contain', zIndex: 2,
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))',
        }} />
      )}

      {/* Dirección z=2 */}
      {t.direccion.visible && t.direccion.texto && (
        <div style={{
          position: 'absolute', bottom: 30, left: 0, right: 0,
          textAlign: 'center', zIndex: 2, fontFamily: 'system-ui,sans-serif',
          fontSize: 30, color: 'rgba(200,200,200,0.8)',
        }}>
          {t.direccion.texto}
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function NuevoCartelPage() {
  const [state, setState] = useState<EditorState>(DEFAULT_STATE);
  const [djs, setDjs] = useState<DJ[]>([]);
  const [fondosGaleria, setFondosGaleria] = useState<Fondo[]>([]);
  const [cartelPath, setCartelPath] = useState<string | null>(null);
  const [scale, setScale] = useState(0.35);
  const [error, setError] = useState('');

  const djSeleccionado = djs.find(d => d._id === state.djId) ?? null;

  // Cargar desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<EditorState>;
        setState(prev => ({ ...prev, ...parsed, generandoFondo: false, renderizando: false }));
      }
    } catch { /* ignorar */ }
  }, []);

  // Guardar en localStorage (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 500);
    return () => clearTimeout(t);
  }, [state]);

  // Cálculo de escala: cabe en alto y ancho del panel derecho
  useEffect(() => {
    const calcScale = () => {
      const availableH = window.innerHeight - 40;
      const availableW = window.innerWidth - 340 - 20;
      setScale(Math.min(availableH / 1920, availableW / 1080));
    };
    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, []);

  // Cargar DJs y fondos
  useEffect(() => {
    fetch('/api/studio/djs').then(r => r.json()).then(d => setDjs(d.djs ?? [])).catch(console.error);
    fetchFondosGaleria();
  }, []);

  const fetchFondosGaleria = () => {
    fetch('/api/studio/fondos').then(r => r.json()).then(d => setFondosGaleria(d.fondos ?? [])).catch(console.error);
  };

  const updateState = useCallback((partial: Partial<EditorState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  async function handleGenerarFondo() {
    updateState({ generandoFondo: true });
    setError('');
    try {
      const res = await fetch('/api/studio/carteles/generate-fondo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: state.fondoPrompt, color_hint: state.fondoColorHint }),
      });
      const data = (await res.json()) as { fondo_path?: string; error?: string };
      if (!res.ok) { setError(data.error ?? 'Error generando fondo'); return; }
      updateState({ fondoPath: data.fondo_path ?? null, fondoDataUrl: null });
      fetchFondosGaleria();
    } catch {
      setError('Error de conexión al generar fondo');
    } finally {
      updateState({ generandoFondo: false });
    }
  }

  async function handleRenderizar(): Promise<string | null> {
    updateState({ renderizando: true });
    setError('');
    try {
      const djActual = djSeleccionado;
      const djFotoPath = (state.usarFotoDj && djActual && djActual.fotos.length > 0)
        ? djActual.fotos[state.djFotoIndex] ?? djActual.fotos[0]
        : null;

      const res = await fetch('/api/studio/carteles/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fondo_path: state.fondoPath,
          foto_dj_path: djFotoPath,
          logo_dj_path: djActual?.logo_path ?? null,
          preset: state.preset,
          fuente: state.fuente,
          color_acento: state.colorAcento,
          efecto_texto: state.efectoTexto,
          overlay_intensidad: state.overlayIntensidad,
          grano_intensidad: state.granoActivo ? state.granoIntensidad : 0,
          layout: state.layout,
          foto_dj_size: state.fotoDjSize,
          foto_dj_position_y: state.fotoDjPositionY,
          titulo_position_y: state.tituloPositionY,
          fecha_position_y: state.fechaPositionY,
          textos: state.textos,
          usar_foto_dj: state.usarFotoDj,
          usar_logo_local: state.usarLogoLocal,
          usar_logo_dj: state.usarLogoDj,
          qr_url: state.qrUrl || null,
        }),
      });
      const data = (await res.json()) as { cartelPath?: string; error?: string };
      if (!res.ok) { setError(data.error ?? 'Error renderizando'); return null; }
      const path = data.cartelPath ?? null;
      setCartelPath(path);
      return path;
    } catch {
      setError('Error de conexión al renderizar');
      return null;
    } finally {
      updateState({ renderizando: false });
    }
  }

  async function handleDescargar() {
    const path = await handleRenderizar();
    if (path) window.open(path, '_blank');
  }

  async function handleGuardar() {
    await handleRenderizar();
  }

  const canRender = !!state.fondoPath;

  return (
    <StudioLayout>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Anton&family=Playfair+Display:wght@700&family=Oswald:wght@700&family=Pacifico&display=swap');`}</style>

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>

        {/* Panel izquierdo: flex column — header + scroll + botones fijos */}
        <div style={{ width: 340, display: 'flex', flexDirection: 'column', background: '#0a0a0a',
          borderRight: '1px solid #1a1a1a', flexShrink: 0 }}>

          {/* Header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a1a', display: 'flex',
            alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <Link href="/studio/carteles" style={{ color: '#555', textDecoration: 'none', lineHeight: 0 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>Editor de carteles V2</span>
          </div>

          {/* Controles scrollables */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <Bloque1Estilo state={state} onChange={updateState} />
            <Bloque2Tipografia state={state} onChange={updateState} />
            <Bloque3Textos state={state} onChange={updateState} />
            <Bloque4Layout state={state} onChange={updateState} />
            <Bloque5Fondo state={state} onChange={updateState} onGenerarFondo={handleGenerarFondo}
              fondos={fondosGaleria} />
            <Bloque6Dj state={state} djs={djs} onChange={updateState} />
          </div>

          {/* Botones siempre visibles abajo */}
          <div style={{ borderTop: '1px solid #1a1a1a', padding: 10, display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={handleRenderizar} disabled={!canRender || state.renderizando}
              style={{ flex: 1, padding: '9px 6px', fontSize: 12, fontWeight: 600,
                background: canRender && !state.renderizando ? '#7c3aed' : '#222',
                color: canRender && !state.renderizando ? '#fff' : '#555',
                border: 'none', borderRadius: 6, cursor: canRender && !state.renderizando ? 'pointer' : 'not-allowed' }}>
              {state.renderizando ? 'Renderizando...' : 'Recomponer'}
            </button>
            <button onClick={handleDescargar} disabled={!canRender || state.renderizando}
              style={{ flex: 1, padding: '9px 6px', fontSize: 12, fontWeight: 600,
                background: canRender && !state.renderizando ? '#059669' : '#222',
                color: canRender && !state.renderizando ? '#fff' : '#555',
                border: 'none', borderRadius: 6, cursor: canRender && !state.renderizando ? 'pointer' : 'not-allowed' }}>
              Descargar JPG
            </button>
          </div>
        </div>

        {/* Panel derecho: preview a pantalla completa */}
        <div style={{ flex: 1, position: 'relative', background: '#141414', overflow: 'hidden',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>

          {/* Error */}
          {error && (
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
              zIndex: 10, padding: '8px 16px', background: 'rgba(239,68,68,0.9)',
              border: '1px solid rgba(239,68,68,0.5)', borderRadius: 8, color: '#fff', fontSize: 12,
              whiteSpace: 'nowrap' }}>
              {error}
            </div>
          )}

          {/* Preview en tiempo real o cartel Puppeteer — mismo contenedor */}
          <div style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            width: 1080,
            height: 1920,
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(0,0,0,0.9)',
            flexShrink: 0,
          }}>
            {cartelPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${cartelPath}?t=${Date.now()}`} alt="Cartel renderizado"
                style={{ width: 1080, height: 1920, objectFit: 'cover' }} />
            ) : (
              <CartelPreviewV2 state={state} djData={djSeleccionado} />
            )}
          </div>

          {/* Overlay: etiqueta modo + botón volver */}
          <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 8 }}>
            {cartelPath ? (
              <>
                <span style={{ fontSize: 10, color: '#666', letterSpacing: '0.06em' }}>PUPPETEER</span>
                <button onClick={() => setCartelPath(null)}
                  style={{ padding: '4px 12px', fontSize: 10, color: '#a78bfa',
                    background: 'rgba(124,58,237,0.15)', border: '1px solid #7c3aed',
                    borderRadius: 12, cursor: 'pointer' }}>
                  Preview en tiempo real
                </button>
              </>
            ) : (
              <span style={{ fontSize: 10, color: '#333', letterSpacing: '0.06em' }}>
                {state.fondoPath || state.fondoDataUrl ? 'PREVIEW EN TIEMPO REAL' : 'AÑADE UN FONDO PARA RENDERIZAR'}
              </span>
            )}
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
