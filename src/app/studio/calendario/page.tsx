'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import StudioLayout from '@/components/studio/StudioLayout';

// --- Types ---

interface CalendarioEntry {
  _id: string;
  semana: number;
  personaje: string;
  titulo: string;
  categoria: string;
  busquedas: 'alto' | 'medio';
  epoca: string;
  fecha_publicacion?: string | null;
  completado?: boolean;
  script_id?: string;
  orden: number;
  aniversario?: { fecha: string; descripcion: string } | null;
  competencia_analysis?: {
    score_oportunidad: number;
    angulo_unico: string;
    titulos_sugeridos: string[];
    analizado_en: string;
  } | null;
}

interface Calendario {
  _id: string;
  entries: CalendarioEntry[];
  generado_en: string;
}

interface AniversarioItem {
  personaje: string;
  fecha: string;
  dias_restantes: number;
  descripcion: string;
  urgencia: 'alta' | 'media';
}

interface CompetenciaResult {
  titulos_existentes: string[];
  angulo_unico: string;
  titulos_sugeridos: string[];
  score_oportunidad: number;
  razon: string;
}

interface EntryNormalizada {
  _id: string;
  categoria_nueva: string;
  nivel_1_entidad?: string | null;
  nivel_2_tipo: string;
  nivel_3_periodo?: string | null;
}

interface EntryProblema {
  _id: string;
  personaje: string;
  titulo: string;
  problema: string;
  categoria_sugerida: string;
}

interface LimpiezaResult {
  categorias_limpias: string[];
  entries_normalizadas: EntryNormalizada[];
  problemas_detectados: EntryProblema[];
}

// --- Color dinámico por categoría ---

const COLOR_PALETTE = [
  'text-violet-400 bg-violet-500/10 border-violet-500/25',
  'text-blue-400 bg-blue-500/10 border-blue-500/25',
  'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  'text-amber-400 bg-amber-500/10 border-amber-500/25',
  'text-red-400 bg-red-500/10 border-red-500/25',
  'text-pink-400 bg-pink-500/10 border-pink-500/25',
  'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
  'text-orange-400 bg-orange-500/10 border-orange-500/25',
  'text-teal-400 bg-teal-500/10 border-teal-500/25',
  'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
];

function hashCategoryColor(cat: string): string {
  let h = 0;
  for (let i = 0; i < cat.length; i++) h = (h * 31 + cat.charCodeAt(i)) & 0xffffff;
  return COLOR_PALETTE[Math.abs(h) % COLOR_PALETTE.length];
}

// --- Helpers ---

function semanaToFecha(semana: number): string {
  const base = new Date();
  base.setDate(base.getDate() + (semana - 1) * 7);
  return base.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (score >= 40) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  return 'text-red-400 bg-red-500/10 border-red-500/30';
}

function scoreLabel(score: number): string {
  if (score >= 70) return 'Alta oportunidad';
  if (score >= 40) return 'Oportunidad media';
  return 'Alta competencia';
}

// --- Página principal ---

export default function CalendarioPage() {
  const [calendario, setCalendario] = useState<Calendario | null>(null);
  const [entries, setEntries] = useState<CalendarioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [editingFecha, setEditingFecha] = useState<string | null>(null);
  const [fechaInput, setFechaInput] = useState('');
  const [viewMode, setViewMode] = useState<'lista' | 'timeline'>('lista');
  const [aniversarios, setAniversarios] = useState<AniversarioItem[]>([]);
  const [loadingAniversarios, setLoadingAniversarios] = useState(false);
  const [competenciaPanel, setCompetenciaPanel] = useState<string | null>(null);
  const [competenciaLoading, setCompetenciaLoading] = useState(false);
  const [competenciaCache, setCompetenciaCache] = useState<Record<string, CompetenciaResult>>({});
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [canalNombre, setCanalNombre] = useState('');
  const [pipelineTipo, setPipelineTipo] = useState<'narrativo' | 'musica_ambiental'>('narrativo');
  const [hideCompletados, setHideCompletados] = useState(false);
  const [limpiezaLoading, setLimpiezaLoading] = useState(false);
  const [limpiezaResult, setLimpiezaResult] = useState<LimpiezaResult | null>(null);
  const [limpiezaPanel, setLimpiezaPanel] = useState(false);

  useEffect(() => {
    fetchCalendario();
    fetchCanal();
  }, []);

  async function fetchCalendario() {
    setLoading(true);
    try {
      const res = await fetch('/api/studio/calendario');
      const data = (await res.json()) as { calendario: Calendario | null };
      if (data.calendario) {
        setCalendario(data.calendario);
        const sorted = [...data.calendario.entries].sort((a, b) => a.orden - b.orden);
        setEntries(sorted);
        // Pre-cargar aniversarios ya guardados en BD
        const prevAniv = sorted
          .filter((e) => e.aniversario)
          .map((e) => ({
            personaje: e.personaje,
            fecha: e.aniversario!.fecha,
            descripcion: e.aniversario!.descripcion,
            dias_restantes: Math.round(
              (new Date(e.aniversario!.fecha).getTime() - Date.now()) / 86400000
            ),
            urgencia: 'media' as const,
          }));
        if (prevAniv.length) setAniversarios(prevAniv);
        // Pre-cargar análisis de competencia guardados
        const cache: Record<string, CompetenciaResult> = {};
        sorted.forEach((e) => {
          if (e.competencia_analysis) {
            cache[e._id] = {
              titulos_existentes: [],
              angulo_unico: e.competencia_analysis.angulo_unico,
              titulos_sugeridos: e.competencia_analysis.titulos_sugeridos,
              score_oportunidad: e.competencia_analysis.score_oportunidad,
              razon: '',
            };
          }
        });
        if (Object.keys(cache).length) setCompetenciaCache(cache);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchCanal() {
    try {
      const res = await fetch('/api/studio/canal/current');
      const data = (await res.json()) as { canal: { nombre: string; pipeline_tipo?: string } | null };
      if (data.canal) {
        setCanalNombre(data.canal.nombre);
        if (data.canal.pipeline_tipo === 'musica_ambiental') setPipelineTipo('musica_ambiental');
      }
    } catch {}
  }

  async function handleGenerate() {
    const confirmMsg = entries.length > 0
      ? '¿Añadir más vídeos al calendario? Los existentes se conservarán.'
      : '¿Generar un calendario editorial con Claude?';
    if (!confirm(confirmMsg)) return;
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/studio/calendario', { method: 'POST' });
      const data = (await res.json()) as { calendario?: Calendario; error?: string };
      if (!res.ok) { setError(data.error ?? 'Error generando calendario'); return; }
      setCalendario(data.calendario!);
      const sorted = [...data.calendario!.entries].sort((a, b) => a.orden - b.orden);
      setEntries(sorted);
      // Re-cargar cache de competencia desde los datos actualizados
      const cache: Record<string, CompetenciaResult> = {};
      sorted.forEach((e) => {
        if (e.competencia_analysis) {
          cache[e._id] = {
            titulos_existentes: [],
            angulo_unico: e.competencia_analysis.angulo_unico,
            titulos_sugeridos: e.competencia_analysis.titulos_sugeridos,
            score_oportunidad: e.competencia_analysis.score_oportunidad,
            razon: '',
          };
        }
      });
      setCompetenciaCache(cache);
    } catch { setError('Error de conexión'); }
    finally { setGenerating(false); }
  }

  async function handleDetectarAniversarios() {
    setLoadingAniversarios(true);
    try {
      const res = await fetch('/api/studio/calendario/aniversarios', { method: 'POST' });
      const data = (await res.json()) as { aniversarios: AniversarioItem[] };
      const items = (data.aniversarios ?? []).filter((a) => a.dias_restantes >= 0 && a.dias_restantes <= 60);
      setAniversarios(items);
    } catch {}
    finally { setLoadingAniversarios(false); }
  }

  function handleProgramarAniversarios() {
    const personajesAniv = new Set(aniversarios.map((a) => a.personaje.toLowerCase()));
    const urgentes = entries.filter((e) => personajesAniv.has(e.personaje.toLowerCase()));
    const resto = entries.filter((e) => !personajesAniv.has(e.personaje.toLowerCase()));
    const sorted = aniversarios
      .slice()
      .sort((a, b) => a.dias_restantes - b.dias_restantes)
      .map((a) => urgentes.find((e) => e.personaje.toLowerCase() === a.personaje.toLowerCase()))
      .filter((e): e is CalendarioEntry => !!e);
    const newEntries = [...sorted, ...resto].map((e, i) => ({ ...e, orden: i }));
    setEntries(newEntries);
    fetch('/api/studio/calendario/entry', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ordenes: newEntries.map((e) => ({ id: e._id, orden: e.orden })) }),
    }).catch(() => {});
  }

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination) return;
      const visible = hideCompletados ? entries.filter((e) => !e.completado) : entries;
      const reordered = Array.from(visible);
      const [moved] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, moved);
      const hiddenCompleted = hideCompletados ? entries.filter((e) => e.completado) : [];
      const allNew = [...reordered, ...hiddenCompleted].map((e, i) => ({ ...e, orden: i }));
      setEntries(allNew);
      fetch('/api/studio/calendario/entry', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordenes: allNew.map((e) => ({ id: e._id, orden: e.orden })) }),
      }).catch(() => {});
    },
    [entries, hideCompletados]
  );

  async function handleToggleCompletado(entry: CalendarioEntry) {
    const entryId = entry._id ? String(entry._id) : null;
    if (!entryId) return;
    const next = !entry.completado;
    setEntries((prev) => prev.map((e) => (e._id === entryId ? { ...e, completado: next } : e)));
    try {
      const res = await fetch('/api/studio/calendario/entry', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, field: 'completado', value: next }),
      });
      if (!res.ok) {
        setEntries((prev) => prev.map((e) => (e._id === entryId ? { ...e, completado: entry.completado } : e)));
      }
    } catch {
      setEntries((prev) => prev.map((e) => (e._id === entryId ? { ...e, completado: entry.completado } : e)));
    }
  }

  function handleFechaSave(entryId: string) {
    const fecha = fechaInput ? new Date(fechaInput).toISOString() : null;
    setEntries((prev) => prev.map((e) => (e._id === entryId ? { ...e, fecha_publicacion: fecha } : e)));
    setEditingFecha(null);
    fetch('/api/studio/calendario/entry', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, field: 'fecha_publicacion', value: fecha }),
    }).catch(() => {});
  }

  async function handleAnalizar(entry: CalendarioEntry) {
    if (competenciaPanel === entry._id) {
      setCompetenciaPanel(null);
      return;
    }
    setCompetenciaPanel(entry._id);
    if (competenciaCache[entry._id]) return;
    setCompetenciaLoading(true);
    try {
      const res = await fetch('/api/studio/calendario/analizar-competencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaje: entry.personaje, entryId: entry._id }),
      });
      const data = (await res.json()) as CompetenciaResult;
      setCompetenciaCache((prev) => ({ ...prev, [entry._id]: data }));
      setEntries((prev) =>
        prev.map((e) =>
          e._id === entry._id
            ? {
                ...e,
                competencia_analysis: {
                  score_oportunidad: data.score_oportunidad,
                  angulo_unico: data.angulo_unico,
                  titulos_sugeridos: data.titulos_sugeridos,
                  analizado_en: new Date().toISOString(),
                },
              }
            : e
        )
      );
    } catch {}
    finally { setCompetenciaLoading(false); }
  }

  async function handleDelete(entry: CalendarioEntry) {
    if (!entry._id) return;
    setEntries((prev) => prev.filter((e) => e._id !== entry._id));
    try {
      await fetch('/api/studio/calendario/entry', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: entry._id }),
      });
    } catch {
      setEntries((prev) => {
        const exists = prev.find((e) => e._id === entry._id);
        if (exists) return prev;
        return [...prev, entry].sort((a, b) => a.orden - b.orden);
      });
    }
  }

  async function handleUsarTitulo(entry: CalendarioEntry, titulo: string) {
    setEntries((prev) => prev.map((e) => (e._id === entry._id ? { ...e, titulo } : e)));
    fetch('/api/studio/calendario/entry', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId: entry._id, field: 'titulo', value: titulo }),
    }).catch(() => {});
  }

  async function handleLimpiarTaxonomia() {
    setLimpiezaLoading(true);
    setError('');
    try {
      const res = await fetch('/api/studio/calendario/limpiar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apply: false }),
      });
      const data = (await res.json()) as { resultado?: LimpiezaResult; error?: string };
      if (!res.ok) { setError(data.error ?? 'Error analizando taxonomía'); return; }
      setLimpiezaResult(data.resultado!);
      setLimpiezaPanel(true);
    } catch {
      setError('Error conectando con el servidor');
    } finally {
      setLimpiezaLoading(false);
    }
  }

  async function handleAplicarLimpieza() {
    setLimpiezaLoading(true);
    setError('');
    try {
      const res = await fetch('/api/studio/calendario/limpiar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apply: true }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? 'Error aplicando limpieza'); return; }
      setLimpiezaPanel(false);
      setLimpiezaResult(null);
      await fetchCalendario();
    } catch {
      setError('Error conectando con el servidor');
    } finally {
      setLimpiezaLoading(false);
    }
  }

  const completados = entries.filter((e) => e.completado).length;
  const displayedEntries = hideCompletados ? entries.filter((e) => !e.completado) : entries;

  // Timeline: construir días del mes
  function buildTimelineDays(): Array<{ date: Date | null; entries: CalendarioEntry[] }> {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // 0=Lunes
    const days: Array<{ date: Date | null; entries: CalendarioEntry[] }> = [];
    for (let i = 0; i < startDow; i++) days.push({ date: null, entries: [] });
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dayEntries = entries.filter((e) => {
        if (!e.fecha_publicacion) return false;
        const fp = new Date(e.fecha_publicacion);
        return fp.getFullYear() === year && fp.getMonth() === month && fp.getDate() === d;
      });
      days.push({ date, entries: dayEntries });
    }
    while (days.length % 7 !== 0) days.push({ date: null, entries: [] });
    return days;
  }

  return (
    <StudioLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Calendario editorial</h1>
            {calendario && (
              <p className="text-gray-500 text-sm mt-1">
                Ideas del canal activo · generado el {formatFecha(calendario.generado_en)} · {completados}/{entries.length} vídeos enviados a producción
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {entries.length > 0 && (
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('lista')}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${viewMode === 'lista' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  ≡ Lista
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${viewMode === 'timeline' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  📅 Timeline
                </button>
              </div>
            )}
            {entries.some((e) => e.completado) && (
              <button
                onClick={() => setHideCompletados((h) => !h)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                  hideCompletados
                    ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {hideCompletados ? '↑ Mostrar creados' : '✓ Ocultar creados'}
              </button>
            )}
            {entries.length > 0 && (
              <button
                onClick={handleDetectarAniversarios}
                disabled={loadingAniversarios}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-600/80 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loadingAniversarios ? <SpinIcon /> : '🗓'}
                {loadingAniversarios ? 'Detectando...' : 'Aniversarios'}
              </button>
            )}
            {entries.length > 0 && (
              <button
                onClick={handleLimpiarTaxonomia}
                disabled={limpiezaLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-sky-600/70 hover:bg-sky-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {limpiezaLoading ? <SpinIcon /> : (
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {limpiezaLoading ? 'Analizando...' : 'Limpiar taxonomía'}
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {generating && <SpinIcon />}
              {generating ? 'Generando con Claude...' : calendario ? 'Añadir más' : 'Generar calendario'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
        )}

        {/* Banner aniversarios */}
        {aniversarios.length > 0 && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-amber-400 font-semibold text-sm mb-2">🗓 Aniversarios próximos (60 días)</p>
                <ul className="space-y-1">
                  {aniversarios
                    .slice()
                    .sort((a, b) => a.dias_restantes - b.dias_restantes)
                    .map((a, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full border shrink-0 ${
                            a.urgencia === 'alta'
                              ? 'text-red-400 bg-red-500/10 border-red-500/25'
                              : 'text-amber-400 bg-amber-500/10 border-amber-500/25'
                          }`}
                        >
                          {a.dias_restantes}d
                        </span>
                        <span className="truncate">{formatFecha(a.fecha)} — {a.descripcion}</span>
                      </li>
                    ))}
                </ul>
              </div>
              <button
                onClick={handleProgramarAniversarios}
                className="shrink-0 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Programar primero
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && !calendario && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Sin calendario</p>
              <p className="text-gray-500 text-sm mt-1">Genera un calendario editorial de 30 vídeos con Claude</p>
            </div>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <>
            {/* Progreso */}
            <div className="mb-6 p-4 bg-white/[0.02] border border-white/8 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{completados} de {entries.length} publicados</span>
                <span className="text-sm font-medium text-white">{Math.round((completados / entries.length) * 100)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${(completados / entries.length) * 100}%` }}
                />
              </div>
            </div>

            {viewMode === 'lista' ? (
              <>
                {/* Leyenda categorías — dinámica */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {[...new Set(entries.map((e) => e.categoria))].map((cat) => (
                    <span key={cat} className={`text-xs px-2 py-0.5 rounded-full border ${hashCategoryColor(cat)}`}>
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Tabla drag-and-drop */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="calendario">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1.5">
                        {displayedEntries.map((entry, index) => (
                          <Draggable key={entry._id} draggableId={entry._id} index={index}>
                            {(drag, snapshot) => (
                              <div
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                className={`rounded-xl border transition-all ${
                                  entry.completado
                                    ? 'border-emerald-500/15 bg-emerald-500/5'
                                    : snapshot.isDragging
                                    ? 'border-violet-500/40 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                                    : 'border-white/8 bg-white/[0.02] hover:border-white/15'
                                }`}
                              >
                                <div className="flex items-center gap-3 px-4 py-3">
                                  {/* Drag handle */}
                                  <div
                                    {...drag.dragHandleProps}
                                    className="text-gray-700 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                    </svg>
                                  </div>

                                  {/* Semana */}
                                  <div className="w-16 shrink-0 text-center">
                                    <span className="text-xs font-mono text-gray-500">S{entry.semana}</span>
                                    <p className="text-xs text-gray-700 mt-0.5 leading-tight">{semanaToFecha(entry.semana)}</p>
                                  </div>

                                  {/* Contenido principal */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-white text-sm truncate">{entry.personaje}</span>
                                      <span className={`text-xs px-1.5 py-0.5 rounded-full border shrink-0 ${hashCategoryColor(entry.categoria)}`}>
                                        {entry.categoria}
                                      </span>
                                      <span
                                        className={`text-xs px-1.5 py-0.5 rounded-full border shrink-0 ${
                                          entry.busquedas === 'alto'
                                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                                            : 'text-gray-400 bg-gray-500/10 border-gray-500/20'
                                        }`}
                                      >
                                        {entry.busquedas === 'alto' ? '↑ Alto' : '→ Medio'}
                                      </span>
                                      {entry.aniversario && (
                                        <span className="text-xs px-1.5 py-0.5 rounded-full border text-amber-400 bg-amber-500/10 border-amber-500/25 shrink-0" title={entry.aniversario.descripcion}>
                                          🗓 Aniversario
                                        </span>
                                      )}
                                      {entry.competencia_analysis && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full border shrink-0 ${scoreColor(entry.competencia_analysis.score_oportunidad)}`}>
                                          {entry.competencia_analysis.score_oportunidad}/100
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 leading-snug line-clamp-1">{entry.titulo}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">{entry.epoca}</p>
                                  </div>

                                  {/* Fecha publicación */}
                                  <div className="shrink-0 text-right min-w-[120px]">
                                    {editingFecha === entry._id ? (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="date"
                                          value={fechaInput}
                                          onChange={(e) => setFechaInput(e.target.value)}
                                          className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none [color-scheme:dark] w-32"
                                          autoFocus
                                        />
                                        <button onClick={() => handleFechaSave(entry._id)} className="p-1 text-emerald-400 hover:text-emerald-300">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                                          </svg>
                                        </button>
                                        <button onClick={() => setEditingFecha(null)} className="p-1 text-gray-600 hover:text-gray-400">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    ) : entry.fecha_publicacion ? (
                                      <button
                                        onClick={() => {
                                          setEditingFecha(entry._id);
                                          setFechaInput(entry.fecha_publicacion!.split('T')[0]);
                                        }}
                                        className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                                      >
                                        📅 {formatFecha(entry.fecha_publicacion)}
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => { setEditingFecha(entry._id); setFechaInput(''); }}
                                        className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                                      >
                                        + Programar
                                      </button>
                                    )}
                                  </div>

                                  {/* Acciones */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      onClick={() => handleAnalizar(entry)}
                                      className={`px-3 py-1.5 border text-xs rounded-lg transition-colors whitespace-nowrap ${
                                        competenciaPanel === entry._id
                                          ? 'bg-blue-600/30 border-blue-500/40 text-blue-300'
                                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-blue-500/30 hover:text-blue-300'
                                      }`}
                                    >
                                      {competenciaPanel === entry._id && competenciaLoading ? '...' : '↔ Analizar'}
                                    </button>
                                    <Link
                                      href={pipelineTipo === 'musica_ambiental' ? '/studio/musica-ambiental/nuevo' : `/studio?personaje=${encodeURIComponent(entry.personaje)}&epoca=${encodeURIComponent(entry.epoca)}${entry.titulo ? `&titulo=${encodeURIComponent(entry.titulo)}` : ''}${(competenciaCache[entry._id]?.angulo_unico ?? entry.competencia_analysis?.angulo_unico) ? `&angulo=${encodeURIComponent(competenciaCache[entry._id]?.angulo_unico ?? entry.competencia_analysis?.angulo_unico ?? '')}` : ''}`}
                                      className="px-3 py-1.5 bg-violet-600/70 hover:bg-violet-600 text-white text-xs rounded-lg transition-colors whitespace-nowrap"
                                    >
                                      Guión
                                    </Link>
                                    <button
                                      onClick={() => handleToggleCompletado(entry)}
                                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                                        entry.completado
                                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                          : 'bg-white/5 border-white/10 text-gray-600 hover:border-emerald-500/30 hover:text-emerald-400'
                                      }`}
                                      title={entry.completado ? 'Marcar como pendiente' : 'Marcar como publicado'}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDelete(entry)}
                                      className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all bg-white/5 border-white/10 text-gray-600 hover:border-red-500/30 hover:text-red-400"
                                      title="Eliminar entrada"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>

                                {/* Panel competencia expandido */}
                                {competenciaPanel === entry._id && (
                                  <div className="border-t border-white/5 px-4 py-4 bg-blue-500/5">
                                    {competenciaLoading && !competenciaCache[entry._id] ? (
                                      <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <SpinIcon /> Analizando competencia con Claude...
                                      </div>
                                    ) : competenciaCache[entry._id] ? (
                                      <CompetenciaPanel
                                        data={competenciaCache[entry._id]}
                                        onUsarTitulo={(t) => handleUsarTitulo(entry, t)}
                                      />
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </>
            ) : (
              <TimelineView
                days={buildTimelineDays()}
                currentMonth={currentMonth}
                onPrevMonth={() =>
                  setCurrentMonth((m) => {
                    const d = new Date(m);
                    d.setMonth(d.getMonth() - 1);
                    return d;
                  })
                }
                onNextMonth={() =>
                  setCurrentMonth((m) => {
                    const d = new Date(m);
                    d.setMonth(d.getMonth() + 1);
                    return d;
                  })
                }
                canalNombre={canalNombre}
                pipelineTipo={pipelineTipo}
              />
            )}
          </>
        )}
      </div>

      {/* Modal limpieza taxonomía */}
      {limpiezaPanel && limpiezaResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <div>
                <h2 className="text-white font-semibold">Limpieza de taxonomía</h2>
                <p className="text-xs text-gray-500 mt-0.5">Preview de cambios — revisa antes de aplicar</p>
              </div>
              <button onClick={() => setLimpiezaPanel(false)} className="text-gray-600 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Categorías limpias */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                  Taxonomía normalizada — {limpiezaResult.categorias_limpias.length} categorías únicas
                </p>
                <div className="flex flex-wrap gap-2">
                  {limpiezaResult.categorias_limpias.map((cat) => (
                    <span key={cat} className={`text-xs px-2.5 py-1 rounded-full border ${hashCategoryColor(cat)}`}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resumen de cambios */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white/[0.02] border border-white/8 rounded-xl text-center">
                  <p className="text-2xl font-bold text-white">{limpiezaResult.entries_normalizadas.length}</p>
                  <p className="text-xs text-gray-500 mt-1">entradas normalizadas</p>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/8 rounded-xl text-center">
                  <p className="text-2xl font-bold text-white">{limpiezaResult.categorias_limpias.length}</p>
                  <p className="text-xs text-gray-500 mt-1">categorías únicas</p>
                </div>
                <div className={`p-3 border rounded-xl text-center ${
                  limpiezaResult.problemas_detectados.length > 0
                    ? 'bg-amber-500/8 border-amber-500/20'
                    : 'bg-emerald-500/8 border-emerald-500/20'
                }`}>
                  <p className={`text-2xl font-bold ${limpiezaResult.problemas_detectados.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {limpiezaResult.problemas_detectados.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">con problemas</p>
                </div>
              </div>

              {/* Entradas problemáticas */}
              {limpiezaResult.problemas_detectados.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                    Requieren revisión manual
                  </p>
                  <div className="space-y-2">
                    {limpiezaResult.problemas_detectados.map((p) => (
                      <div key={p._id} className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-white font-medium">{p.personaje}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 leading-snug">{p.problema}</p>
                            <p className="text-xs text-amber-400/80 mt-1">
                              → Categoría sugerida: <span className="font-medium">{p.categoria_sugerida}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {limpiezaResult.problemas_detectados.length === 0 && (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
                  <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-emerald-300">
                    Todas las entradas tienen entidades identificables. Sin problemas detectados.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/8">
              <p className="text-xs text-gray-600">
                Solo se actualizan las categorías. Personajes, títulos y fechas no cambian.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLimpiezaPanel(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAplicarLimpieza}
                  disabled={limpiezaLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {limpiezaLoading && <SpinIcon />}
                  Aplicar normalización
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudioLayout>
  );
}

// --- Sub-componentes ---

function CompetenciaPanel({
  data,
  onUsarTitulo,
}: {
  data: CompetenciaResult;
  onUsarTitulo: (t: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className={`text-sm font-semibold px-2 py-1 rounded-full border ${scoreColor(data.score_oportunidad)}`}>
          {data.score_oportunidad}/100 — {scoreLabel(data.score_oportunidad)}
        </span>
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ángulo único</p>
        <p className="text-sm text-blue-300">{data.angulo_unico}</p>
        {data.razon && <p className="text-xs text-gray-600 mt-1">{data.razon}</p>}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Títulos sugeridos — haz clic para usar</p>
        <div className="space-y-1">
          {data.titulos_sugeridos.map((t, i) => (
            <button
              key={i}
              onClick={() => onUsarTitulo(t)}
              className="block w-full text-left text-sm text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-violet-500/20 border border-white/8 hover:border-violet-500/30 transition-colors"
            >
              {t}
              <span className="text-xs text-gray-600 ml-2">← usar</span>
            </button>
          ))}
        </div>
      </div>
      {data.titulos_existentes.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Competencia existente</p>
          <ul className="space-y-0.5">
            {data.titulos_existentes.map((t, i) => (
              <li key={i} className="text-xs text-gray-600 pl-2">• {t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function TimelineView({
  days,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  canalNombre,
  pipelineTipo,
}: {
  days: Array<{ date: Date | null; entries: CalendarioEntry[] }>;
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  canalNombre: string;
  pipelineTipo: 'narrativo' | 'musica_ambiental';
}) {
  const monthLabel = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrevMonth} className="p-2 text-gray-400 hover:text-white transition-colors text-xl leading-none">
          ‹
        </button>
        <h2 className="text-white font-semibold capitalize">{monthLabel}</h2>
        <button onClick={onNextMonth} className="p-2 text-gray-400 hover:text-white transition-colors text-xl leading-none">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-center text-xs text-gray-600 py-1 font-medium">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, i) => {
          if (!cell.date) return <div key={i} className="min-h-[80px]" />;
          const isToday = cell.date.getTime() === today.getTime();
          const hasContent = cell.entries.length > 0;
          return (
            <div
              key={i}
              className={`min-h-[80px] rounded-lg border p-1 transition-colors ${
                isToday
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : hasContent
                  ? 'border-white/10 bg-white/[0.02]'
                  : 'border-red-500/10 bg-red-500/[0.03]'
              }`}
            >
              <div
                className={`text-xs mb-1 font-mono ${
                  isToday ? 'text-violet-400 font-bold' : hasContent ? 'text-gray-400' : 'text-red-900/60'
                }`}
              >
                {cell.date.getDate()}
              </div>
              {cell.entries.map((entry) => (
                <Link
                  key={entry._id}
                  href={pipelineTipo === 'musica_ambiental' ? '/studio/musica-ambiental/nuevo' : `/studio?personaje=${encodeURIComponent(entry.personaje)}&epoca=${encodeURIComponent(entry.epoca)}`}
                  className="block mb-1"
                >
                  <div className="text-xs bg-blue-600/30 border border-blue-500/30 rounded px-1 py-0.5 text-blue-300 truncate hover:bg-blue-600/50 transition-colors">
                    📹 {entry.personaje}
                  </div>
                </Link>
              ))}
              {!hasContent && (
                <div className="text-[10px] text-red-900/40 mt-0.5 text-center">—</div>
              )}
            </div>
          );
        })}
      </div>

      {canalNombre && (
        <p className="text-xs text-gray-700 text-center mt-4">
          {canalNombre} — días en rojo sin contenido programado
        </p>
      )}
    </div>
  );
}

function SpinIcon() {
  return (
    <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
