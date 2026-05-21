'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import StudioLayout from '@/components/studio/StudioLayout';

interface DjSession {
  _id: string;
  titulo: string;
  descripcion: string;
  audio_original_name: string;
  audio_size: number;
  audio_duration: number;
  cover_image_uploaded?: boolean;
  cover_image_original_name?: string | null;
  cover_image_mime_type?: string | null;
  cover_image_size?: number;
  visual_mode: 'static_cover' | 'video_loop' | 'generated_visual';
  visual_prompt: string;
  visual_status: 'idle' | 'generating' | 'ready' | 'error';
  visual_error: string | null;
  visual_provider_attempted?: string | null;
  visual_fallback_reason?: string | null;
  visual_provider_attempts?: Array<{
    provider: string;
    endpoint?: string | null;
    model?: string | null;
    status?: number | null;
    error: string;
    supported?: boolean;
  }>;
  visual_output_kind?: 'image' | 'video' | null;
  visual_generation_type?: 'native_video' | 'image_to_loop' | 'static_image' | null;
  visual_video_original_name: string | null;
  visual_video_size: number;
  visual_video_duration: number;
  visual_generated_at: string | null;
  visual_provider?: string | null;
  visual_workflow?: string | null;
  visual_model?: string | null;
  video_path: string | null;
  video_size?: number;
  video_duration?: number;
  video_generated_at?: string | null;
  render_overlays?: boolean;
  youtube_url: string | null;
  youtube_upload_bytes_sent?: number;
  youtube_upload_total_bytes?: number;
  youtube_upload_error?: string | null;
  youtube_upload_attempts?: number;
  youtube_uploaded_at?: string | null;
  estado: 'pendiente' | 'queued' | 'audio_subido' | 'generando_video' | 'generating_video' | 'listo' | 'video_ready' | 'render_failed' | 'publicando' | 'publishing_youtube' | 'youtube_failed' | 'publicado' | 'published' | 'error';
  progreso: number;
  error: string | null;
  render_error?: string | null;
  tracklist: string;
  bpm: number | null;
  genre: string;
  output_format: '16:9' | '9:16' | '1:1';
  tags: string[];
  visibility: 'public' | 'unlisted' | 'private';
  scheduled_at: string | null;
  created_at: string;
}

function formatDuration(seconds: number): string {
  if (!seconds) return '--:--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
  if (!bytes) return '0 MB';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function EstadoBadge({ estado }: { estado: DjSession['estado'] }) {
  const map: Record<DjSession['estado'], { label: string; cls: string }> = {
    pendiente: { label: 'Pendiente', cls: 'text-gray-400 bg-white/5 border-white/10' },
    queued: { label: 'En cola', cls: 'text-gray-400 bg-white/5 border-white/10' },
    audio_subido: { label: 'Audio subido', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    generando_video: { label: 'Generando', cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    generating_video: { label: 'Generando', cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    listo: { label: 'Listo', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    video_ready: { label: 'Vídeo listo', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    render_failed: { label: 'Render fallido', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
    publicando: { label: 'Publicando', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    publishing_youtube: { label: 'Publicando', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    youtube_failed: { label: 'YouTube falló', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
    publicado: { label: 'Publicado', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    published: { label: 'Publicado', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    error: { label: 'Error', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
  };
  const item = map[estado];
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${item.cls}`}>{item.label}</span>;
}

export default function HistorialDjSessionsPage() {
  const [sessions, setSessions] = useState<DjSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DjSession | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [visualGeneratingId, setVisualGeneratingId] = useState<string | null>(null);
  const [visualUploadingId, setVisualUploadingId] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState('');
  const [publishError, setPublishError] = useState('');
  const [visualError, setVisualError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTargetRef = useRef<'render' | 'publish' | 'visual' | null>(null);
  const visualFileRef = useRef<HTMLInputElement | null>(null);
  const coverImageFileRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/studio/dj-sessions');
      const data = (await res.json()) as { sessions?: DjSession[] };
      if (data.sessions) {
        setSessions(data.sessions);
        setSelected((prev) => prev ?? data.sessions?.[0] ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function syncSession(next: DjSession) {
    setSessions((prev) => prev.map((item) => item._id === next._id ? next : item));
    setSelected((prev) => prev?._id === next._id ? next : prev);
  }

  function startPolling(id: string, target: 'render' | 'publish' | 'visual') {
    pollTargetRef.current = target;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/studio/dj-sessions/${id}`);
      const data = (await res.json()) as { session?: DjSession };
      if (!data.session) return;
      syncSession(data.session);
      const targetNow = pollTargetRef.current;
      const shouldStop =
        (targetNow === 'render' && (
          data.session.estado === 'video_ready' ||
          data.session.estado === 'listo' ||
          data.session.estado === 'render_failed' ||
          data.session.estado === 'error'
        )) ||
        (targetNow === 'publish' && (
          data.session.estado === 'published' ||
          data.session.estado === 'publicado' ||
          data.session.estado === 'youtube_failed' ||
          data.session.estado === 'error'
        )) ||
        (targetNow === 'visual' && (
          data.session.visual_status === 'ready' ||
          data.session.visual_status === 'error'
        ));

      if (shouldStop) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        setGeneratingId(null);
        setPublishingId(null);
        setVisualGeneratingId(null);
        pollTargetRef.current = null;
      }
    }, 5000);
  }

  async function generateVideo(id: string, regenerate = false) {
    setGeneratingId(id);
    setGenerateError('');
    setPublishError('');
    try {
      const res = await fetch(`/api/studio/dj-sessions/${id}/generate-video`, {
        method: 'POST',
        headers: regenerate ? { 'Content-Type': 'application/json' } : undefined,
        body: regenerate ? JSON.stringify({ regenerate: true }) : undefined,
      });
      const data = (await res.json()) as { error?: string; status?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error iniciando generación');
      setSessions((prev) => prev.map((item) => item._id === id ? { ...item, estado: 'generating_video', progreso: 20, error: null, render_error: null } : item));
      setSelected((prev) => prev?._id === id ? { ...prev, estado: 'generating_video', progreso: 20, error: null, render_error: null } : prev);
      startPolling(id, 'render');
    } catch (err) {
      setGeneratingId(null);
      setGenerateError(err instanceof Error ? err.message : 'Error iniciando generación');
    }
  }

  async function publishYouTube(id: string) {
    setPublishingId(id);
    setPublishError('');
    setGenerateError('');
    try {
      const res = await fetch(`/api/studio/dj-sessions/${id}/publish-youtube`, { method: 'POST' });
      const data = (await res.json()) as { error?: string; status?: string; youtube_url?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error iniciando publicación');
      if (data.status === 'already_published') {
        setSelected((prev) => prev?._id === id ? { ...prev, youtube_url: data.youtube_url ?? prev.youtube_url, estado: 'published' } : prev);
        setSessions((prev) => prev.map((item) => item._id === id ? { ...item, youtube_url: data.youtube_url ?? item.youtube_url, estado: 'published' } : item));
        setPublishingId(null);
        return;
      }
      setSessions((prev) => prev.map((item) => item._id === id ? { ...item, estado: 'publishing_youtube', progreso: 25, error: null, youtube_upload_error: null } : item));
      setSelected((prev) => prev?._id === id ? { ...prev, estado: 'publishing_youtube', progreso: 25, error: null, youtube_upload_error: null } : prev);
      startPolling(id, 'publish');
    } catch (err) {
      setPublishingId(null);
      setPublishError(err instanceof Error ? err.message : 'Error iniciando publicación');
    }
  }

  async function updateVisualMode(id: string, visual_mode: DjSession['visual_mode']) {
    setVisualError('');
    const res = await fetch(`/api/studio/dj-sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visual_mode }),
    });
    const data = (await res.json()) as { error?: string; session?: DjSession };
    if (!res.ok) throw new Error(data.error ?? 'Error actualizando modo visual');
    if (data.session) syncSession(data.session);
  }

  async function updateOutputFormat(id: string, output_format: DjSession['output_format']) {
    setGenerateError('');
    const res = await fetch(`/api/studio/dj-sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ output_format }),
    });
    const data = (await res.json()) as { error?: string; session?: DjSession };
    if (!res.ok) throw new Error(data.error ?? 'Error actualizando formato');
    if (data.session) syncSession(data.session);
  }

  async function updateRenderOverlays(id: string, render_overlays: boolean) {
    setGenerateError('');
    const res = await fetch(`/api/studio/dj-sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ render_overlays }),
    });
    const data = (await res.json()) as { error?: string; session?: DjSession };
    if (!res.ok) throw new Error(data.error ?? 'Error actualizando overlays');
    if (data.session) syncSession(data.session);
  }

  async function generateVisual(id: string) {
    setVisualGeneratingId(id);
    setVisualError('');
    try {
      const res = await fetch(`/api/studio/dj-sessions/${id}/generate-visual`, {
        method: 'POST',
      });
      const data = (await res.json()) as { error?: string; status?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error iniciando generación visual');
      setSessions((prev) => prev.map((item) => item._id === id ? { ...item, visual_status: 'generating', visual_error: null } : item));
      setSelected((prev) => prev?._id === id ? { ...prev, visual_status: 'generating', visual_error: null } : prev);
      startPolling(id, 'visual');
    } catch (err) {
      setVisualGeneratingId(null);
      setVisualError(err instanceof Error ? err.message : 'Error iniciando generación visual');
    }
  }

  async function uploadVisualVideo(id: string, file: File) {
    setVisualUploadingId(id);
      setVisualError('');
    try {
      const fd = new FormData();
      fd.append('visual_video', file);
      const res = await fetch(`/api/studio/dj-sessions/${id}/visual-video`, {
        method: 'POST',
        body: fd,
      });
      const data = (await res.json()) as { error?: string; session?: DjSession };
      if (!res.ok) throw new Error(data.error ?? 'Error subiendo el loop visual');
      if (data.session) syncSession(data.session);
    } catch (err) {
      setVisualError(err instanceof Error ? err.message : 'Error subiendo el loop visual');
    } finally {
      setVisualUploadingId(null);
    }
  }

  async function uploadCoverImage(id: string, file: File) {
    setVisualUploadingId(id);
    setVisualError('');
    try {
      const name = file.name.toLowerCase();
      const isAllowed = ['.jpg', '.jpeg', '.png', '.webp'].some((ext) => name.endsWith(ext)) ||
        ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      if (!isAllowed) throw new Error('Formato de imagen no soportado. Usa JPG, PNG o WEBP.');
      if (file.size > 20 * 1024 * 1024) throw new Error('La imagen es demasiado grande. Máximo 20 MB.');

      const fd = new FormData();
      fd.append('cover_image', file);
      const res = await fetch(`/api/studio/dj-sessions/${id}/visual-image`, {
        method: 'POST',
        body: fd,
      });
      const data = (await res.json()) as { error?: string; session?: DjSession };
      if (!res.ok) throw new Error(data.error ?? 'Error subiendo la imagen visual');
      if (data.session) syncSession(data.session);
    } catch (err) {
      setVisualError(err instanceof Error ? err.message : 'Error subiendo la imagen visual');
    } finally {
      setVisualUploadingId(null);
    }
  }

  async function deleteCoverImage(id: string) {
    setVisualUploadingId(id);
    setVisualError('');
    try {
      const res = await fetch(`/api/studio/dj-sessions/${id}/visual-image`, { method: 'DELETE' });
      const data = (await res.json()) as { error?: string; session?: DjSession };
      if (!res.ok) throw new Error(data.error ?? 'Error eliminando la imagen visual');
      if (data.session) syncSession(data.session);
    } catch (err) {
      setVisualError(err instanceof Error ? err.message : 'Error eliminando la imagen visual');
    } finally {
      setVisualUploadingId(null);
    }
  }

  async function deleteSession(id: string) {
    if (!confirm('¿Eliminar esta sesión y sus archivos?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/studio/dj-sessions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions((prev) => prev.filter((item) => item._id !== id));
        setSelected((prev) => prev?._id === id ? null : prev);
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-white">Sesiones DJ</h1>
            <p className="text-gray-500 text-sm mt-1">Historial de sesiones subidas al canal activo</p>
          </div>
          <Link
            href="/studio/dj-sessions/nuevo"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Subir sesión
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500 text-sm">No hay sesiones todavía</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {sessions.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setSelected(item)}
                    className={`w-full text-left px-5 py-4 hover:bg-white/[0.04] transition-colors ${
                      selected?._id === item._id ? 'bg-amber-500/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{item.titulo}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDuration(item.audio_duration)} · {formatSize(item.audio_size)}
                        </p>
                      </div>
                      <EstadoBadge estado={item.estado} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/[0.03] border border-white/8 rounded-2xl min-h-[520px]">
            {!selected ? (
              <div className="flex items-center justify-center h-full min-h-[360px] text-gray-600 text-sm">
                Selecciona una sesión
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">{selected.titulo}</h2>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(selected.created_at).toLocaleString('es-ES')} · {selected.visibility}
                    </p>
                  </div>
                  <EstadoBadge estado={selected.estado} />
                </div>

                <audio controls src={`/api/studio/dj-sessions/${selected._id}/audio`} className="w-full h-10" />

                <section className="rounded-2xl bg-white/[0.04] border border-white/8 p-4 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Visual</h3>
                      <p className="text-sm text-gray-300 mt-1">Prioridad al montar: imagen propia, imagen IA, loop/manual.</p>
                      {selected.cover_image_uploaded && (
                        <p className="text-xs text-emerald-300 mt-1">Usando imagen visual propia como base animada</p>
                      )}
                      {selected.visual_generation_type === 'native_video' && (
                        <p className="text-xs text-cyan-300 mt-1">Visual IA generado como vídeo nativo</p>
                      )}
                      {selected.visual_generation_type === 'image_to_loop' && (
                        <p className="text-xs text-cyan-300 mt-1">Visual IA generado como imagen animada</p>
                      )}
                      {selected.visual_generation_type === 'static_image' && selected.visual_provider && (
                        <p className="text-xs text-gray-400 mt-1">Visual IA generado como imagen estática</p>
                      )}
                      {selected.visual_fallback_reason && (
                        <p className="text-xs text-amber-300 mt-1 whitespace-pre-wrap">{selected.visual_fallback_reason}</p>
                      )}
                      {selected.visual_provider && selected.visual_workflow && (
                        <p className="text-xs text-gray-400 mt-1">
                          {selected.visual_provider === 'huggingface_video'
                            ? 'Hugging Face Video'
                            : selected.visual_provider === 'comfyui'
                              ? 'ComfyUI'
                              : selected.visual_provider === 'huggingface'
                                ? 'HuggingFace FLUX'
                                : selected.visual_provider === 'freepik'
                                  ? 'Freepik'
                                  : selected.visual_provider}
                          {selected.visual_model ? ` · ${selected.visual_model}` : ''}
                          {' · '}
                          {selected.visual_workflow}
                        </p>
                      )}
                      {selected.visual_provider_attempted && (
                        <p className="text-[11px] text-gray-500 mt-1">Proveedor intentado: {selected.visual_provider_attempted}</p>
                      )}
                      {selected.visual_provider_attempts && selected.visual_provider_attempts.length > 0 && (
                        <div className="mt-2 space-y-1 text-[11px] text-gray-500">
                          <p className="uppercase tracking-wider text-gray-600">Intentos visuales</p>
                          {selected.visual_provider_attempts.map((attempt, idx) => (
                            <p key={`${attempt.provider}-${idx}`} className="whitespace-pre-wrap">
                              {attempt.provider}
                              {attempt.model ? ` · ${attempt.model}` : ''}
                              {attempt.endpoint ? ` · ${attempt.endpoint}` : ''}
                              {attempt.supported === false ? ' · no soportado' : ''}
                              {attempt.error ? ` · ${attempt.error}` : ''}
                            </p>
                          ))}
                        </div>
                      )}
                      {selected.visual_status === 'generating' && (
                        <p className="text-xs text-cyan-300 mt-1">Generando visual IA...</p>
                      )}
                        {selected.visual_status === 'error' && selected.visual_error && (
                          <p className="text-xs text-red-300 mt-1 whitespace-pre-wrap">{selected.visual_error}</p>
                        )}
                      </div>
                    <label className="text-xs text-gray-500">
                      Modo visual
                      <select
                        value={selected.visual_mode}
                        onChange={(e) => updateVisualMode(selected._id, e.target.value as DjSession['visual_mode']).catch((err) => setVisualError(err instanceof Error ? err.message : 'Error actualizando modo visual'))}
                        className="mt-1 w-full md:w-56 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm"
                      >
                        <option value="static_cover">Portada fija</option>
                        <option value="video_loop">Vídeo en bucle</option>
                        <option value="generated_visual">Visual generado</option>
                      </select>
                    </label>
                  </div>
                  <label className="block text-xs text-gray-500">
                    Formato de salida
                    <select
                      value={selected.output_format || '16:9'}
                      onChange={(e) => updateOutputFormat(selected._id, e.target.value as DjSession['output_format']).catch((err) => setGenerateError(err instanceof Error ? err.message : 'Error actualizando formato'))}
                      className="mt-1 w-full md:w-56 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm"
                    >
                      <option value="16:9">16:9 · YouTube / SoundCloud</option>
                      <option value="9:16">9:16 · Shorts / Reels</option>
                      <option value="1:1">1:1 · Instagram feed</option>
                    </select>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-xs text-gray-400">
                    <input
                      type="checkbox"
                      checked={selected.render_overlays === true}
                      onChange={(e) => updateRenderOverlays(selected._id, e.target.checked).catch((err) => setGenerateError(err instanceof Error ? err.message : 'Error actualizando overlays'))}
                      className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black text-amber-500"
                    />
                    <span>
                      <span className="block font-semibold text-gray-300">Renderizar overlays</span>
                      <span className="block mt-1">Desactivado por defecto. Si está apagado, el vídeo final sale limpio: solo loop visual y audio.</span>
                    </span>
                  </label>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={coverImageFileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadCoverImage(selected._id, file);
                        e.currentTarget.value = '';
                      }}
                    />
                    <input
                      ref={visualFileRef}
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadVisualVideo(selected._id, file);
                        e.currentTarget.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => coverImageFileRef.current?.click()}
                      disabled={visualUploadingId === selected._id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      {selected.cover_image_uploaded ? 'Cambiar imagen base' : 'Subir imagen base'}
                    </button>
                    {selected.cover_image_uploaded && (
                      <button
                        type="button"
                        onClick={() => deleteCoverImage(selected._id)}
                        disabled={visualUploadingId === selected._id}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/15 disabled:opacity-50 border border-red-500/20 text-red-300 text-sm font-semibold rounded-xl transition-colors"
                      >
                        Eliminar imagen base
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => visualFileRef.current?.click()}
                      disabled={visualUploadingId === selected._id}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      {visualUploadingId === selected._id ? 'Subiendo loop...' : 'Subir vídeo visual'}
                    </button>
                    <button
                      type="button"
                      onClick={() => generateVisual(selected._id)}
                      disabled={visualGeneratingId === selected._id || selected.visual_status === 'generating'}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      {visualGeneratingId === selected._id || selected.visual_status === 'generating' ? 'Generando visual...' : 'Generar visual IA'}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateVisualMode(selected._id, 'static_cover').catch((err) => setVisualError(err instanceof Error ? err.message : 'Error actualizando modo visual'))}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      Usar portada fija
                    </button>
                    <p className="text-xs text-gray-500">Imagen: JPG, PNG, WEBP hasta 20 MB. Loop: MP4, MOV o WEBM hasta 500 MB.</p>
                  </div>

                  {selected.cover_image_uploaded && (
                    <div className="space-y-2">
                      <img
                        src={`/api/studio/dj-sessions/${selected._id}/visual-image?v=${encodeURIComponent(selected.cover_image_original_name || selected.cover_image_size || selected._id)}`}
                        alt={`Imagen visual propia de ${selected.titulo}`}
                        className="w-full rounded-xl border border-white/10 bg-black object-cover"
                      />
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>Imagen propia</span>
                        {selected.cover_image_original_name && <><span>·</span><span>{selected.cover_image_original_name}</span></>}
                        {!!selected.cover_image_size && <><span>·</span><span>{formatSize(selected.cover_image_size)}</span></>}
                      </div>
                    </div>
                  )}

                  {selected.visual_video_original_name && (
                    <div className="space-y-2">
                      <video controls loop src={`/api/studio/dj-sessions/${selected._id}/visual-video`} className="w-full rounded-xl border border-white/10 bg-black" />
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>
                          {selected.visual_provider === 'huggingface_video'
                            ? 'Hugging Face Video'
                            : selected.visual_provider === 'comfyui'
                              ? 'ComfyUI'
                              : selected.visual_provider === 'manual'
                                ? 'Subida manual'
                                : selected.visual_provider ?? 'Visual'}
                        </span>
                        {selected.visual_model && (
                          <>
                            <span>·</span>
                            <span>{selected.visual_model}</span>
                          </>
                        )}
                        <span>{selected.visual_video_original_name}</span>
                        <span>·</span>
                        <span>{formatSize(selected.visual_video_size || 0)}</span>
                        <span>·</span>
                        <span>{formatDuration(selected.visual_video_duration || 0)}</span>
                        <span>·</span>
                        <span>{selected.visual_generated_at ? new Date(selected.visual_generated_at).toLocaleDateString('es-ES') : '-'}</span>
                      </div>
                    </div>
                  )}

                  {!selected.cover_image_uploaded && !selected.visual_video_original_name && selected.visual_output_kind === 'image' && selected.visual_provider && (
                    <div className="space-y-2">
                      <img
                        src={`/api/studio/dj-sessions/${selected._id}/visual-image`}
                        alt="Visual generado"
                        className="w-full rounded-xl border border-white/10 bg-black object-cover"
                      />
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        {selected.visual_provider && (
                          <span>
                            {selected.visual_provider === 'huggingface_video'
                              ? 'Hugging Face Video'
                              : selected.visual_provider === 'comfyui'
                                ? 'ComfyUI'
                                : selected.visual_provider === 'huggingface'
                                  ? 'HuggingFace FLUX'
                              : selected.visual_provider === 'freepik'
                                ? 'Freepik'
                                : selected.visual_provider}
                          </span>
                        )}
                        {selected.visual_model && <><span>·</span><span>{selected.visual_model}</span></>}
                        {selected.visual_provider_attempted && <><span>·</span><span>Intentado: {selected.visual_provider_attempted}</span></>}
                        {selected.visual_workflow && <span>· {selected.visual_workflow}</span>}
                        {selected.visual_generated_at && <span>· {new Date(selected.visual_generated_at).toLocaleDateString('es-ES')}</span>}
                      </div>
                    </div>
                  )}

                  {selected.visual_mode === 'static_cover' && (!selected.visual_provider || selected.visual_provider === 'manual') && (
                    <p className="text-xs text-gray-500">Si no hay loop visual, se usará portada fija o fondo negro.</p>
                  )}
                </section>

                {selected.video_path && (
                  <div className="space-y-2">
                    <video controls src={selected.video_path} className="w-full rounded-xl border border-white/10 bg-black" />
                    <p className="text-xs text-emerald-400">Vídeo generado</p>
                  </div>
                )}

                {(selected.estado === 'generating_video' || selected.estado === 'generando_video') && (
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-cyan-300">Generando vídeo</p>
                      <p className="text-xs text-cyan-400">{selected.progreso}%</p>
                    </div>
                    <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                      <div className="h-full bg-cyan-400 transition-all" style={{ width: `${Math.max(5, selected.progreso)}%` }} />
                    </div>
                  </div>
                )}

                {selected.estado === 'render_failed' && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                    <p className="text-sm font-medium text-red-300">La generación de vídeo falló</p>
                    <p className="text-xs text-red-200/80 mt-1 whitespace-pre-wrap">
                      {selected.render_error || selected.error || 'Error desconocido durante FFmpeg'}
                    </p>
                  </div>
                )}

                {(selected.estado === 'publishing_youtube' || selected.estado === 'publicando') && (
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-blue-300">Publicando en YouTube</p>
                      <p className="text-xs text-blue-400">{selected.progreso}%</p>
                    </div>
                    <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                      <div className="h-full bg-blue-400 transition-all" style={{ width: `${Math.max(10, selected.progreso)}%` }} />
                    </div>
                    {!!selected.youtube_upload_total_bytes && (
                      <p className="text-xs text-blue-200/70 mt-2">
                        {formatSize(selected.youtube_upload_bytes_sent || 0)} / {formatSize(selected.youtube_upload_total_bytes)}
                      </p>
                    )}
                  </div>
                )}

                {selected.estado === 'youtube_failed' && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                    <p className="text-sm font-medium text-red-300">La publicación en YouTube falló</p>
                    <p className="text-xs text-red-200/80 mt-1 whitespace-pre-wrap">
                      {selected.youtube_upload_error || selected.error || 'Error desconocido durante la subida a YouTube'}
                    </p>
                    {!!selected.youtube_upload_total_bytes && (
                      <p className="text-xs text-red-200/70 mt-2">
                        Subido: {formatSize(selected.youtube_upload_bytes_sent || 0)} / {formatSize(selected.youtube_upload_total_bytes)}
                      </p>
                    )}
                  </div>
                )}

                {selected.youtube_url && (
                  <a
                    href={selected.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300 hover:bg-emerald-500/15 transition-colors"
                  >
                    Abrir publicación en YouTube
                  </a>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-white/[0.04] border border-white/8 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">Duración</p>
                    <p className="text-sm text-white mt-1">{formatDuration(selected.audio_duration)}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/8 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">Tamaño</p>
                    <p className="text-sm text-white mt-1">{formatSize(selected.audio_size)}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/8 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">Género</p>
                    <p className="text-sm text-white mt-1">{selected.genre || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/8 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">BPM</p>
                    <p className="text-sm text-white mt-1">{selected.bpm ?? '-'}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/8 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">Formato</p>
                    <p className="text-sm text-white mt-1">{selected.output_format || '16:9'}</p>
                  </div>
                </div>

                {selected.video_path && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/[0.04] border border-white/8 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-600">Vídeo</p>
                      <p className="text-sm text-white mt-1">{formatSize(selected.video_size || 0)}</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] border border-white/8 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-600">Duración vídeo</p>
                      <p className="text-sm text-white mt-1">{formatDuration(selected.video_duration || 0)}</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] border border-white/8 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-600">Generado</p>
                      <p className="text-sm text-white mt-1">
                        {selected.video_generated_at ? new Date(selected.video_generated_at).toLocaleDateString('es-ES') : '-'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] border border-white/8 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-600">Intentos YouTube</p>
                      <p className="text-sm text-white mt-1">{selected.youtube_upload_attempts || 0}</p>
                    </div>
                  </div>
                )}

                {selected.descripcion && (
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Descripción</h3>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{selected.descripcion}</p>
                  </section>
                )}

                {selected.tracklist && (
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Tracklist</h3>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-black/20 rounded-xl border border-white/8 p-4">{selected.tracklist}</pre>
                  </section>
                )}

                <div className="flex flex-wrap gap-2">
                  {!selected.video_path || selected.estado === 'render_failed' ? (
                    <button
                      onClick={() => generateVideo(selected._id, selected.estado === 'render_failed' && !!selected.video_path)}
                      disabled={generatingId === selected._id || selected.estado === 'generating_video' || selected.estado === 'generando_video'}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      {generatingId === selected._id || selected.estado === 'generating_video' || selected.estado === 'generando_video'
                        ? 'Generando...'
                        : selected.estado === 'render_failed'
                          ? 'Reintentar generación'
                          : 'Generar vídeo'}
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">
                        Vídeo generado
                      </span>
                      <button
                        onClick={() => generateVideo(selected._id, true)}
                        disabled={generatingId === selected._id || selected.estado === 'generating_video' || selected.estado === 'generando_video'}
                        className="px-4 py-2 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                      >
                        Regenerar vídeo
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => publishYouTube(selected._id)}
                    disabled={
                      !selected.video_path ||
                      !!selected.youtube_url ||
                      publishingId === selected._id ||
                      selected.estado === 'publishing_youtube' ||
                      selected.estado === 'publicando'
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:border disabled:border-white/8 disabled:text-gray-600 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {selected.youtube_url
                      ? 'Publicado en YouTube'
                      : publishingId === selected._id || selected.estado === 'publishing_youtube' || selected.estado === 'publicando'
                        ? 'Publicando...'
                        : selected.estado === 'youtube_failed'
                          ? 'Reintentar publicación'
                          : 'Publicar en YouTube'}
                  </button>
                  <button
                    onClick={() => deleteSession(selected._id)}
                    disabled={deletingId === selected._id}
                    className="ml-auto px-4 py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 text-sm rounded-xl transition-colors disabled:opacity-50"
                  >
                    {deletingId === selected._id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>

                {generateError && <p className="text-red-400 text-sm">{generateError}</p>}
                {publishError && <p className="text-red-400 text-sm">{publishError}</p>}
                {visualError && <p className="text-red-400 text-sm">{visualError}</p>}
                {selected.estado !== 'render_failed' && selected.estado !== 'youtube_failed' && selected.error && <p className="text-red-400 text-sm">{selected.error}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
