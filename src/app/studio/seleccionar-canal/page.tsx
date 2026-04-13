'use client';

import { useState, useEffect } from 'react';

interface Canal { _id: string; nombre: string; nicho: string }

const EMOJIS: Record<string, string> = {
  'Almas Corruptas': '🎭',
  'Sabores Saludables': '🍎',
};
function getEmoji(nombre: string): string {
  return EMOJIS[nombre] ?? '📺';
}

export default function SeleccionarCanalPage() {
  const [canales, setCanales] = useState<Canal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/studio/canales')
      .then((r) => r.json())
      .then((d: { canales?: Canal[] }) => {
        if (d.canales) setCanales(d.canales);
      })
      .catch(() => setError('Error cargando canales'))
      .finally(() => setLoading(false));
  }, []);

  async function selectCanal(canal_id: string) {
    setSelecting(canal_id);
    setError('');
    try {
      const res = await fetch('/api/studio/canal/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canal_id }),
      });
      if (res.ok) {
        window.location.href = '/studio';
      } else {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? 'Error seleccionando canal');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSelecting(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Seleccionar canal</h1>
          <p className="text-gray-500 text-sm mt-1">Elige con qué canal quieres trabajar</p>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {canales.map((canal) => (
              <button
                key={canal._id}
                onClick={() => selectCanal(canal._id)}
                disabled={!!selecting}
                className="w-full flex items-center gap-4 px-5 py-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-violet-500/40 rounded-2xl text-left transition-all disabled:opacity-60"
              >
                <span className="text-2xl">{getEmoji(canal.nombre)}</span>
                <div>
                  <p className="font-semibold text-white">{canal.nombre}</p>
                  {canal.nicho && <p className="text-xs text-gray-500 mt-0.5">{canal.nicho}</p>}
                </div>
                {selecting === canal._id && (
                  <div className="ml-auto w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                )}
              </button>
            ))}
            <a
              href="/studio/canales"
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-transparent border border-dashed border-white/15 hover:border-white/30 text-gray-600 hover:text-gray-400 text-sm rounded-2xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nuevo canal
            </a>
          </div>
        )}

        {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
