'use client';

import { useState, useEffect, useRef } from 'react';
import StudioLayout from '@/components/studio/StudioLayout';

interface AmbientTrack {
  _id: string;
  nombre: string;
  archivo_path: string;
  duracion_segundos: number;
  uses: number;
  creado_en: string;
}

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function trackUrl(track: AmbientTrack): string {
  const filename = track.archivo_path.split('/').pop() ?? '';
  const canalId = track.archivo_path.split('/').slice(-2, -1)[0] ?? '';
  return `/api/studio/musica-ambiental/track/${canalId}/${filename}`;
}

export default function BibliotecaPage() {
  const [tracks, setTracks] = useState<AmbientTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/studio/musica-ambiental/tracks');
      const data = await res.json();
      setTracks(data.tracks ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.mp3')) {
      alert('Solo se aceptan archivos MP3');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/studio/musica-ambiental/tracks', { method: 'POST', body: fd });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? 'Error al subir');
        return;
      }
      await load();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este track?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/studio/musica-ambiental/tracks/${id}`, { method: 'DELETE' });
      setTracks((prev) => prev.filter((t) => t._id !== id));
      if (playingId === id) stopAudio();
    } finally {
      setDeletingId(null);
    }
  }

  function togglePlay(track: AmbientTrack) {
    if (playingId === track._id) {
      stopAudio();
      return;
    }
    stopAudio();
    const audio = new Audio(trackUrl(track));
    audio.onended = () => setPlayingId(null);
    audio.play();
    audioRef.current = audio;
    setPlayingId(track._id);
  }

  function stopAudio() {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
  }

  return (
    <StudioLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Biblioteca de música</h1>
            <p className="text-gray-500 text-sm mt-1">Tracks MP3 para tus vídeos de música ambiental</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {uploading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Subiendo...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Subir MP3
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,audio/mpeg"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {/* Track list */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="w-6 h-6 animate-spin text-gray-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No hay tracks todavía</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
              >
                Subir el primer MP3
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {tracks.map((track) => (
                <div key={track._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  {/* Play button */}
                  <button
                    onClick={() => togglePlay(track)}
                    className="w-9 h-9 flex-shrink-0 rounded-full bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/40 flex items-center justify-center transition-all"
                  >
                    {playingId === track._id ? (
                      <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{track.nombre}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {formatDuration(track.duracion_segundos)}
                      {track.uses > 0 && <span className="ml-2">· usado {track.uses}×</span>}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(track._id)}
                    disabled={deletingId === track._id}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    {deletingId === track._id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-700 text-center">
          {tracks.length} track{tracks.length !== 1 ? 's' : ''} · Los tracks se usan como fondo musical en los vídeos ambientales
        </p>
      </div>
    </StudioLayout>
  );
}
