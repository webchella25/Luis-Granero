'use client';

import { useState, useEffect } from 'react';
import StudioLayout from '@/components/studio/StudioLayout';

interface Canal {
  _id: string;
  nombre: string;
  nicho: string;
  descripcion: string;
  pipeline_tipo: 'narrativo' | 'musica_ambiental' | 'dj_session';
  youtube_conectado: boolean;
  creado_en: string;
}

const EMOJIS: Record<string, string> = { 'Almas Corruptas': '🎭', 'Sabores Saludables': '🍎' };
function getEmoji(nombre: string) { return EMOJIS[nombre] ?? '📺'; }

export default function CanalesPage() {
  const [canales, setCanales] = useState<Canal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNuevo, setShowNuevo] = useState(false);
  const [form, setForm] = useState({ nombre: '', nicho: '', tono: '', system_prompt_guion: '', idioma: 'es-ES', pipeline_tipo: 'narrativo' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function loadCanales() {
    const res = await fetch('/api/studio/canales');
    const d = (await res.json()) as { canales?: Canal[] };
    if (d.canales) setCanales(d.canales);
    setLoading(false);
  }

  useEffect(() => { loadCanales(); }, []);

  async function createCanal(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/studio/canales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowNuevo(false);
        setForm({ nombre: '', nicho: '', tono: '', system_prompt_guion: '', idioma: 'es-ES', pipeline_tipo: 'narrativo' });
        await loadCanales();
      } else {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? 'Error creando canal');
      }
    } finally {
      setCreating(false);
    }
  }

  async function enterCanal(canal_id: string, pipeline_tipo: string) {
    const res = await fetch('/api/studio/canal/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canal_id }),
    });
    if (res.ok) {
      window.location.href = pipeline_tipo === 'musica_ambiental'
        ? '/studio/musica-ambiental/nuevo'
        : pipeline_tipo === 'dj_session'
          ? '/studio/dj-sessions/nuevo'
          : '/studio';
    }
  }

  return (
    <StudioLayout>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-white">Canales</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona canales, nichos y pipelines desde el mismo workspace</p>
          </div>
          <button
            onClick={() => setShowNuevo(!showNuevo)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo canal
          </button>
        </div>

        {/* Formulario nuevo canal */}
        {showNuevo && (
          <div className="mb-6 bg-white/[0.03] border border-violet-500/20 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">Nuevo canal</h2>
            <form onSubmit={createCanal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Nombre *</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Mi canal" required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Tipo de pipeline</label>
                <div className="flex gap-2">
                  {[
                    { value: 'narrativo', label: 'Narrativo', desc: 'True crime, educativo, historia, análisis' },
                    { value: 'musica_ambiental', label: 'Música ambiental', desc: 'Lo-fi, ambient, estudio, relax' },
                    { value: 'dj_session', label: 'Sesiones DJ', desc: 'Sets largos, mixes, directos y podcasts musicales' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, pipeline_tipo: opt.value })}
                      className={`flex-1 px-3 py-3 rounded-xl border text-left transition-colors ${
                        form.pipeline_tipo === opt.value
                          ? 'border-violet-500/50 bg-violet-500/10 text-white'
                          : 'border-white/10 bg-white/[0.02] text-gray-500 hover:border-white/20'
                      }`}
                    >
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs mt-0.5 opacity-60">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  {form.pipeline_tipo === 'musica_ambiental' || form.pipeline_tipo === 'dj_session' ? 'Estilo musical' : 'Nicho / Temática'}
                </label>
                <input type="text" value={form.nicho} onChange={(e) => setForm({ ...form, nicho: e.target.value })}
                  placeholder={form.pipeline_tipo === 'dj_session' ? 'tech house, melodic techno, afro house...' : form.pipeline_tipo === 'musica_ambiental' ? 'lo-fi hip hop, piano ambient, naturaleza...' : 'true crime, recetas, tecnología...'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  {form.pipeline_tipo === 'dj_session' ? 'Identidad visual' : form.pipeline_tipo === 'musica_ambiental' ? 'Estilo visual' : 'Tono'}
                </label>
                <input type="text" value={form.tono} onChange={(e) => setForm({ ...form, tono: e.target.value })}
                  placeholder={form.pipeline_tipo === 'dj_session' ? 'club oscuro, neón, festival, cabina DJ...' : form.pipeline_tipo === 'musica_ambiental' ? 'paisajes nocturnos, naturaleza relajante, ciudades de noche...' : 'Oscuro y serio, amigable, divulgativo...'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 text-sm" />
              </div>
              {form.pipeline_tipo === 'narrativo' && (
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">System prompt del guión</label>
                <textarea value={form.system_prompt_guion} onChange={(e) => setForm({ ...form, system_prompt_guion: e.target.value })}
                  placeholder="Instrucciones para Claude al generar guiones (dejar vacío para usar el prompt por defecto)"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 text-sm resize-none" />
              </div>
              )}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={creating}
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
                  {creating ? 'Creando...' : 'Crear canal'}
                </button>
                <button type="button" onClick={() => setShowNuevo(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 rounded-xl text-sm transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de canales */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {canales.map((canal) => (
              <div key={canal._id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getEmoji(canal.nombre)}</span>
                    <div>
                      <h3 className="font-semibold text-white">{canal.nombre}</h3>
                      {canal.nicho && <p className="text-xs text-gray-500 mt-0.5">{canal.nicho}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      canal.pipeline_tipo === 'musica_ambiental'
                        ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                        : canal.pipeline_tipo === 'dj_session'
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        : 'text-violet-400 bg-violet-500/10 border-violet-500/20'
                    }`}>
                      {canal.pipeline_tipo === 'musica_ambiental' ? 'Música ambiental' : canal.pipeline_tipo === 'dj_session' ? 'Sesiones DJ' : 'Narrativo'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      canal.youtube_conectado
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-gray-600 bg-white/5 border-white/8'
                    }`}>
                      {canal.youtube_conectado ? 'YouTube ✓' : 'Sin YouTube'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => enterCanal(canal._id, canal.pipeline_tipo)}
                    className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors">
                    Entrar
                  </button>
                  <a href={`/studio/canales/${canal._id}/editar`}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-sm rounded-xl transition-colors">
                    Editar
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
