'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudioLayout from '@/components/studio/StudioLayout';

type Visibility = 'public' | 'unlisted' | 'private';
type OutputFormat = '16:9' | '9:16' | '1:1';

const AUDIO_ACCEPT = '.mp3,.wav,.flac,.m4a,audio/mpeg,audio/wav,audio/flac,audio/mp4';
const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
const CHUNK_SIZE = 8 * 1024 * 1024;
const MAX_VISUAL_IMAGE_BYTES = 20 * 1024 * 1024;
const RESUMABLE_UPLOAD_KEY = 'studio:dj-session:active-upload';

interface UploadStatus {
  uploadId: string;
  status: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  missingChunks: number[];
  uploadedBytes: number;
  progress: number;
  expiresAt?: string;
  error?: string | null;
}

interface StoredUpload {
  uploadId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  lastModified: number;
  form: {
    titulo: string;
    descripcion: string;
    genre: string;
    output_format: OutputFormat;
    bpm: string;
    tags: string;
    tracklist: string;
    visibility: Visibility;
    scheduled_at: string;
  };
}

export default function NuevaDjSessionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [visualImageFile, setVisualImageFile] = useState<File | null>(null);
  const [visualImagePreview, setVisualImagePreview] = useState('');
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState('');
  const [storedUpload, setStoredUpload] = useState<StoredUpload | null>(null);
  const [resumeStatus, setResumeStatus] = useState<UploadStatus | null>(null);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [cancellingUpload, setCancellingUpload] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    genre: '',
    output_format: '16:9' as OutputFormat,
    bpm: '',
    tags: '',
    tracklist: '',
    visibility: 'unlisted' as Visibility,
    scheduled_at: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function loadStoredUpload() {
      const stored = readStoredUpload();
      if (!stored) {
        setResumeLoading(false);
        return;
      }

      try {
        const status = await fetchUploadStatus(stored.uploadId);
        if (cancelled) return;
        if (!isResumableStatus(status.status)) {
          clearStoredUpload();
          setResumeLoading(false);
          return;
        }
        setStoredUpload(stored);
        setResumeStatus(status);
        setForm(stored.form);
        setUploadProgress(status.progress);
        setUploadLabel(`Subida pendiente: ${status.uploadedChunks.length} de ${status.totalChunks} chunks`);
      } catch {
        if (!cancelled) clearStoredUpload();
      } finally {
        if (!cancelled) setResumeLoading(false);
      }
    }

    loadStoredUpload();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!visualImageFile) {
      setVisualImagePreview('');
      return;
    }
    const url = URL.createObjectURL(visualImageFile);
    setVisualImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [visualImageFile]);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function readStoredUpload(): StoredUpload | null {
    try {
      const raw = window.localStorage.getItem(RESUMABLE_UPLOAD_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredUpload;
      if (!parsed.uploadId || !parsed.fileName || !parsed.fileSize) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function saveStoredUpload(upload: StoredUpload) {
    window.localStorage.setItem(RESUMABLE_UPLOAD_KEY, JSON.stringify(upload));
    setStoredUpload(upload);
  }

  function clearStoredUpload() {
    window.localStorage.removeItem(RESUMABLE_UPLOAD_KEY);
    setStoredUpload(null);
    setResumeStatus(null);
  }

  function isResumableStatus(status: string) {
    return status === 'initiated' || status === 'uploading';
  }

  async function fetchUploadStatus(uploadId: string): Promise<UploadStatus> {
    const res = await fetch(`/api/studio/dj-sessions/uploads/${uploadId}`, { cache: 'no-store' });
    const data = (await res.json()) as { upload?: UploadStatus; error?: string };
    if (!res.ok || !data.upload) throw new Error(data.error ?? 'No se pudo consultar la subida');
    return data.upload;
  }

  function fileMatchesStoredUpload(file: File, stored: StoredUpload) {
    return (
      file.name === stored.fileName &&
      file.size === stored.fileSize &&
      (file.type || 'application/octet-stream') === stored.fileType &&
      file.lastModified === stored.lastModified
    );
  }

  function selectFile(file: File | undefined) {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!['.mp3', '.wav', '.flac', '.m4a'].some((ext) => name.endsWith(ext))) {
      setError('Formato no soportado. Usa MP3, WAV, FLAC o M4A.');
      return;
    }
    setError('');
    setAudioFile(file);
  }

  function selectVisualImage(file: File | undefined) {
    if (!file) return;
    const name = file.name.toLowerCase();
    const isAllowed = ['.jpg', '.jpeg', '.png', '.webp'].some((ext) => name.endsWith(ext)) ||
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!isAllowed) {
      setError('Formato de imagen no soportado. Usa JPG, PNG o WEBP.');
      return;
    }
    if (file.size > MAX_VISUAL_IMAGE_BYTES) {
      setError('La imagen es demasiado grande. Máximo 20 MB.');
      return;
    }
    setError('');
    setVisualImageFile(file);
  }

  async function uploadVisualImage(sessionId: string, file: File) {
    setUploadLabel('Subiendo imagen visual...');
    const fd = new FormData();
    fd.append('cover_image', file);
    const res = await fetch(`/api/studio/dj-sessions/${sessionId}/visual-image`, {
      method: 'POST',
      body: fd,
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? 'Sesión guardada, pero no se pudo subir la imagen visual');
  }

  async function uploadChunkWithRetry(uploadId: string, chunk: Blob, chunkIndex: number) {
    let lastError = 'Error subiendo chunk';
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const fd = new FormData();
        fd.append('chunk', chunk, `chunk-${chunkIndex}`);
        fd.append('chunkIndex', String(chunkIndex));
        const res = await fetch(`/api/studio/dj-sessions/uploads/${uploadId}/chunk`, {
          method: 'POST',
          body: fd,
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? `Error subiendo chunk ${chunkIndex + 1}`);
        return;
      } catch (err) {
        lastError = err instanceof Error ? err.message : lastError;
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 700));
      }
    }
    throw new Error(lastError);
  }

  async function completeUpload(uploadId: string) {
    setUploadLabel('Reconstruyendo archivo y calculando duración...');
    const completeRes = await fetch(`/api/studio/dj-sessions/uploads/${uploadId}/complete`, {
      method: 'POST',
    });
    const completeData = (await completeRes.json()) as { error?: string; missing_chunks?: number[]; session?: { _id: string } };
    if (!completeRes.ok) {
      const missing = completeData.missing_chunks?.length ? ` Faltan chunks: ${completeData.missing_chunks.join(', ')}` : '';
      throw new Error(`${completeData.error ?? 'Error completando subida'}${missing}`);
    }

    clearStoredUpload();
    if (visualImageFile && completeData.session?._id) {
      await uploadVisualImage(completeData.session._id, visualImageFile);
    }

    setUploadProgress(100);
    setUploadLabel('Sesión guardada');
    router.push('/studio/dj-sessions/historial');
  }

  async function uploadMissingChunks(uploadId: string, file: File, missingChunks: number[], totalChunks: number, chunkSize: number) {
    const pending = missingChunks.length > 0
      ? missingChunks
      : Array.from({ length: totalChunks }, (_, index) => index);

    for (let pendingIndex = 0; pendingIndex < pending.length; pendingIndex++) {
      const chunkIndex = pending[pendingIndex];
      const start = chunkIndex * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunk = file.slice(start, end);
      setUploadLabel(`Subiendo chunk ${chunkIndex + 1} de ${totalChunks}`);
      await uploadChunkWithRetry(uploadId, chunk, chunkIndex);
      const uploadedCount = totalChunks - pending.length + pendingIndex + 1;
      setUploadProgress(Math.round((uploadedCount / totalChunks) * 90));
    }

    await completeUpload(uploadId);
  }

  async function resumeStoredUpload() {
    if (!storedUpload) return;
    if (!audioFile) {
      setError('Selecciona el mismo archivo para continuar la subida.');
      return;
    }
    if (!fileMatchesStoredUpload(audioFile, storedUpload)) {
      setError('El archivo seleccionado no coincide con la subida pendiente. Selecciona el mismo archivo o cancela la subida anterior.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const status = await fetchUploadStatus(storedUpload.uploadId);
      if (!isResumableStatus(status.status)) {
        clearStoredUpload();
        throw new Error('Esta subida ya no se puede reanudar.');
      }
      setResumeStatus(status);
      setUploadProgress(status.progress);
      await uploadMissingChunks(status.uploadId, audioFile, status.missingChunks, status.totalChunks, status.chunkSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reanudando la subida');
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelStoredUpload() {
    if (!storedUpload) return;
    setCancellingUpload(true);
    setError('');
    try {
      const res = await fetch(`/api/studio/dj-sessions/uploads/${storedUpload.uploadId}`, { method: 'DELETE' });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error cancelando subida');
      clearStoredUpload();
      setUploadProgress(0);
      setUploadLabel('');
      setAudioFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cancelando subida');
    } finally {
      setCancellingUpload(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (storedUpload) {
      await resumeStoredUpload();
      return;
    }
    if (!audioFile) {
      setError('Selecciona un archivo de audio');
      return;
    }
    if (!form.titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    setUploadLabel('Preparando subida...');
    setError('');
    try {
      const startRes = await fetch('/api/studio/dj-sessions/uploads/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: audioFile.name,
          mimeType: audioFile.type || 'application/octet-stream',
          fileSize: audioFile.size,
          chunkSize: CHUNK_SIZE,
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          genre: form.genre.trim(),
          output_format: form.output_format,
          bpm: form.bpm.trim(),
          tags: form.tags.trim(),
          tracklist: form.tracklist.trim(),
          visibility: form.visibility,
          scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : undefined,
        }),
      });
      const startData = (await startRes.json()) as { upload_id?: string; total_chunks?: number; error?: string };
      if (!startRes.ok || !startData.upload_id || !startData.total_chunks) {
        throw new Error(startData.error ?? 'Error iniciando subida');
      }

      saveStoredUpload({
        uploadId: startData.upload_id,
        fileName: audioFile.name,
        fileSize: audioFile.size,
        fileType: audioFile.type || 'application/octet-stream',
        lastModified: audioFile.lastModified,
        form: { ...form },
      });
      await uploadMissingChunks(
        startData.upload_id,
        audioFile,
        Array.from({ length: startData.total_chunks }, (_, index) => index),
        startData.total_chunks,
        CHUNK_SIZE
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error subiendo la sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StudioLayout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">Subir sesión DJ</h1>
          <p className="text-gray-500 text-sm mt-1">Audio grande con subida reanudable por chunks</p>
        </div>

        {resumeLoading && (
          <div className="mb-6 rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <p className="text-sm text-gray-400">Comprobando subidas pendientes...</p>
          </div>
        )}

        {storedUpload && resumeStatus && (
          <div className="mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-amber-200">Hay una subida incompleta</p>
                <p className="text-xs text-amber-100/80 mt-1">
                  {resumeStatus.fileName} · {(resumeStatus.fileSize / 1024 / 1024).toFixed(1)} MB · {resumeStatus.progress}%
                </p>
                <p className="text-xs text-amber-100/60 mt-1">
                  Selecciona el mismo archivo y continúa desde los {resumeStatus.missingChunks.length} chunks pendientes.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resumeStoredUpload}
                  disabled={submitting || cancellingUpload}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
                >
                  Continuar
                </button>
                <button
                  type="button"
                  onClick={cancelStoredUpload}
                  disabled={submitting || cancellingUpload}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
                >
                  {cancellingUpload ? 'Cancelando...' : 'Cancelar'}
                </button>
              </div>
            </div>
            <div className="h-2 rounded-full bg-black/30 overflow-hidden mt-4">
              <div className="h-full bg-amber-400" style={{ width: `${Math.max(2, resumeStatus.progress)}%` }} />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Audio</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                selectFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragging ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {audioFile ? (
                <div className="space-y-1">
                  <p className="text-white text-sm font-medium">{audioFile.name}</p>
                  <p className="text-gray-500 text-xs">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setAudioFile(null); }}
                    className="text-xs text-red-400 hover:text-red-300 mt-1"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg className="w-8 h-8 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303" />
                  </svg>
                  <p className="text-gray-400 text-sm">Arrastra una sesión o haz clic para seleccionar</p>
                  <p className="text-gray-600 text-xs">MP3, WAV, FLAC o M4A. Se sube por chunks, sin base64.</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={AUDIO_ACCEPT}
              className="hidden"
              onChange={(e) => selectFile(e.target.files?.[0])}
            />
          </section>

          <section className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Imagen visual propia</h2>
              <p className="text-xs text-gray-500 mt-1">
                Si subes una imagen, será la base prioritaria para montar el vídeo animado.
              </p>
            </div>
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border border-white/10 rounded-xl overflow-hidden bg-black/20 cursor-pointer hover:border-white/20 transition-colors"
            >
              {visualImagePreview ? (
                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-0">
                  <img
                    src={visualImagePreview}
                    alt={`Vista previa de la imagen visual ${visualImageFile?.name ?? 'seleccionada'}`}
                    className="w-full h-44 md:h-full object-cover bg-black"
                  />
                  <div className="p-4 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-white truncate">{visualImageFile?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {visualImageFile ? `${(visualImageFile.size / 1024 / 1024).toFixed(1)} MB` : ''}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          imageInputRef.current?.click();
                        }}
                        className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-semibold"
                      >
                        Cambiar imagen
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVisualImageFile(null);
                        }}
                        className="px-3 py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-300 rounded-lg text-xs font-semibold"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <svg className="w-8 h-8 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Z" />
                  </svg>
                  <p className="text-gray-400 text-sm mt-2">Subir JPG, PNG o WEBP</p>
                  <p className="text-gray-600 text-xs mt-1">Máximo 20 MB. Se animará con zoom, humo, luces y partículas.</p>
                </div>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept={IMAGE_ACCEPT}
              className="hidden"
              onChange={(e) => selectVisualImage(e.target.files?.[0])}
            />
          </section>

          <section className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Metadatos</h2>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Título *</label>
              <input
                value={form.titulo}
                onChange={(e) => setField('titulo', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                placeholder="DJ Name - Sunset Session #01"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Género</label>
                <input
                  value={form.genre}
                  onChange={(e) => setField('genre', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  placeholder="Tech house"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">BPM</label>
                <input
                  value={form.bpm}
                  onChange={(e) => setField('bpm', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  placeholder="124"
                  inputMode="decimal"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Visibilidad</label>
                <select
                  value={form.visibility}
                  onChange={(e) => setField('visibility', e.target.value as Visibility)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                >
                  <option value="unlisted">No listado</option>
                  <option value="private">Privado</option>
                  <option value="public">Público</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Formato de vídeo</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '16:9', label: '16:9', hint: 'YouTube' },
                  { value: '9:16', label: '9:16', hint: 'Shorts/Reels' },
                  { value: '1:1', label: '1:1', hint: 'Instagram' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setField('output_format', option.value as OutputFormat)}
                    className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                      form.output_format === option.value
                        ? 'border-amber-500 bg-amber-500/15 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">{option.hint}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Tags</label>
              <input
                value={form.tags}
                onChange={(e) => setField('tags', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                placeholder="dj set, tech house, live mix"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setField('descripcion', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm resize-none"
                placeholder="Descripción para YouTube"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Tracklist</label>
              <textarea
                value={form.tracklist}
                onChange={(e) => setField('tracklist', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm resize-none font-mono"
                placeholder={'00:00 Intro\n05:42 Artist - Track'}
              />
            </div>
          </section>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {submitting && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-amber-300">{uploadLabel || 'Subiendo...'}</p>
                <p className="text-xs text-amber-400">{uploadProgress}%</p>
              </div>
              <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                <div className="h-full bg-amber-400 transition-all" style={{ width: `${Math.max(2, uploadProgress)}%` }} />
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {submitting ? 'Subiendo...' : storedUpload ? 'Continuar subida' : 'Guardar sesión'}
          </button>
        </form>
      </div>
    </StudioLayout>
  );
}
