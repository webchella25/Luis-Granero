'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import StudioLayout from '@/components/studio/StudioLayout';

const EFECTOS_DISPONIBLES = [
  { id: 'lluvia', label: 'Lluvia', desc: 'Superposición de lluvia' },
  { id: 'lluvia_suave', label: 'Lluvia suave', desc: 'Lluvia ligera' },
  { id: 'vapor_cafe', label: 'Vapor café', desc: 'Humo sutil' },
  { id: 'particulas_luz', label: 'Partículas de luz', desc: 'Destellos flotantes' },
  { id: 'olas_suaves', label: 'Olas suaves', desc: 'Movimiento de agua' },
  { id: 'parpadeo_luces', label: 'Parpadeo de luces', desc: 'Brillo pulsante' },
  { id: 'niebla', label: 'Niebla', desc: 'Tono nebuloso' },
  { id: 'neon_parpadeo', label: 'Neón parpadeante', desc: 'Saturación dinámica' },
];

const DURACIONES = [
  { value: 1, label: '1 hora' },
  { value: 2, label: '2 horas' },
  { value: 4, label: '4 horas' },
  { value: 8, label: '8 horas' },
];

interface OverlayState {
  activo: boolean;
  linea1: string;
  linea2: string;
  color: string;
  posicion: 'top' | 'center' | 'bottom';
}

export default function NuevoMusicaAmbientalPage() {
  const router = useRouter();

  // Imagen
  const [prompt, setPrompt] = useState('');
  const [generandoImagen, setGenerandoImagen] = useState(false);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [imagenPath, setImagenPath] = useState<string | null>(null);
  const [imagenError, setImagenError] = useState('');

  // Música
  const [musicaFile, setMusicaFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuración
  const [mood, setMood] = useState('');
  const [duracion, setDuracion] = useState(1);
  const [efectos, setEfectos] = useState<string[]>([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [overlay, setOverlay] = useState<OverlayState>({
    activo: false,
    linea1: '',
    linea2: '',
    color: '#ffffff',
    posicion: 'bottom',
  });

  // Submit
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');

  async function generarImagen() {
    if (!prompt.trim()) return;
    setGenerandoImagen(true);
    setImagenError('');
    try {
      const res = await fetch('/api/studio/musica-ambiental/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json() as { imagen_url?: string; imagen_path?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error generando imagen');
      setImagenUrl(data.imagen_url!);
      setImagenPath(data.imagen_path!);
    } catch (e) {
      setImagenError(e instanceof Error ? e.message : 'Error');
    } finally {
      setGenerandoImagen(false);
    }
  }

  function toggleEfecto(id: string) {
    setEfectos((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'audio/mpeg' || file.name.endsWith('.mp3'))) {
      setMusicaFile(file);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imagenPath) { setError('Genera la imagen de fondo primero'); return; }
    if (!musicaFile) { setError('Selecciona un archivo de música'); return; }
    if (!titulo.trim()) { setError('El título es obligatorio'); return; }

    setGenerando(true);
    setError('');

    try {
      // Convertir música a base64
      const buffer = await musicaFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      const body = {
        mood: mood.trim() || 'ambiental',
        prompt_flux: prompt.trim(),
        imagen_path: imagenPath,
        musica_base64: base64,
        musica_nombre: musicaFile.name,
        duracion_horas: duracion,
        efectos,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        texto_overlay: overlay.activo ? overlay : null,
      };

      const res = await fetch('/api/studio/musica-ambiental/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json() as { status?: string; video_id?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error iniciando generación');

      router.push('/studio/musica-ambiental/historial');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setGenerando(false);
    }
  }

  return (
    <StudioLayout>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">Nuevo vídeo ambiental</h1>
          <p className="text-gray-500 text-sm mt-1">Genera un vídeo de música ambiental para YouTube</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imagen de fondo */}
          <section className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Imagen de fondo</h2>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Mood / Ambiente</label>
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="Lo-fi lluvioso, Bosque sereno, Cafetería nocturna..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Prompt para la imagen *</label>
              <div className="flex gap-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A cozy rainy coffee shop at night, warm lighting, cinematic, photorealistic..."
                  rows={3}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 text-sm resize-none"
                />
                <button
                  type="button"
                  onClick={generarImagen}
                  disabled={!prompt.trim() || generandoImagen}
                  className="px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 self-end"
                >
                  {generandoImagen ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    'Generar'
                  )}
                </button>
              </div>
              {imagenError && <p className="text-red-400 text-xs mt-1">{imagenError}</p>}
            </div>

            {imagenUrl && (
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagenUrl} alt="Vista previa" className="w-full aspect-video object-cover" />
                <button
                  type="button"
                  onClick={generarImagen}
                  disabled={generandoImagen}
                  className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs rounded-lg border border-white/20 transition-colors"
                >
                  Regenerar
                </button>
              </div>
            )}
          </section>

          {/* Música */}
          <section className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Archivo de música *</h2>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragging ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {musicaFile ? (
                <div className="space-y-1">
                  <p className="text-white text-sm font-medium">{musicaFile.name}</p>
                  <p className="text-gray-500 text-xs">{(musicaFile.size / 1024 / 1024).toFixed(1)} MB · MP3</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setMusicaFile(null); }}
                    className="text-xs text-red-400 hover:text-red-300 mt-1"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg className="w-8 h-8 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                  </svg>
                  <p className="text-gray-400 text-sm">Arrastra un MP3 o haz clic para seleccionar</p>
                  <p className="text-gray-600 text-xs">Será el audio base del vídeo (en loop)</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,audio/mpeg"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setMusicaFile(f); }}
            />
          </section>

          {/* Duración y efectos */}
          <section className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Duración</h2>

            <div className="flex gap-2">
              {DURACIONES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDuracion(d.value)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    duracion === d.value
                      ? 'border-violet-500/50 bg-violet-500/15 text-violet-300'
                      : 'border-white/10 bg-white/[0.02] text-gray-500 hover:text-gray-300 hover:border-white/20'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Efectos visuales</h3>
              <div className="grid grid-cols-2 gap-2">
                {EFECTOS_DISPONIBLES.map((ef) => {
                  const selected = efectos.includes(ef.id);
                  return (
                    <button
                      key={ef.id}
                      type="button"
                      onClick={() => toggleEfecto(ef.id)}
                      className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors ${
                        selected
                          ? 'border-violet-500/40 bg-violet-500/10 text-white'
                          : 'border-white/8 bg-white/[0.02] text-gray-500 hover:border-white/15 hover:text-gray-300'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'border-violet-500 bg-violet-500' : 'border-gray-600'
                      }`}>
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{ef.label}</p>
                        <p className="text-[10px] opacity-50 mt-0.5">{ef.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Metadata */}
          <section className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Título y descripción</h2>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Título para YouTube *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Lo-fi Hip Hop Radio - Beats to Study/Relax to"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del vídeo para YouTube..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 text-sm resize-none"
              />
            </div>
          </section>

          {/* Texto overlay */}
          <section className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Texto en el vídeo</h2>
              <button
                type="button"
                onClick={() => setOverlay((o) => ({ ...o, activo: !o.activo }))}
                className={`relative w-9 h-5 rounded-full transition-colors ${overlay.activo ? 'bg-violet-600' : 'bg-white/10'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${overlay.activo ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {overlay.activo && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Línea 1</label>
                    <input
                      type="text"
                      value={overlay.linea1}
                      onChange={(e) => setOverlay((o) => ({ ...o, linea1: e.target.value }))}
                      placeholder="Título del canal"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Línea 2</label>
                    <input
                      type="text"
                      value={overlay.linea2}
                      onChange={(e) => setOverlay((o) => ({ ...o, linea2: e.target.value }))}
                      placeholder="Subtítulo opcional"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={overlay.color}
                        onChange={(e) => setOverlay((o) => ({ ...o, color: e.target.value }))}
                        className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 cursor-pointer"
                      />
                      <span className="text-xs text-gray-500">{overlay.color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Posición</label>
                    <select
                      value={overlay.posicion}
                      onChange={(e) => setOverlay((o) => ({ ...o, posicion: e.target.value as 'top' | 'center' | 'bottom' }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                    >
                      <option value="top">Arriba</option>
                      <option value="center">Centro</option>
                      <option value="bottom">Abajo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </section>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={generando}
            className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            {generando ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Iniciando generación...
              </>
            ) : (
              'Crear vídeo ambiental'
            )}
          </button>
        </form>
      </div>
    </StudioLayout>
  );
}
