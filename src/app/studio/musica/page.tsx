'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import StudioLayout from '@/components/studio/StudioLayout';

type MusicCategory = 'hook' | 'intro' | 'desarrollo' | 'profundizacion' | 'perspectiva' | 'reflexion';

interface MusicTrack {
  _id: string;
  nombre: string;
  categoria: MusicCategory;
  archivo_path: string;
  duracion_segundos: number;
  uses: number;
  ultimo_uso: string | null;
  creado_en: string;
}

interface TracksData {
  tracks: Record<MusicCategory, MusicTrack[]>;
  counts: Record<MusicCategory, number>;
}

const CATEGORY_INFO: Record<MusicCategory, { label: string; desc: string; color: string; sections: string }> = {
  hook: {
    label: 'Hook',
    desc: 'Apertura impactante',
    color: 'text-red-400 border-red-500/30 bg-red-500/5',
    sections: 'Sección 1: Hook',
  },
  intro: {
    label: 'Intro',
    desc: 'Introducción y contexto',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    sections: 'Sección 2: Introducción',
  },
  desarrollo: {
    label: 'Desarrollo',
    desc: 'Cuerpo principal',
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
    sections: 'Sección 3: Desarrollo',
  },
  profundizacion: {
    label: 'Clímax',
    desc: 'Punto álgido del contenido',
    color: 'text-violet-400 border-violet-500/30 bg-violet-500/5',
    sections: 'Sección 4: Profundización',
  },
  perspectiva: {
    label: 'Perspectiva',
    desc: 'Impacto y consecuencias',
    color: 'text-orange-400 border-orange-500/30 bg-orange-500/5',
    sections: 'Sección 5: Perspectiva',
  },
  reflexion: {
    label: 'Cierre',
    desc: 'Reflexión final',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    sections: 'Sección 6: Reflexión + CTA',
  },
};

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MusicaPage() {
  const [data, setData] = useState<TracksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingCat, setUploadingCat] = useState<MusicCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRefs = useRef<Record<MusicCategory, HTMLInputElement | null>>({
    hook: null, intro: null, desarrollo: null, profundizacion: null, perspectiva: null, reflexion: null,
  });

  async function fetchTracks() {
    setLoading(true);
    try {
      const res = await fetch('/api/studio/music');
      if (res.ok) setData(await res.json() as TracksData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTracks(); }, []);

  async function handleUpload(categoria: MusicCategory, file: File) {
    setUploadingCat(categoria);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('categoria', categoria);
      const res = await fetch('/api/studio/music', { method: 'POST', body: form });
      if (res.ok) await fetchTracks();
      else {
        const err = await res.json() as { error?: string };
        alert(err.error ?? 'Error al subir');
      }
    } finally {
      setUploadingCat(null);
      // Limpiar input
      const input = fileInputRefs.current[categoria];
      if (input) input.value = '';
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta pista?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/studio/music/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchTracks();
    } finally {
      setDeletingId(null);
    }
  }

  function togglePlay(track: MusicTrack) {
    const url = `/api/studio/music/file${track.archivo_path.replace('/studio/music', '')}`;

    if (playingId === track._id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setPlayingId(track._id);
    audio.onended = () => setPlayingId(null);
  }

  const categories: MusicCategory[] = ['hook', 'intro', 'desarrollo', 'profundizacion', 'perspectiva', 'reflexion'];

  return (
    <StudioLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Cabecera */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/studio"
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Música narrativa</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Pistas por intención: intro, fondo, tensión y cierre para los vídeos narrativos
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((cat) => {
              const info = CATEGORY_INFO[cat];
              const tracks = data?.tracks[cat] ?? [];
              const isUploading = uploadingCat === cat;

              return (
                <div
                  key={cat}
                  className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden"
                >
                  {/* Cabecera categoría */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${info.color}`}>
                        {info.label}
                      </span>
                      <div>
                        <span className="text-white text-sm font-medium">{info.desc}</span>
                        <span className="text-gray-600 text-xs ml-2">· {info.sections}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm">{tracks.length} pista{tracks.length !== 1 ? 's' : ''}</span>
                      {/* Botón subir */}
                      <button
                        onClick={() => fileInputRefs.current[cat]?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        {isUploading ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        )}
                        {isUploading ? 'Subiendo...' : 'Subir MP3'}
                      </button>
                      <input
                        type="file"
                        accept=".mp3,audio/mpeg"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[cat] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(cat, file);
                        }}
                      />
                    </div>
                  </div>

                  {/* Lista de pistas */}
                  {tracks.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-amber-400 text-sm font-medium">
                        Sin pistas de {info.label.toLowerCase()} — el vídeo continuará sin música en esta sección
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {tracks.map((track) => {
                        const filename = track.archivo_path.split('/').pop() ?? '';
                        const isPlaying = playingId === track._id;
                        const isDeleting = deletingId === track._id;

                        return (
                          <div key={track._id} className="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] transition-colors">
                            {/* Play button */}
                            <button
                              onClick={() => togglePlay(track)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors flex-shrink-0"
                            >
                              {isPlaying ? (
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              )}
                            </button>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{track.nombre}</p>
                              <p className="text-gray-600 text-xs truncate">{filename}</p>
                            </div>

                            {/* Duración */}
                            <span className="text-gray-500 text-xs w-10 text-right flex-shrink-0">
                              {formatDuration(track.duracion_segundos)}
                            </span>

                            {/* Usos */}
                            <span className="text-gray-600 text-xs w-16 text-right flex-shrink-0">
                              {track.uses} {track.uses === 1 ? 'uso' : 'usos'}
                            </span>

                            {/* Borrar */}
                            <button
                              onClick={() => handleDelete(track._id)}
                              disabled={isDeleting}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                            >
                              {isDeleting ? (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
