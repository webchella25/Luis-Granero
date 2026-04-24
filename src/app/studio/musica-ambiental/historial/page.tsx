'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import StudioLayout from '@/components/studio/StudioLayout';

interface VideoAmbiental {
  _id: string;
  mood: string;
  titulo: string;
  descripcion: string;
  imagen_path: string;
  musica_nombre: string;
  duracion_horas: number;
  efectos: string[];
  video_path: string | null;
  youtube_id: string | null;
  youtube_url: string | null;
  estado: 'pendiente' | 'generando_video' | 'listo' | 'error';
  error_msg: string | null;
  scheduled_at: string | null;
  creado_en: string;
}

type UploadState = 'idle' | 'loading' | 'done' | 'error';

function EstadoBadge({ estado }: { estado: VideoAmbiental['estado'] }) {
  const map: Record<string, { label: string; cls: string }> = {
    pendiente: { label: 'Pendiente', cls: 'text-gray-400 bg-white/5 border-white/10' },
    generando_video: { label: 'Generando...', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    listo: { label: 'Listo', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    error: { label: 'Error', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
  };
  const { label, cls } = map[estado] ?? map.pendiente;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>
  );
}

function formatDuracion(h: number) {
  return h === 1 ? '1 hora' : `${h} horas`;
}

export default function HistorialMusicaAmbientalPage() {
  const [videos, setVideos] = useState<VideoAmbiental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VideoAmbiental | null>(null);

  // Upload YouTube form state
  const [ytTitulo, setYtTitulo] = useState('');
  const [ytDesc, setYtDesc] = useState('');
  const [ytTags, setYtTags] = useState('');
  const [ytVisibilidad, setYtVisibilidad] = useState<'public' | 'unlisted' | 'private'>('unlisted');
  const [ytPublishAt, setYtPublishAt] = useState('');
  const [ytState, setYtState] = useState<UploadState>('idle');
  const [ytError, setYtError] = useState('');

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch('/api/studio/musica-ambiental');
      const data = await res.json() as { videos?: VideoAmbiental[] };
      if (data.videos) setVideos(data.videos);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchVideos]);

  function startPolling(id: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/studio/musica-ambiental/${id}`);
      const data = await res.json() as { video?: VideoAmbiental };
      if (!data.video) return;
      const v = data.video;
      setVideos((prev) => prev.map((x) => x._id === id ? v : x));
      setSelected((prev) => prev?._id === id ? v : prev);
      if (v.estado === 'listo' || v.estado === 'error') {
        clearInterval(pollRef.current!);
        pollRef.current = null;
      }
    }, 5000);
  }

  function selectVideo(v: VideoAmbiental) {
    setSelected(v);
    setYtTitulo(v.titulo);
    setYtDesc(v.descripcion);
    setYtTags('');
    setYtVisibilidad('unlisted');
    setYtPublishAt('');
    setYtState('idle');
    setYtError('');
    if (v.estado === 'generando_video') startPolling(v._id);
  }

  async function handleUploadYouTube(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setYtState('loading');
    setYtError('');
    try {
      const tags = ytTags.split(',').map((t) => t.trim()).filter(Boolean);
      const body: Record<string, unknown> = {
        titulo: ytTitulo.trim(),
        descripcion: ytDesc.trim(),
        tags,
        visibilidad: ytVisibilidad,
      };
      if (ytPublishAt) {
        body.publishAt = new Date(ytPublishAt).toISOString();
      }
      const res = await fetch(`/api/studio/musica-ambiental/${selected._id}/upload-youtube`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { status?: string; error?: string; youtube_url?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error subiendo');
      if (data.status === 'already_uploaded') {
        setYtState('done');
        return;
      }
      setYtState('done');
      // Poll para que aparezca youtube_url
      const pollYt = setInterval(async () => {
        const r = await fetch(`/api/studio/musica-ambiental/${selected._id}`);
        const d = await r.json() as { video?: VideoAmbiental };
        if (d.video?.youtube_url) {
          setVideos((prev) => prev.map((x) => x._id === selected._id ? d.video! : x));
          setSelected(d.video!);
          clearInterval(pollYt);
        }
      }, 8000);
    } catch (err) {
      setYtState('error');
      setYtError(err instanceof Error ? err.message : 'Error');
    }
  }

  return (
    <StudioLayout>
      <div className="flex h-screen overflow-hidden">
        {/* Lista */}
        <div className="w-80 shrink-0 border-r border-white/[0.06] overflow-y-auto">
          <div className="px-4 py-5 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <h1 className="text-sm font-bold text-white">Historial ambiental</h1>
              <Link
                href="/studio/musica-ambiental/nuevo"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Nuevo
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            </div>
          ) : videos.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-gray-600 text-sm">Sin vídeos aún</p>
              <Link href="/studio/musica-ambiental/nuevo" className="text-violet-400 text-xs hover:underline mt-2 block">
                Crear el primero
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {videos.map((v) => (
                <button
                  key={v._id}
                  onClick={() => selectVideo(v)}
                  className={`w-full px-4 py-3 text-left hover:bg-white/[0.03] transition-colors ${
                    selected?._id === v._id ? 'bg-violet-600/10 border-l-2 border-l-violet-500' : 'border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-white text-xs font-medium truncate flex-1">{v.titulo || v.mood}</p>
                    <EstadoBadge estado={v.estado} />
                  </div>
                  <p className="text-gray-600 text-[10px] truncate">{v.mood} · {formatDuracion(v.duracion_horas)}</p>
                  <p className="text-gray-700 text-[10px] mt-0.5">
                    {new Date(v.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Panel detalle */}
        <div className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-gray-600 text-sm">
              Selecciona un vídeo para ver el detalle
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
              {/* Cabecera */}
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <EstadoBadge estado={selected.estado} />
                    {selected.youtube_url && (
                      <a
                        href={selected.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-red-400 hover:underline"
                      >
                        Ver en YouTube
                      </a>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white">{selected.titulo || selected.mood}</h2>
                  <p className="text-gray-500 text-sm">{selected.mood} · {formatDuracion(selected.duracion_horas)}</p>
                </div>
              </div>

              {/* Imagen */}
              {selected.imagen_path && (
                <div className="rounded-xl overflow-hidden border border-white/8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/studio/musica-ambiental/imagen/${selected.imagen_path.split('/').pop()}`}
                    alt={selected.mood}
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}

              {/* Estado generación */}
              {selected.estado === 'generando_video' && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <svg className="w-5 h-5 text-amber-400 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <div>
                    <p className="text-amber-300 text-sm font-medium">Generando vídeo con FFmpeg</p>
                    <p className="text-amber-500 text-xs">Este proceso puede tardar varios minutos según la duración</p>
                  </div>
                </div>
              )}

              {selected.estado === 'error' && selected.error_msg && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-300 text-sm font-medium mb-1">Error en la generación</p>
                  <p className="text-red-400 text-xs font-mono">{selected.error_msg}</p>
                </div>
              )}

              {/* Vídeo listo */}
              {selected.estado === 'listo' && selected.video_path && (
                <div className="space-y-3">
                  <video
                    src={selected.video_path}
                    controls
                    className="w-full rounded-xl border border-white/8"
                  />
                </div>
              )}

              {/* Detalles */}
              <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Música</span>
                  <span className="text-gray-300">{selected.musica_nombre || '—'}</span>
                </div>
                {selected.efectos.length > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Efectos</span>
                    <span className="text-gray-300">{selected.efectos.join(', ')}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Creado</span>
                  <span className="text-gray-300">
                    {new Date(selected.creado_en).toLocaleString('es-ES')}
                  </span>
                </div>
              </div>

              {/* Upload YouTube */}
              {selected.estado === 'listo' && !selected.youtube_id && (
                <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">Subir a YouTube</h3>
                  <form onSubmit={handleUploadYouTube} className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Título</label>
                      <input
                        type="text"
                        value={ytTitulo}
                        onChange={(e) => setYtTitulo(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Descripción</label>
                      <textarea
                        value={ytDesc}
                        onChange={(e) => setYtDesc(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tags (separados por coma)</label>
                      <input
                        type="text"
                        value={ytTags}
                        onChange={(e) => setYtTags(e.target.value)}
                        placeholder="lofi, música ambiental, estudio..."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Visibilidad</label>
                        <select
                          value={ytVisibilidad}
                          onChange={(e) => setYtVisibilidad(e.target.value as typeof ytVisibilidad)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                        >
                          <option value="unlisted">No listado</option>
                          <option value="public">Público</option>
                          <option value="private">Privado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Programar (opcional)</label>
                        <input
                          type="datetime-local"
                          value={ytPublishAt}
                          onChange={(e) => setYtPublishAt(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>

                    {ytError && <p className="text-red-400 text-xs">{ytError}</p>}

                    <button
                      type="submit"
                      disabled={ytState === 'loading'}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {ytState === 'loading' ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Subiendo...
                        </>
                      ) : ytState === 'done' ? (
                        '✓ Subida iniciada — procesando'
                      ) : (
                        'Subir a YouTube'
                      )}
                    </button>
                  </form>
                </div>
              )}

              {selected.youtube_id && (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-emerald-300 text-sm font-medium">Publicado en YouTube</p>
                    {selected.youtube_url && (
                      <a href={selected.youtube_url} target="_blank" rel="noopener noreferrer"
                        className="text-emerald-500 text-xs hover:underline">
                        {selected.youtube_url}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
