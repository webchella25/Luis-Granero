'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StudioLayout from '@/components/studio/StudioLayout';

type MusicCategory = 'intro' | 'background' | 'intense' | 'ending';

type Tono = string;
type Duracion = string;

interface ScriptSection {
  title: string;
  content: string;
}

interface TipoGuion {
  id: string;
  nombre: string;
  secciones: Array<{ id: string; titulo: string; instruccion: string }>;
}

interface FormData {
  personaje: string;
  epoca: string;
  tono: Tono;
  duracion: Duracion;
  tipo_guion?: string;
}

interface GenerateResponse {
  success: boolean;
  id: string;
  sections: ScriptSection[];
  error?: string;
}

const SECTION_COLORS = [
  'border-l-red-500',
  'border-l-amber-500',
  'border-l-orange-500',
  'border-l-violet-500',
  'border-l-blue-500',
  'border-l-emerald-500',
];

function StudioPageInner() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormData>({
    personaje: searchParams.get('personaje') ?? '',
    epoca: searchParams.get('epoca') ?? '',
    tono: 'divulgativo',
    duracion: '10',
  });
  const [sections, setSections] = useState<ScriptSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scriptId, setScriptId] = useState('');
  const [copied, setCopied] = useState(false);
  const [musicCounts, setMusicCounts] = useState<Record<MusicCategory, number> | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioEngine, setAudioEngine] = useState('');
  const [audioLoading, setAudioLoading] = useState<'elevenlabs' | 'edge-tts' | 'gemini-tts' | 'nvidia-tts' | null>(null);
  const [audioError, setAudioError] = useState('');
  const [tiposGuion, setTiposGuion] = useState<TipoGuion[]>([]);

  useEffect(() => {
    fetch('/api/studio/canal/current')
      .then((r) => r.json())
      .then((d: { canal?: { tipos_guion?: string } }) => {
        const raw = d.canal?.tipos_guion?.trim();
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as TipoGuion[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTiposGuion(parsed);
              setForm((prev) => ({ ...prev, tipo_guion: parsed[0].id }));
            }
          } catch {
            // tipos_guion inválido, ignorar
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/studio/music')
      .then((r) => r.json())
      .then((d: { counts?: Record<MusicCategory, number> }) => {
        if (d.counts) setMusicCounts(d.counts);
      })
      .catch(() => null);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSections([]);
    setScriptId('');
    setAudioUrl('');
    setAudioEngine('');
    setAudioError('');

    try {
      const res = await fetch('/api/studio/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = (await res.json()) as GenerateResponse;

      if (!res.ok) {
        setError(data.error ?? 'Error generando el guión');
        return;
      }

      setSections(data.sections);
      setScriptId(data.id);
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }

  async function generateAudio(engine: 'elevenlabs' | 'edge-tts' | 'gemini-tts' | 'nvidia-tts') {
    if (!scriptId) return;
    setAudioLoading(engine);
    setAudioError('');
    setAudioUrl('');

    const endpoint = engine === 'elevenlabs'
      ? '/api/studio/generate-audio'
      : engine === 'gemini-tts'
        ? '/api/studio/generate-audio-gemini'
        : engine === 'nvidia-tts'
          ? '/api/studio/generate-audio-nvidia'
          : '/api/studio/generate-audio-edge';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId }),
      });
      const data = (await res.json()) as { success?: boolean; audioPath?: string; engine?: string; fallback?: boolean; fallbackReason?: string; error?: string };

      if (!res.ok || !data.success) {
        setAudioError(data.error ?? 'Error generando audio');
        return;
      }

      setAudioUrl(`/api/studio/audio/${data.audioPath?.split('/').pop()}`);
      setAudioEngine(data.fallback ? `edge-tts (fallback: ${data.fallbackReason?.slice(0, 60)})` : (data.engine ?? engine));
    } catch {
      setAudioError('Error de conexión con el servidor');
    } finally {
      setAudioLoading(null);
    }
  }

  function copyAll() {
    const text = sections
      .map((s) => `## ${s.title}\n\n${s.content}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const wordCount = sections.reduce(
    (acc, s) => acc + s.content.split(/\s+/).filter(Boolean).length,
    0
  );

  return (
    <StudioLayout>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
        {/* Formulario */}
        <aside>
          <form onSubmit={handleSubmit} className="space-y-5 sticky top-8">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Nuevo guión</h2>
              <p className="text-gray-500 text-sm">Rellena los datos para generar el guión completo</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Nombre del personaje
                </label>
                <input
                  type="text"
                  value={form.personaje}
                  onChange={(e) => handleChange('personaje', e.target.value)}
                  placeholder="Ej: Heinrich Himmler"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors text-sm"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Época / Contexto histórico
                </label>
                <input
                  type="text"
                  value={form.epoca}
                  onChange={(e) => handleChange('epoca', e.target.value)}
                  placeholder="Ej: Alemania Nazi, 1930s-1945"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors text-sm"
                  required
                  disabled={loading}
                />
              </div>

              {tiposGuion.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Tipo de guión
                  </label>
                  <select
                    value={form.tipo_guion ?? ''}
                    onChange={(e) => handleChange('tipo_guion', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors text-sm appearance-none"
                    disabled={loading}
                  >
                    {tiposGuion.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#0A0F1C]">
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Tono del vídeo
                </label>
                <select
                  value={form.tono}
                  onChange={(e) => handleChange('tono', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors text-sm appearance-none"
                  disabled={loading}
                >
                  <option value="oscuro" className="bg-[#0A0F1C]">Oscuro y serio</option>
                  <option value="divulgativo" className="bg-[#0A0F1C]">Divulgativo</option>
                  <option value="misterioso" className="bg-[#0A0F1C]">Misterioso</option>
                  <option value="amigable" className="bg-[#0A0F1C]">Amigable y cercano</option>
                  <option value="educativo" className="bg-[#0A0F1C]">Educativo</option>
                  <option value="inspirador" className="bg-[#0A0F1C]">Inspirador</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Duración objetivo
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {(['5', '8', '10', '12', '15', '18', '20'] as Duracion[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleChange('duracion', d)}
                      disabled={loading}
                      className={`py-3 rounded-xl text-sm font-medium transition-colors border ${
                        form.duracion === d
                          ? 'bg-violet-600 border-violet-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generando guión...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generar guión
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
          </form>

          {/* Widget de música */}
          <div className="mt-6 p-4 bg-white/[0.03] border border-white/8 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Música de fondo</h3>
              <Link
                href="/studio/musica"
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Gestionar →
              </Link>
            </div>

            {musicCounts === null ? (
              <p className="text-gray-600 text-xs">Cargando...</p>
            ) : (
              <div className="space-y-1.5">
                {((['intro', 'background', 'intense', 'ending'] as MusicCategory[])).map((cat) => {
                  const count = musicCounts[cat] ?? 0;
                  const labels: Record<MusicCategory, string> = {
                    intro: 'Intro', background: 'Background', intense: 'Intense', ending: 'Ending',
                  };
                  return (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">{labels[cat]}</span>
                      {count === 0 ? (
                        <span className="text-xs text-amber-400 font-medium">Sin pistas</span>
                      ) : (
                        <span className="text-xs text-gray-400">{count} pista{count !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {musicCounts && Object.values(musicCounts).some((c) => c === 0) && (
              <p className="mt-3 text-xs text-amber-400/80">
                Algunas secciones no tienen pistas — el vídeo se generará sin música en ellas.
              </p>
            )}
          </div>
        </aside>

        {/* Resultado */}
        <main>
          {loading && (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
              <p className="text-gray-400 text-sm">Escribiendo el guión con Claude...</p>
              <p className="text-gray-600 text-xs">Esto puede tardar 20-40 segundos</p>
            </div>
          )}

          {!loading && sections.length === 0 && (
            <div className="flex flex-col items-center justify-center h-96 gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">El guión generado aparecerá aquí</p>
              <p className="text-gray-700 text-xs max-w-xs">
                Rellena el formulario y pulsa &quot;Generar guión&quot; para comenzar
              </p>
            </div>
          )}

          {!loading && sections.length > 0 && (
            <div className="space-y-6">
              {/* Cabecera del resultado */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{form.personaje}</h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {form.epoca} · {form.duracion} min · {wordCount.toLocaleString('es')} palabras
                    {scriptId && (
                      <span className="text-gray-700 ml-2">· ID: {scriptId.slice(-8)}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={copyAll}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copiado
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      Copiar todo
                    </>
                  )}
                </button>
              </div>

              {/* Secciones */}
              {sections.map((section, idx) => (
                <div
                  key={idx}
                  className={`bg-white/[0.03] border border-white/8 border-l-4 ${SECTION_COLORS[idx] ?? 'border-l-gray-500'} rounded-xl p-6`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white text-sm">{section.title}</h3>
                    <span className="text-xs text-gray-600">
                      {section.content.split(/\s+/).filter(Boolean).length} palabras
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                </div>
              ))}

              {/* Audio */}
              <div className="bg-white/[0.03] border border-white/8 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Narración de audio</h3>
                  {audioEngine && (
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">{audioEngine}</span>
                  )}
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => generateAudio('elevenlabs')}
                    disabled={!!audioLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {audioLoading === 'elevenlabs' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        ElevenLabs
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => generateAudio('edge-tts')}
                    disabled={!!audioLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    {audioLoading === 'edge-tts' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072" />
                        </svg>
                        Edge TTS (gratis)
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => generateAudio('gemini-tts')}
                    disabled={!!audioLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/30 text-blue-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    {audioLoading === 'gemini-tts' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                        Gemini TTS
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => generateAudio('nvidia-tts')}
                    disabled={!!audioLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600/20 hover:bg-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/30 text-green-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    {audioLoading === 'nvidia-tts' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                        </svg>
                        NVIDIA TTS
                      </>
                    )}
                  </button>
                </div>

                {audioError && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {audioError}
                  </p>
                )}

                {audioUrl && (
                  <audio
                    key={audioUrl}
                    controls
                    className="w-full h-10 accent-violet-500"
                    src={audioUrl}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </StudioLayout>
  );
}

export default function StudioPage() {
  return (
    <Suspense>
      <StudioPageInner />
    </Suspense>
  );
}
