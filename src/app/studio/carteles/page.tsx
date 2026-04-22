'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StudioLayout from '@/components/studio/StudioLayout';

interface Cartel {
  _id: string;
  nombre_evento: string;
  fecha: string;
  dj_nombre: string;
  cartel_path: string | null;
  creado_en: string;
}

function formatFecha(f: string) {
  try {
    const d = new Date(f.includes('-') ? f + 'T12:00:00' : f);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return f;
  }
}

export default function CartelesPage() {
  const [carteles, setCarteles] = useState<Cartel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/studio/carteles')
      .then((r) => r.json())
      .then((d) => setCarteles((d.carteles ?? []) as Cartel[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este cartel?')) return;
    setDeletingId(id);
    await fetch(`/api/studio/carteles/${id}`, { method: 'DELETE' });
    setCarteles((p) => p.filter((c) => c._id !== id));
    setDeletingId(null);
  }

  return (
    <StudioLayout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Carteles</h1>
            <p className="text-sm text-gray-500 mt-1">Carteles de eventos generados con IA</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/studio/carteles/djs"
              className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
            >
              Gestionar DJs
            </Link>
            <Link
              href="/studio/carteles/nuevo-ia"
              className="px-4 py-2 text-sm text-violet-300 hover:text-white border border-violet-500/30 hover:border-violet-400/50 rounded-lg transition-colors"
            >
              ✨ Generar con IA
            </Link>
            <Link
              href="/studio/carteles/nuevo"
              className="px-4 py-2 text-sm text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors font-medium"
            >
              + Nuevo cartel
            </Link>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-600">Cargando...</div>
        ) : carteles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">No hay carteles todavía</p>
            <Link href="/studio/carteles/nuevo" className="mt-3 text-violet-400 hover:text-violet-300 text-sm transition-colors">
              Crear el primero
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {carteles.map((c) => (
              <div key={c._id} className="group relative">
                {/* Thumbnail vertical */}
                <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03]" style={{ aspectRatio: '9/16' }}>
                  {c.cartel_path ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`${c.cartel_path}?t=${new Date(c.creado_en).getTime()}`}
                      alt={c.nombre_evento}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">
                      Generando...
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-2">
                    <Link
                      href={`/studio/carteles/nuevo?edit=${c._id}`}
                      className="px-3 py-1.5 text-xs text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                    >
                      Editar
                    </Link>
                    {c.cartel_path && (
                      <a
                        href={c.cartel_path}
                        download
                        className="px-3 py-1.5 text-xs text-gray-300 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        Descargar
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(c._id)}
                      disabled={deletingId === c._id}
                      className="px-3 py-1.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      {deletingId === c._id ? '...' : 'Eliminar'}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-2 px-0.5">
                  <p className="text-sm text-white font-medium truncate">{c.nombre_evento}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    DJ {c.dj_nombre} · {formatFecha(c.fecha)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
