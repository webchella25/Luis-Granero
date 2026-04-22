'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StudioLayout from '@/components/studio/StudioLayout';

type Step = 'form' | 'prompt' | 'result';
type Engine = 'freepik' | 'huggingface' | 'comfyui';

const ENGINE_LABELS: Record<Engine, string> = {
  freepik: 'Freepik Mystic',
  huggingface: 'HuggingFace Flux',
  comfyui: 'ComfyUI',
};

export default function NuevoCartelIAPage() {
  const [step, setStep] = useState<Step>('form');

  // Step 1 — form
  const [nombreEvento, setNombreEvento] = useState('');
  const [nombreDj, setNombreDj] = useState('');
  const [fecha, setFecha] = useState('');
  const [estilo, setEstilo] = useState('');
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [promptError, setPromptError] = useState('');

  // Step 2 — prompt
  const [prompt, setPrompt] = useState('');
  const [engines, setEngines] = useState<Engine[]>([]);
  const [selectedEngine, setSelectedEngine] = useState<Engine>('freepik');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  // Step 3 — result
  const [imageUrl, setImageUrl] = useState('');
  const [engineUsed, setEngineUsed] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch('/api/studio/generate-cartel-ia')
      .then((r) => r.json())
      .then((d: { engines?: Engine[]; default?: Engine }) => {
        if (d.engines && d.engines.length > 0) {
          setEngines(d.engines);
          setSelectedEngine(d.default ?? d.engines[0]);
        }
      })
      .catch(() => null);
  }, []);

  async function handleGeneratePrompt() {
    if (!nombreEvento.trim() || !nombreDj.trim()) {
      setPromptError('Nombre del evento y DJ son obligatorios');
      return;
    }
    setPromptError('');
    setGeneratingPrompt(true);
    try {
      const res = await fetch('/api/studio/generate-cartel-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_evento: nombreEvento,
          nombre_dj: nombreDj,
          fecha,
          descripcion_estilo: estilo,
        }),
      });
      const data = await res.json() as { prompt?: string; error?: string };
      if (!res.ok || !data.prompt) throw new Error(data.error ?? 'Error generando prompt');
      setPrompt(data.prompt);
      setStep('prompt');
    } catch (e) {
      setPromptError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setGeneratingPrompt(false);
    }
  }

  async function handleGenerateImage() {
    setGenError('');
    setGenerating(true);
    try {
      const res = await fetch('/api/studio/generate-cartel-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, engine: selectedEngine }),
      });
      const data = await res.json() as { image_url?: string; engine?: string; error?: string };
      if (!res.ok || !data.image_url) throw new Error(data.error ?? 'Error generando imagen');
      setImageUrl(data.image_url);
      setEngineUsed(data.engine ?? selectedEngine);
      setStep('result');
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/studio/carteles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_evento: nombreEvento,
          nombre_dj: nombreDj,
          fecha,
          cartel_path: imageUrl,
          prompt_ia: prompt,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error guardando');
      setSaved(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  }

  const STEPS: Step[] = ['form', 'prompt', 'result'];

  return (
    <StudioLayout>
      <div className="p-8 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/studio/carteles" className="text-gray-600 hover:text-gray-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Generar cartel con IA</h1>
            <p className="text-xs text-gray-600 mt-0.5">Describe el evento → revisa el prompt → genera la imagen</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s ? 'bg-violet-600 text-white' :
                i < STEPS.indexOf(step) ? 'bg-violet-900/50 text-violet-400' :
                'bg-white/[0.05] text-gray-600'
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-px ${i < STEPS.indexOf(step) ? 'bg-violet-700' : 'bg-white/[0.08]'}`} />}
            </div>
          ))}
          <span className="ml-2 text-xs text-gray-600">
            {step === 'form' ? 'Describe el evento' : step === 'prompt' ? 'Revisa el prompt' : 'Resultado'}
          </span>
        </div>

        {/* ── Step 1: Form ── */}
        {step === 'form' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Nombre del evento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nombreEvento}
                onChange={(e) => setNombreEvento(e.target.value)}
                placeholder="Ej: Noche Techno Valencia"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-700 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Nombre del DJ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nombreDj}
                onChange={(e) => setNombreDj(e.target.value)}
                placeholder="Ej: DJ Martina"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-700 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Fecha</label>
              <input
                type="text"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                placeholder="Ej: 14 de junio de 2026"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-700 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Estilo / ambiente
              </label>
              <textarea
                value={estilo}
                onChange={(e) => setEstilo(e.target.value)}
                placeholder="Ej: techno oscuro, luces azules y moradas, ambiente underground, industrial"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-700 focus:outline-none focus:border-violet-500/50 transition-colors text-sm resize-none"
              />
            </div>

            {promptError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {promptError}
              </p>
            )}

            <button
              onClick={handleGeneratePrompt}
              disabled={generatingPrompt}
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/50 disabled:text-violet-700 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2"
            >
              {generatingPrompt ? (
                <>
                  <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  Generando prompt...
                </>
              ) : (
                'Generar prompt con IA →'
              )}
            </button>
          </div>
        )}

        {/* ── Step 2: Prompt review ── */}
        {step === 'prompt' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Prompt generado — edítalo si quieres
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-200 focus:outline-none focus:border-violet-500/50 transition-colors text-sm resize-none leading-relaxed font-mono"
              />
              <p className="text-xs text-gray-700 mt-2">
                En inglés, optimizado para Flux/Stable Diffusion. Sin texto legible (los modelos no renderizan letras bien).
              </p>
            </div>

            {engines.length > 1 && (
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-3">Motor</label>
                <div className="flex gap-2 flex-wrap">
                  {engines.map((eng) => (
                    <button
                      key={eng}
                      onClick={() => setSelectedEngine(eng)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        selectedEngine === eng
                          ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                          : 'bg-white/[0.03] border-white/[0.08] text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {ENGINE_LABELS[eng]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {engines.length === 1 && (
              <p className="text-xs text-gray-600">
                Motor: <span className="text-gray-400">{ENGINE_LABELS[selectedEngine]}</span>
              </p>
            )}

            {genError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {genError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('form')}
                className="px-5 py-3 rounded-xl border border-white/[0.08] text-gray-500 hover:text-gray-300 transition-colors text-sm"
              >
                ← Volver
              </button>
              <button
                onClick={handleGenerateImage}
                disabled={generating || !prompt.trim()}
                className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/50 disabled:text-violet-700 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                    Generando imagen...
                  </>
                ) : (
                  'Generar cartel →'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Result ── */}
        {step === 'result' && (
          <div className="space-y-6">
            <div className="rounded-2xl overflow-hidden border border-white/[0.08]" style={{ aspectRatio: '3/4' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={nombreEvento}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs text-gray-600 text-center">
              Generado con <span className="text-gray-400">{ENGINE_LABELS[engineUsed as Engine] ?? engineUsed}</span>
            </p>

            {saveError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {saveError}
              </p>
            )}

            {saved ? (
              <div className="text-center space-y-3">
                <p className="text-emerald-400 text-sm font-medium">✓ Guardado en carteles</p>
                <Link
                  href="/studio/carteles"
                  className="inline-block px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
                >
                  Ver todos los carteles
                </Link>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('prompt')}
                  className="px-4 py-3 rounded-xl border border-white/[0.08] text-gray-500 hover:text-gray-300 transition-colors text-sm"
                >
                  Editar prompt
                </button>
                <button
                  onClick={handleGenerateImage}
                  disabled={generating}
                  className="px-4 py-3 rounded-xl border border-white/[0.08] text-gray-500 hover:text-gray-300 disabled:opacity-40 transition-colors text-sm flex items-center gap-2"
                >
                  {generating && (
                    <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  Regenerar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/50 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  {saving ? 'Guardando...' : 'Guardar en carteles'}
                </button>
              </div>
            )}

            {!saved && (
              <a
                href={imageUrl}
                download={`cartel-${nombreEvento.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                className="block text-center text-xs text-gray-700 hover:text-gray-500 transition-colors"
              >
                Descargar imagen directamente
              </a>
            )}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
