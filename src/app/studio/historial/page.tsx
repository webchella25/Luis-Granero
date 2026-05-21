'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import StudioLayout from '@/components/studio/StudioLayout';

interface ShortEntry {
  seccion: number;
  titulo?: string;
  descripcion?: string;
  tags?: string[];
  path?: string | null;
  local_file_exists?: boolean;
  status: string;
  error?: string;
  source_seccion?: number;
  clip_start?: number;
  clip_duration?: number;
  clip_score?: number;
  clip_reason?: string;
  youtube_id?: string;
  youtube_url?: string;
  youtube_status?: string;
  youtube_error?: string;
  scheduled_at?: string | null;
}

type AudioEngine = 'elevenlabs' | 'edge-tts' | 'gemini-tts' | 'nvidia-tts' | 'azure-tts' | 'openai-tts';

type DetailTab = 'pipeline' | 'seo' | 'shorts' | 'publicacion' | 'guion';
type ScriptFilter = 'todos' | 'pendientes' | 'procesando' | 'listos' | 'errores' | 'publicados' | 'sin-shorts';
type ProductionStepKey = 'audio' | 'images' | 'video' | 'thumbnail' | 'shorts' | 'youtube';
type ScriptSort = 'recientes' | 'antiguos' | 'prioridad';

interface AudioVersion {
  id: string;
  path: string;
  engine: AudioEngine;
  label?: string;
  created_at: string;
  is_active: boolean;
  section_durations?: number[];
  meta?: Record<string, unknown>;
}

interface ScriptSummary {
  _id: string;
  personaje: string;
  epoca: string;
  tono: string;
  duracion: string;
  audio_path?: string;
  audio_engine?: AudioEngine;
  audio_versions?: AudioVersion[];
  audio_status?: 'idle' | 'processing' | 'ready' | 'error';
  audio_error?: string;
  images_paths?: string[];
  images_count?: number;
  images_duration?: number;
  images_status?: string;
  images_progress?: number;
  video_path?: string;
  video_file_exists?: boolean;
  video_status?: string;
  video_progress?: number;
  video_stage?: string;
  youtube_url?: string;
  youtube_status?: string;
  youtube_scheduled_at?: string | null;
  shorts?: ShortEntry[];
  // legacy
  short_path?: string;
  short_status?: string;
  thumbnail_path?: string;
  thumbnail_status?: string;
  creado_en: string;
}

interface ThumbnailTexts {
  texto_principal: string;
  subtitulo: string;
  contexto: string;
}

interface ScriptDetail extends ScriptSummary {
  guion_json: { title: string; content: string }[];
  images_error?: string;
  video_error?: string;
  youtube_id?: string;
  youtube_error?: string;
  youtube_published_at?: string | null;
  thumbnail_base_path?: string;
  thumbnail_error?: string;
  thumbnail_texts?: ThumbnailTexts;
  // SEO
  titulos_seo?: string[];
  descripcion_seo?: string;
  tags_seo?: string[];
  titulos_seo_shorts?: string[];
  shorts_seo?: { titulo_a: string; titulo_b: string; desc: string; tags: string[] }[];
  seo_titulo_seleccionado?: number;
  // Hooks
  hooks_seo?: { estilo: string; texto: string }[];
  hook_seleccionado?: number | null;
  hook_original?: string;
  // legacy
  short_error?: string;
  youtube_short_url?: string;
  youtube_short_status?: string;
  youtube_short_error?: string;
}

interface ShortFormState {
  titulo: string;
  desc: string;
  tags: string;
  visibilidad: 'public' | 'unlisted' | 'private';
  publishAt: string;
  ytState: ActionState;
  ytError: string;
}

const TONO_LABEL: Record<string, string> = {
  oscuro: 'Oscuro', divulgativo: 'Divulgativo', misterioso: 'Misterioso',
};
const TONO_COLOR: Record<string, string> = {
  oscuro: 'text-red-400 bg-red-500/10 border-red-500/20',
  divulgativo: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  misterioso: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
};
const SECTION_COLORS = [
  'border-l-red-500', 'border-l-amber-500', 'border-l-orange-500',
  'border-l-violet-500', 'border-l-blue-500', 'border-l-emerald-500',
];
const PRODUCTION_STEP_LABELS: Record<ProductionStepKey, string> = {
  audio: 'Audio',
  images: 'Imágenes',
  video: 'Vídeo',
  thumbnail: 'Miniatura',
  shorts: 'Shorts',
  youtube: 'YouTube',
};
const STAT_CARD_COLORS: Record<string, string> = {
  neutral: 'text-gray-200',
  pending: 'text-gray-400',
  processing: 'text-yellow-300',
  ready: 'text-violet-300',
  error: 'text-red-300',
  published: 'text-emerald-300',
  shorts: 'text-pink-300',
};


type ActionState = 'idle' | 'loading' | 'error';

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toISO(datetimeLocal: string): string {
  if (!datetimeLocal) return '';
  return new Date(datetimeLocal).toISOString();
}

export default function HistorialPage() {
  const [scripts, setScripts] = useState<ScriptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<ScriptDetail | null>(null);
  const [loadingScript, setLoadingScript] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [scriptFilter, setScriptFilter] = useState<ScriptFilter>('todos');
  const [quickAction, setQuickAction] = useState<{ scriptId: string; step: ProductionStepKey } | null>(null);
  const [scriptSort, setScriptSort] = useState<ScriptSort>('recientes');

  const [audioState, setAudioState] = useState<ActionState>('idle');
  const [audioError, setAudioError] = useState('');
  const [audioFallbackWarning, setAudioFallbackWarning] = useState('');
  const [imagesState, setImagesState] = useState<ActionState>('idle');
  const [imagesError, setImagesError] = useState('');
  const [videoState, setVideoState] = useState<ActionState>('idle');
  const [videoError, setVideoError] = useState('');
  const [ytState, setYtState] = useState<ActionState>('idle');
  const [ytError, setYtError] = useState('');
  const [thumbnailState, setThumbnailState] = useState<ActionState>('idle');
  const [thumbnailError, setThumbnailError] = useState('');
  const [recomposeState, setRecomposeState] = useState<ActionState>('idle');
  const [thumbnailTexts, setThumbnailTexts] = useState<ThumbnailTexts>({ texto_principal: '', subtitulo: '', contexto: '' });
  const [shortState, setShortState] = useState<ActionState>('idle');
  const [shortError, setShortError] = useState('');

  // SEO
  const [seoTituloIdx, setSeoTituloIdx] = useState(0);
  const [seoTitulos, setSeoTitulos] = useState<string[]>([]);
  const [seoDescripcion, setSeoDescripcion] = useState('');
  const [seoTags, setSeoTags] = useState<string[]>([]);
  const [seoTagInput, setSeoTagInput] = useState('');
  const [seoState, setSeoState] = useState<ActionState>('idle');
  const [seoError, setSeoError] = useState('');

  // Hooks
  const [hooks, setHooks] = useState<{ estilo: string; texto: string }[]>([]);
  const [hookIdx, setHookIdx] = useState<number | null>(null);
  const [hooksState, setHooksState] = useState<ActionState>('idle');
  const [hooksError, setHooksError] = useState('');

  // YouTube upload form
  const [ytTitulo, setYtTitulo] = useState('');
  const [ytDesc, setYtDesc] = useState('');
  const [ytTags, setYtTags] = useState('');
  const [ytVisibilidad, setYtVisibilidad] = useState<'public' | 'unlisted' | 'private'>('unlisted');
  const [ytPublishAt, setYtPublishAt] = useState(''); // datetime-local
  const [ytReupload, setYtReupload] = useState(false);

  // Shorts
  const [shortForms, setShortForms] = useState<Record<number, ShortFormState>>({});

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchScripts();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const startPolling = useCallback((scriptId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/studio/scripts/${scriptId}`);
        const data = (await res.json()) as { script: ScriptDetail };
        const s = data.script;

        const imagesDone = s.images_status === 'ready' || s.images_status === 'error';
        const videoDone = s.video_status === 'ready' || s.video_status === 'error';
        const ytDone = ['ready', 'uploaded', 'completed', 'error'].includes(s.youtube_status ?? '');
        const thumbnailDone = s.thumbnail_status === 'ready' || s.thumbnail_status === 'error';
        const anyShortProcessing = (s.shorts ?? []).some((sh) => sh.status === 'processing');
        const anyYtShortProcessing = (s.shorts ?? []).some((sh) => sh.youtube_status === 'processing');
        const shortsDone = !anyShortProcessing;
        const ytShortsDone = !anyYtShortProcessing;

        if (s.images_status === 'processing') {
          setSelectedScript((prev) => prev?._id === scriptId ? { ...prev, images_progress: s.images_progress } : prev);
        }
        if (s.video_status === 'processing') {
          setSelectedScript((prev) => prev?._id === scriptId ? { ...prev, video_progress: s.video_progress, video_stage: s.video_stage } : prev);
        }

        const audioPollDone = s.audio_status === 'ready' || s.audio_status === 'error';

        const stillProcessing =
          s.audio_status === 'processing' ||
          s.images_status === 'processing' ||
          s.video_status === 'processing' ||
          s.youtube_status === 'processing' ||
          anyShortProcessing ||
          anyYtShortProcessing ||
          s.thumbnail_status === 'processing';

        if (!stillProcessing) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
        }

        if (audioPollDone || imagesDone || videoDone || ytDone || shortsDone || ytShortsDone || thumbnailDone) {
          setScripts((prev) => prev.map((sc) =>
            sc._id === scriptId ? {
              ...sc,
              audio_path: s.audio_path, audio_engine: s.audio_engine, audio_versions: s.audio_versions, audio_status: s.audio_status,
              images_paths: s.images_paths, images_count: s.images_count, images_duration: s.images_duration,
              images_status: s.images_status, images_progress: s.images_progress,
              video_path: s.video_path, video_file_exists: s.video_file_exists, video_status: s.video_status, video_progress: s.video_progress, video_stage: s.video_stage,
              youtube_url: s.youtube_url, youtube_status: s.youtube_status,
              youtube_scheduled_at: s.youtube_scheduled_at,
              shorts: s.shorts,
              thumbnail_path: s.thumbnail_path, thumbnail_status: s.thumbnail_status,
            } : sc
          ));
          setSelectedScript((prev) => prev?._id === scriptId ? { ...prev, ...s } : prev);

          if (audioPollDone) {
            if (s.audio_status === 'error') { setAudioError(s.audio_error ?? 'Error generando narración'); setAudioState('error'); }
            else setAudioState('idle');
          }
          if (imagesDone) {
            if (s.images_status === 'error') setImagesError(s.images_error ?? 'Error generando imágenes');
            else setImagesState('idle');
          }
          if (videoDone) {
            if (s.video_status === 'error') setVideoError(s.video_error ?? 'Error durante el montaje');
            else setVideoState('idle');
          }
          if (ytDone) {
            if (s.youtube_status === 'error') setYtError(s.youtube_error ?? 'Error durante la subida');
            else setYtState('idle');
          }
          if (shortsDone) setShortState('idle');
          if (ytShortsDone) {
            // Actualizar estados por short
            for (const sh of s.shorts ?? []) {
              if (sh.youtube_status !== 'processing') {
                setShortForms((prev) => prev[sh.seccion]
                  ? { ...prev, [sh.seccion]: { ...prev[sh.seccion], ytState: 'idle', ytError: sh.youtube_error ?? '' } }
                  : prev
                );
              }
            }
          }
          if (thumbnailDone) {
            if (s.thumbnail_status === 'error') { setThumbnailError(s.thumbnail_error ?? 'Error generando miniatura'); setThumbnailState('error'); }
            else { setThumbnailState('idle'); if (s.thumbnail_texts) setThumbnailTexts(s.thumbnail_texts); }
          }
        }
      } catch { /* ignorar errores de red */ }
    }, 5000);
  }, []);

  async function fetchScripts() {
    try {
      const res = await fetch('/api/studio/scripts');
      const data = (await res.json()) as { scripts: ScriptSummary[] };
      setScripts(data.scripts ?? []);
    } finally {
      setLoading(false);
    }
  }

  function initShortForms(
    personaje: string,
    guionSections?: { title: string; content: string }[],
    shorts?: ShortEntry[],
    seoShortTitles?: string[],
    shortsSeo?: { titulo_a: string; titulo_b: string; desc: string; tags: string[] }[]
  ) {
    const forms: Record<number, ShortFormState> = {};
    const now = new Date();
    const tag = personaje.replace(/\s+/g, '');

    (guionSections ?? []).forEach((sec, idx) => {
      const existing = shorts?.find((sh) => sh.seccion === idx);
      const seo = shortsSeo?.[idx];
      const delayDays = idx * 2;
      const suggested = new Date(now.getTime() + delayDays * 24 * 60 * 60 * 1000);
      suggested.setHours(18, 0, 0, 0);

      forms[idx] = {
        titulo: existing?.titulo ?? seo?.titulo_a ?? seoShortTitles?.[idx] ?? `${personaje} — ${sec.title} #Shorts #${tag}`,
        desc: existing?.descripcion ?? seo?.desc ?? `${sec.title} — ${personaje} #Shorts #${tag}`,
        tags: existing?.tags?.length ? existing.tags.join(', ') : seo ? seo.tags.join(', ') : `${personaje}, Shorts, ${sec.title}`,
        visibilidad: 'unlisted',
        publishAt: toDatetimeLocal(suggested),
        ytState: 'idle',
        ytError: existing?.youtube_error ?? '',
      };
    });
    setShortForms(forms);
  }

  async function handleView(id: string) {
    if (selectedScript?._id === id) { setSelectedScript(null); return; }
    setDetailTab('pipeline');
    setLoadingScript(true);
    resetActionStates();
    try {
      const res = await fetch(`/api/studio/scripts/${id}`);
      const data = (await res.json()) as { script: ScriptDetail };
      setSelectedScript(data.script);

      const pje = data.script.personaje;
      if (data.script.thumbnail_texts) setThumbnailTexts(data.script.thumbnail_texts);

      // Pre-rellenar SEO
      const titulosArr = data.script.titulos_seo ?? [];
      const tituloIdx = data.script.seo_titulo_seleccionado ?? 0;
      const descSeo = data.script.descripcion_seo ?? '';
      const tagsSeo = data.script.tags_seo ?? [];
      setSeoTitulos(titulosArr);
      setSeoTituloIdx(tituloIdx);
      setSeoDescripcion(descSeo);
      setSeoTags(tagsSeo);
      setSeoTagInput('');
      setSeoError('');
      setSeoState('idle');
      setYtReupload(false);

      // Hooks
      setHooks(data.script.hooks_seo ?? []);
      setHookIdx(data.script.hook_seleccionado ?? null);
      setHooksError('');
      setHooksState('idle');

      // Pre-rellenar formulario YouTube desde SEO si disponible
      if (titulosArr.length > 0) {
        setYtTitulo(titulosArr[tituloIdx] ?? titulosArr[0]);
        setYtDesc(descSeo);
        setYtTags(tagsSeo.join(', '));
      } else {
        setYtTitulo(pje);
        setYtDesc(`Descubre la historia de ${pje}, una de las figuras más oscuras de ${data.script.epoca}. Un vídeo de divulgación histórica.`);
        setYtTags(`${pje}, historia oscura, ${data.script.epoca}, divulgación histórica, biografías`);
      }

      initShortForms(pje, data.script.guion_json, data.script.shorts, data.script.titulos_seo_shorts, data.script.shorts_seo);

      const needsPoll =
        data.script.images_status === 'processing' ||
        data.script.video_status === 'processing' ||
        data.script.youtube_status === 'processing' ||
        (data.script.shorts ?? []).some((sh) => sh.status === 'processing' || sh.youtube_status === 'processing') ||
        data.script.thumbnail_status === 'processing';

      if (needsPoll) {
        if (data.script.images_status === 'processing') setImagesState('loading');
        if (data.script.video_status === 'processing') setVideoState('loading');
        if (data.script.youtube_status === 'processing') setYtState('loading');
        if ((data.script.shorts ?? []).some((sh) => sh.status === 'processing')) setShortState('loading');
        if (data.script.thumbnail_status === 'processing') setThumbnailState('loading');
        startPolling(id);
      }
    } finally {
      setLoadingScript(false);
    }
  }

  async function handleOpenTab(id: string, tab: DetailTab) {
    if (selectedScript?._id === id) {
      setDetailTab(tab);
      return;
    }
    setDetailTab(tab);
    await handleView(id);
    setDetailTab(tab);
  }

  function patchScriptSummary(scriptId: string, patch: Partial<ScriptSummary>) {
    setScripts((prev) => prev.map((script) => script._id === scriptId ? { ...script, ...patch } : script));
    setSelectedScript((prev) => prev?._id === scriptId ? { ...prev, ...patch } : prev);
  }

  async function handleQuickStep(script: ScriptSummary, step: ProductionStepKey) {
    if (step === 'audio') {
      await handleOpenTab(script._id, 'pipeline');
      return;
    }
    if (step === 'youtube') {
      await handleOpenTab(script._id, 'publicacion');
      return;
    }
    if (step === 'images' && !script.audio_path) {
      await handleOpenTab(script._id, 'pipeline');
      return;
    }
    if (step === 'video' && !script.images_paths?.length) {
      await handleOpenTab(script._id, 'pipeline');
      return;
    }
    if ((step === 'shorts' || step === 'thumbnail') && !script.video_path) {
      await handleOpenTab(script._id, step === 'shorts' ? 'shorts' : 'pipeline');
      return;
    }

    const endpointByStep: Record<Exclude<ProductionStepKey, 'audio' | 'youtube'>, string> = {
      images: '/api/studio/generate-images',
      video: '/api/studio/generate-video',
      thumbnail: '/api/studio/generate-thumbnail',
      shorts: '/api/studio/generate-short',
    };
    const endpoint = endpointByStep[step as Exclude<ProductionStepKey, 'audio' | 'youtube'>];
    setQuickAction({ scriptId: script._id, step });
    try {
      const body = step === 'shorts'
        ? { scriptId: script._id, modo: 'auto', cantidad: 3 }
        : { scriptId: script._id };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        error?: string;
        status?: string;
        images?: string[];
        images_count?: number;
        images_duration?: number;
        secciones?: number[];
      };
      if (!res.ok) throw new Error(data.error ?? 'No se pudo iniciar la acción');

      if (step === 'images') {
        if (data.images) {
          patchScriptSummary(script._id, {
            images_paths: data.images,
            images_count: data.images_count,
            images_status: 'ready',
          });
        } else {
          patchScriptSummary(script._id, {
            images_status: data.status === 'processing' ? 'processing' : 'ready',
            images_count: data.images_count,
            images_duration: data.images_duration,
          });
          startPolling(script._id);
        }
      }
      if (step === 'video') {
        patchScriptSummary(script._id, { video_status: 'processing', video_progress: 1, video_stage: 'Iniciando montaje' });
        startPolling(script._id);
      }
      if (step === 'thumbnail') {
        patchScriptSummary(script._id, { thumbnail_status: 'processing' });
        startPolling(script._id);
      }
      if (step === 'shorts') {
        const slots = data.secciones ?? [0, 1, 2];
        const existingShorts = (script.shorts ?? []).filter((short) => !slots.includes(short.seccion));
        const processingShorts: ShortEntry[] = slots.map((seccion) => ({ seccion, status: 'processing' }));
        patchScriptSummary(script._id, { shorts: [...existingShorts, ...processingShorts] });
        startPolling(script._id);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Error ejecutando acción rápida');
    } finally {
      setQuickAction(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este guión?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/studio/scripts/${id}`, { method: 'DELETE' });
      setScripts((prev) => prev.filter((s) => s._id !== id));
      if (selectedScript?._id === id) setSelectedScript(null);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleGenerateAudio(engine: AudioEngine = 'elevenlabs') {
    if (!selectedScript) return;
    setAudioState('loading'); setAudioError(''); setAudioFallbackWarning('');
    const endpoint = engine === 'edge-tts'
      ? '/api/studio/generate-audio-edge'
      : engine === 'gemini-tts'
        ? '/api/studio/generate-audio-gemini'
        : engine === 'nvidia-tts'
          ? '/api/studio/generate-audio-nvidia'
          : engine === 'azure-tts'
            ? '/api/studio/generate-audio-azure'
            : engine === 'openai-tts'
              ? '/api/studio/generate-audio-openai'
              : '/api/studio/generate-audio';
    try {
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: selectedScript._id }),
      });
      const data = (await res.json()) as { audioPath?: string; engine?: string; audioVersion?: AudioVersion; fallback?: boolean; fallbackReason?: string; error?: string; status?: string };
      if (!res.ok) { setAudioError(data.error ?? 'Error'); setAudioState('error'); return; }
      if (data.status === 'processing') {
        // Gemini TTS corre en background — el polling detectará audio_status=ready
        startPolling(selectedScript._id);
        return; // audioState permanece en 'loading' hasta que el polling actualice
      }
      const ap = data.audioPath!;
      const eng = (data.engine ?? 'elevenlabs') as AudioEngine;
      if (data.fallback) setAudioFallbackWarning('Narración generada con Edge TTS (créditos ElevenLabs agotados)');
      const updateVersions = (versions?: AudioVersion[]) => {
        if (!data.audioVersion) return versions;
        return [...(versions ?? []).map((v) => ({ ...v, is_active: false })), data.audioVersion];
      };
      setSelectedScript((p) => p ? { ...p, audio_path: ap, audio_engine: eng, audio_versions: updateVersions(p.audio_versions) } : p);
      setScripts((p) => p.map((s) => s._id === selectedScript._id ? { ...s, audio_path: ap, audio_engine: eng, audio_versions: updateVersions(s.audio_versions) } : s));
      setAudioState('idle');
    } catch { setAudioError('Error de conexión'); setAudioState('error'); }
  }

  async function handleSelectAudioVersion(audioVersionId: string) {
    if (!selectedScript) return;
    setAudioState('loading');
    setAudioError('');
    try {
      const res = await fetch(`/api/studio/scripts/${selectedScript._id}/audio-version`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioVersionId }),
      });
      const data = (await res.json()) as { audioPath?: string; engine?: AudioEngine; audioVersion?: AudioVersion; error?: string };
      if (!res.ok || !data.audioPath || !data.engine) {
        setAudioError(data.error ?? 'Error seleccionando audio');
        setAudioState('error');
        return;
      }
      const updateVersions = (versions?: AudioVersion[]) =>
        (versions ?? []).map((version) => ({ ...version, is_active: version.id === audioVersionId }));
      setSelectedScript((p) => p ? { ...p, audio_path: data.audioPath, audio_engine: data.engine, audio_versions: updateVersions(p.audio_versions) } : p);
      setScripts((p) => p.map((s) => s._id === selectedScript._id ? { ...s, audio_path: data.audioPath, audio_engine: data.engine, audio_versions: updateVersions(s.audio_versions) } : s));
      setAudioState('idle');
    } catch {
      setAudioError('Error de conexión');
      setAudioState('error');
    }
  }

  async function handleGenerateImages() {
    if (!selectedScript) return;
    setImagesState('loading'); setImagesError('');
    try {
      const res = await fetch('/api/studio/generate-images', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: selectedScript._id }),
      });
      const data = (await res.json()) as { images?: string[]; status?: string; engine?: string; fallback?: boolean; images_count?: number; images_duration?: number; error?: string };
      if (!res.ok) { setImagesError(data.error ?? 'Error'); setImagesState('error'); return; }
      if (data.status === 'processing') {
        const cnt = data.images_count;
        setSelectedScript((p) => p ? { ...p, images_status: 'processing', images_progress: 0, images_count: cnt } : p);
        setScripts((p) => p.map((s) => s._id === selectedScript._id ? { ...s, images_status: 'processing', images_count: cnt } : s));
        startPolling(selectedScript._id);
      } else if (data.images) {
        const imgs = data.images;
        setSelectedScript((p) => p ? { ...p, images_paths: imgs, images_count: data.images_count, images_duration: data.images_duration, images_status: 'ready' } : p);
        setScripts((p) => p.map((s) => s._id === selectedScript._id ? { ...s, images_paths: imgs, images_count: data.images_count, images_status: 'ready' } : s));
        setImagesState('idle');
      }
    } catch { setImagesError('Error de conexión'); setImagesState('error'); }
  }

  async function handleGenerateVideo() {
    if (!selectedScript) return;
    setVideoState('loading'); setVideoError('');
    try {
      const res = await fetch('/api/studio/generate-video', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: selectedScript._id }),
      });
      const data = (await res.json()) as { status?: string; error?: string };
      if (!res.ok) { setVideoError(data.error ?? 'Error'); setVideoState('error'); return; }
      setSelectedScript((p) => p ? { ...p, video_status: 'processing', video_progress: 1, video_stage: 'Iniciando montaje' } : p);
      startPolling(selectedScript._id);
    } catch { setVideoError('Error de conexión'); setVideoState('error'); }
  }

  async function handleUploadYoutube() {
    if (!selectedScript) return;
    if (!ytTitulo.trim()) { setYtError('El título es obligatorio'); setYtState('error'); return; }
    setYtState('loading'); setYtError('');
    try {
      const res = await fetch('/api/studio/upload-youtube', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptId: selectedScript._id,
          titulo: ytTitulo,
          descripcion: ytDesc,
          tags: ytTags.split(',').map((t) => t.trim()).filter(Boolean),
          visibilidad: ytVisibilidad,
          publishAt: ytPublishAt ? toISO(ytPublishAt) : undefined,
        }),
      });
      const data = (await res.json()) as { status?: string; error?: string };
      if (!res.ok) { setYtError(data.error ?? 'Error'); setYtState('error'); return; }
      setSelectedScript((p) => p ? { ...p, youtube_status: 'processing' } : p);
      startPolling(selectedScript._id);
    } catch { setYtError('Error de conexión'); setYtState('error'); }
  }

  async function handleGenerateShort() {
    if (!selectedScript) return;
    setShortState('loading'); setShortError('');
    try {
      const res = await fetch('/api/studio/generate-short', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: selectedScript._id, modo: 'auto', cantidad: 3 }),
      });
      const data = (await res.json()) as { status?: string; secciones?: number[]; error?: string };
      if (!res.ok) { setShortError(data.error ?? 'Error'); setShortState('error'); return; }
      setSelectedScript((p) => {
        if (!p) return p;
        const slots = data.secciones ?? [0, 1, 2];
        const existingShorts = (p.shorts ?? []).filter((sh) => !slots.includes(sh.seccion));
        const processingShorts: ShortEntry[] = slots.map((s) => ({ seccion: s, status: 'processing' }));
        return { ...p, shorts: [...existingShorts, ...processingShorts] };
      });
      startPolling(selectedScript._id);
    } catch { setShortError('Error de conexión'); setShortState('error'); }
  }

  async function handleUploadShort(seccion: number) {
    if (!selectedScript) return;
    const form = shortForms[seccion];
    if (!form?.titulo.trim()) {
      setShortForms((prev) => ({ ...prev, [seccion]: { ...prev[seccion], ytError: 'El título es obligatorio' } }));
      return;
    }
    setShortForms((prev) => ({ ...prev, [seccion]: { ...prev[seccion], ytState: 'loading', ytError: '' } }));
    try {
      const res = await fetch('/api/studio/upload-youtube-short', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptId: selectedScript._id,
          seccion,
          titulo: form.titulo,
          descripcion: form.desc,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          visibilidad: form.publishAt ? 'private' : form.visibilidad,
          publishAt: form.publishAt ? toISO(form.publishAt) : undefined,
        }),
      });
      const data = (await res.json()) as { status?: string; error?: string };
      if (!res.ok) {
        setShortForms((prev) => ({ ...prev, [seccion]: { ...prev[seccion], ytState: 'error', ytError: data.error ?? 'Error' } }));
        return;
      }
      setSelectedScript((p) => p ? {
        ...p,
        shorts: (p.shorts ?? []).map((sh) => sh.seccion === seccion ? { ...sh, youtube_status: 'processing' } : sh),
      } : p);
      startPolling(selectedScript._id);
    } catch {
      setShortForms((prev) => ({ ...prev, [seccion]: { ...prev[seccion], ytState: 'error', ytError: 'Error de conexión' } }));
    }
  }

  async function handleRegenerateSeo() {
    if (!selectedScript) return;
    setSeoState('loading'); setSeoError('');
    try {
      const res = await fetch('/api/studio/regenerate-seo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: selectedScript._id }),
      });
      type ShortSeoItem = { titulo_a: string; titulo_b: string; desc: string; tags: string[] };
      const data = (await res.json()) as { seo?: { titulos: string[]; descripcion: string; tags: string[]; titulos_shorts: string[]; shorts_seo: ShortSeoItem[] }; error?: string };
      if (!res.ok) { setSeoError(data.error ?? 'Error'); setSeoState('error'); return; }
      const seo = data.seo!;
      setSeoTitulos(seo.titulos);
      setSeoTituloIdx(0);
      setSeoDescripcion(seo.descripcion);
      setSeoTags(seo.tags);
      setSelectedScript((p) => p ? {
        ...p,
        titulos_seo: seo.titulos,
        descripcion_seo: seo.descripcion,
        tags_seo: seo.tags,
        titulos_seo_shorts: seo.titulos_shorts,
        shorts_seo: seo.shorts_seo,
        seo_titulo_seleccionado: 0,
      } : p);
      // Actualizar también el formulario YouTube
      setYtTitulo(seo.titulos[0]);
      setYtDesc(seo.descripcion);
      setYtTags(seo.tags.join(', '));
      // Actualizar formularios de shorts
      initShortForms(selectedScript.personaje, selectedScript.guion_json, undefined, seo.titulos_shorts, seo.shorts_seo);
      setSeoState('idle');
    } catch { setSeoError('Error de conexión'); setSeoState('error'); }
  }

  function handleSeoTituloSelect(idx: number) {
    setSeoTituloIdx(idx);
    setYtTitulo(seoTitulos[idx] ?? '');
    // Persistir selección en BD (fire and forget)
    if (selectedScript) {
      fetch('/api/studio/save-seo-selection', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: selectedScript._id, tituloIdx: idx }),
      }).catch(() => {});
    }
  }

  function handleSeoDescBlur() {
    if (!selectedScript) return;
    fetch('/api/studio/save-seo-selection', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scriptId: selectedScript._id, descripcion: seoDescripcion }),
    }).catch(() => {});
  }

  function handleSeoTagRemove(tag: string) {
    const next = seoTags.filter((t) => t !== tag);
    setSeoTags(next);
    setYtTags(next.join(', '));
    if (selectedScript) {
      fetch('/api/studio/save-seo-selection', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: selectedScript._id, tags: next }),
      }).catch(() => {});
    }
  }

  function handleSeoTagAdd() {
    const tag = seoTagInput.trim();
    if (!tag || seoTags.includes(tag)) { setSeoTagInput(''); return; }
    const next = [...seoTags, tag];
    setSeoTags(next);
    setSeoTagInput('');
    setYtTags(next.join(', '));
    if (selectedScript) {
      fetch('/api/studio/save-seo-selection', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: selectedScript._id, tags: next }),
      }).catch(() => {});
    }
  }

  async function handleApplyHook(idx: number | null) {
    if (!selectedScript) return;
    setHooksState('loading'); setHooksError('');
    try {
      const res = await fetch('/api/studio/apply-hook', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: selectedScript._id, hookIdx: idx }),
      });
      const data = (await res.json()) as { content?: string; hook_seleccionado?: number | null; error?: string };
      if (!res.ok) { setHooksError(data.error ?? 'Error'); setHooksState('error'); return; }
      setHookIdx(data.hook_seleccionado ?? null);
      // Actualizar el contenido de la sección 0 en el estado local
      setSelectedScript((p) => {
        if (!p) return p;
        const updatedSections = p.guion_json.map((s, i) =>
          i === 0 ? { ...s, content: data.content ?? s.content } : s
        );
        return { ...p, guion_json: updatedSections, hook_seleccionado: data.hook_seleccionado ?? null };
      });
      setHooksState('idle');
    } catch { setHooksError('Error de conexión'); setHooksState('error'); }
  }

  async function handleRegenerateHooks() {
    if (!selectedScript) return;
    setHooksState('loading'); setHooksError('');
    try {
      const res = await fetch('/api/studio/regenerate-hooks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: selectedScript._id }),
      });
      const data = (await res.json()) as { hooks?: { estilo: string; texto: string }[]; error?: string };
      if (!res.ok) { setHooksError(data.error ?? 'Error'); setHooksState('error'); return; }
      setHooks(data.hooks ?? []);
      setHookIdx(null);
      setSelectedScript((p) => p ? { ...p, hooks_seo: data.hooks, hook_seleccionado: null } : p);
      setHooksState('idle');
    } catch { setHooksError('Error de conexión'); setHooksState('error'); }
  }

  function resetActionStates() {
    setAudioState('idle'); setAudioError(''); setAudioFallbackWarning('');
    setImagesState('idle'); setImagesError('');
    setVideoState('idle'); setVideoError('');
    setYtState('idle'); setYtError('');
    setYtPublishAt('');
    setShortState('idle'); setShortError('');
    setThumbnailState('idle'); setThumbnailError('');
    setRecomposeState('idle');
    setThumbnailTexts({ texto_principal: '', subtitulo: '', contexto: '' });
    setSeoTitulos([]); setSeoDescripcion(''); setSeoTags([]); setSeoTagInput('');
    setSeoTituloIdx(0); setSeoState('idle'); setSeoError('');
    setHooks([]); setHookIdx(null); setHooksState('idle'); setHooksError('');
    setShortForms({});
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  async function handleGenerateThumbnail() {
    if (!selectedScript) return;
    setThumbnailState('loading'); setThumbnailError('');
    try {
      const res = await fetch('/api/studio/generate-thumbnail', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: selectedScript._id }),
      });
      const data = (await res.json()) as { status?: string; error?: string };
      if (!res.ok) { setThumbnailError(data.error ?? 'Error'); setThumbnailState('error'); return; }
      setSelectedScript((p) => p ? { ...p, thumbnail_status: 'processing' } : p);
      startPolling(selectedScript._id);
    } catch { setThumbnailError('Error de conexión'); setThumbnailState('error'); }
  }

  async function handleRecomposeThumbnail() {
    if (!selectedScript || !thumbnailTexts.texto_principal) return;
    setRecomposeState('loading'); setThumbnailError('');
    try {
      const res = await fetch('/api/studio/recompose-thumbnail', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: selectedScript._id, texts: thumbnailTexts }),
      });
      const data = (await res.json()) as { thumbnailPath?: string; texts?: ThumbnailTexts; error?: string };
      if (!res.ok) { setThumbnailError(data.error ?? 'Error'); setRecomposeState('error'); return; }
      setSelectedScript((p) => p ? { ...p, thumbnail_path: data.thumbnailPath, thumbnail_status: 'ready', thumbnail_texts: data.texts } : p);
      setScripts((p) => p.map((s) => s._id === selectedScript._id ? { ...s, thumbnail_path: data.thumbnailPath, thumbnail_status: 'ready' } : s));
      setRecomposeState('idle');
    } catch { setThumbnailError('Error de conexión'); setRecomposeState('error'); }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  function hasAnyShort(script: ScriptSummary | ScriptDetail): boolean {
    return !!(script.shorts?.some((sh) => sh.path) || script.short_path);
  }

  function isAnyShortProcessing(shorts?: ShortEntry[]): boolean {
    return (shorts ?? []).some((sh) => sh.status === 'processing' || sh.youtube_status === 'processing');
  }

  const shortListForScript = (s: ScriptSummary) => s.shorts ?? [];

  function scriptHasError(script: ScriptSummary): boolean {
    return script.audio_status === 'error' ||
      script.images_status === 'error' ||
      script.video_status === 'error' ||
      script.youtube_status === 'error' ||
      script.thumbnail_status === 'error' ||
      (script.shorts ?? []).some((short) => short.status === 'error' || short.youtube_status === 'error');
  }

  function scriptIsProcessing(script: ScriptSummary): boolean {
    return script.audio_status === 'processing' ||
      script.images_status === 'processing' ||
      script.video_status === 'processing' ||
      script.youtube_status === 'processing' ||
      script.thumbnail_status === 'processing' ||
      isAnyShortProcessing(script.shorts);
  }

  function scriptMatchesFilter(script: ScriptSummary, filter: ScriptFilter): boolean {
    if (filter === 'todos') return true;
    if (filter === 'pendientes') return !script.video_path && !scriptIsProcessing(script) && !scriptHasError(script);
    if (filter === 'procesando') return scriptIsProcessing(script);
    if (filter === 'listos') return !!script.video_path && !script.youtube_url;
    if (filter === 'errores') return scriptHasError(script);
    if (filter === 'publicados') return !!script.youtube_url;
    if (filter === 'sin-shorts') return !!script.video_path && !hasAnyShort(script);
    return true;
  }

  function getPriorityScore(script: ScriptSummary): number {
    if (scriptHasError(script)) return 0;
    if (scriptIsProcessing(script)) return 1;
    if (script.video_path && !script.youtube_url) return 2;
    if (!script.audio_path) return 3;
    if (!script.images_paths?.length) return 4;
    if (!script.video_path) return 5;
    if (script.video_path && !hasAnyShort(script)) return 6;
    if (script.youtube_url) return 8;
    return 7;
  }

  function sortScripts(items: ScriptSummary[], sort: ScriptSort): ScriptSummary[] {
    return [...items].sort((a, b) => {
      if (sort === 'prioridad') {
        const priority = getPriorityScore(a) - getPriorityScore(b);
        if (priority !== 0) return priority;
      }
      const dateA = new Date(a.creado_en).getTime();
      const dateB = new Date(b.creado_en).getTime();
      return sort === 'antiguos' ? dateA - dateB : dateB - dateA;
    });
  }

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredScripts = sortScripts(scripts.filter((script) => {
    const matchesText = !normalizedSearch ||
      `${script.personaje} ${script.epoca} ${script.tono}`.toLowerCase().includes(normalizedSearch);
    return matchesText && scriptMatchesFilter(script, scriptFilter);
  }), scriptSort);

  const productionStats = {
    total: scripts.length,
    pendientes: scripts.filter((script) => scriptMatchesFilter(script, 'pendientes')).length,
    procesando: scripts.filter((script) => scriptMatchesFilter(script, 'procesando')).length,
    listos: scripts.filter((script) => scriptMatchesFilter(script, 'listos')).length,
    errores: scripts.filter((script) => scriptMatchesFilter(script, 'errores')).length,
    publicados: scripts.filter((script) => scriptMatchesFilter(script, 'publicados')).length,
    sinShorts: scripts.filter((script) => scriptMatchesFilter(script, 'sin-shorts')).length,
  };

  const statCards: {
    label: string;
    value: number;
    filter: ScriptFilter;
    tone: 'neutral' | 'pending' | 'processing' | 'ready' | 'error' | 'published' | 'shorts';
  }[] = [
    { label: 'Total', value: productionStats.total, filter: 'todos', tone: 'neutral' },
    { label: 'Pendientes', value: productionStats.pendientes, filter: 'pendientes', tone: 'pending' },
    { label: 'Procesando', value: productionStats.procesando, filter: 'procesando', tone: 'processing' },
    { label: 'Listos', value: productionStats.listos, filter: 'listos', tone: 'ready' },
    { label: 'Errores', value: productionStats.errores, filter: 'errores', tone: 'error' },
    { label: 'Publicados', value: productionStats.publicados, filter: 'publicados', tone: 'published' },
    { label: 'Sin shorts', value: productionStats.sinShorts, filter: 'sin-shorts', tone: 'shorts' },
  ];

  const filterOptions: { key: ScriptFilter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'pendientes', label: 'Pendientes' },
    { key: 'procesando', label: 'Procesando' },
    { key: 'listos', label: 'Listos' },
    { key: 'errores', label: 'Errores' },
    { key: 'publicados', label: 'Publicados' },
    { key: 'sin-shorts', label: 'Sin shorts' },
  ];

  const sortOptions: { key: ScriptSort; label: string }[] = [
    { key: 'recientes', label: 'Recientes' },
    { key: 'antiguos', label: 'Antiguos' },
    { key: 'prioridad', label: 'Prioridad' },
  ];

  function getProductionStatus(script: ScriptSummary): { label: string; tone: 'ready' | 'processing' | 'error' | 'published' | 'pending' } {
    if (scriptHasError(script)) return { label: 'Revisar error', tone: 'error' };
    if (scriptIsProcessing(script)) return { label: 'Procesando', tone: 'processing' };
    if (script.youtube_url) return { label: script.youtube_scheduled_at ? 'Programado' : 'Publicado', tone: 'published' };
    if (script.video_path) return { label: 'Listo para publicar', tone: 'ready' };
    return { label: 'Pendiente', tone: 'pending' };
  }

  function getMissingSteps(script: ScriptSummary): ProductionStepKey[] {
    const steps: ProductionStepKey[] = [];
    if (!script.audio_path) steps.push('audio');
    if (!script.images_paths?.length) steps.push('images');
    if (!script.video_path) steps.push('video');
    if (!script.thumbnail_path) steps.push('thumbnail');
    if (script.video_path && !hasAnyShort(script)) steps.push('shorts');
    if (script.video_path && !script.youtube_url) steps.push('youtube');
    return steps;
  }

  const shortSections = (selectedScript?.guion_json ?? []).map((sec, idx) => ({
    idx,
    label: sec.title,
    desc: `Sección ${idx + 1}`,
    timeHint: '',
  }));

  return (
    <StudioLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Producción narrativa</h1>
          <p className="text-sm text-gray-500 mt-1">
            Controla guiones, audio, imágenes, montaje, shorts y publicación del canal activo.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && scripts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <p className="text-gray-500 text-sm">Aún no hay guiones guardados</p>
            <Link href="/studio" className="text-violet-400 hover:text-violet-300 text-sm">Genera el primero</Link>
          </div>
        )}

        {!loading && scripts.length > 0 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
              {statCards.map((stat) => (
                <button
                  key={stat.label}
                  onClick={() => setScriptFilter(stat.filter)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    scriptFilter === stat.filter
                      ? 'border-violet-500/35 bg-violet-600/10'
                      : 'border-white/8 bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  <p className={`text-2xl font-semibold ${STAT_CARD_COLORS[stat.tone]}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </button>
              ))}
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

            {/* ── Lista ── */}
            <div className="space-y-2">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-gray-600 text-xs uppercase tracking-wider">
                    Cola · {filteredScripts.length}/{scripts.length}
                  </p>
                  {(searchQuery || scriptFilter !== 'todos' || scriptSort !== 'recientes') && (
                    <button
                      onClick={() => { setSearchQuery(''); setScriptFilter('todos'); setScriptSort('recientes'); }}
                      className="text-xs text-gray-600 hover:text-white transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar personaje, época o tono..."
                  className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
                />
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {filterOptions.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setScriptFilter(filter.key)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-colors ${
                        scriptFilter === filter.key
                          ? 'bg-violet-600/20 border-violet-500/35 text-violet-200'
                          : 'bg-white/[0.02] border-white/8 text-gray-500 hover:text-white hover:border-white/15'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600">Orden</span>
                  <div className="flex gap-1 p-1 bg-white/[0.025] border border-white/8 rounded-lg">
                    {sortOptions.map((sort) => (
                      <button
                        key={sort.key}
                        onClick={() => setScriptSort(sort.key)}
                        className={`px-2 py-1 rounded-md text-xs transition-colors ${
                          scriptSort === sort.key
                            ? 'bg-white/10 text-white'
                            : 'text-gray-600 hover:text-gray-300'
                        }`}
                      >
                        {sort.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {filteredScripts.length === 0 && (
                <div className="p-4 rounded-xl border border-white/8 bg-white/[0.02] text-sm text-gray-600 text-center">
                  No hay guiones con este filtro.
                </div>
              )}
              {filteredScripts.map((script) => {
                const productionStatus = getProductionStatus(script);
                const missingSteps = getMissingSteps(script);
                const visibleSteps = missingSteps.slice(0, 3);
                return (
                <div
                  key={script._id}
                  onClick={() => handleView(script._id)}
                  className={`group p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedScript?._id === script._id
                      ? 'bg-violet-600/10 border-violet-500/30'
                      : 'bg-white/[0.03] border-white/8 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{script.personaje}</p>
                        <ProductionStatusBadge label={productionStatus.label} tone={productionStatus.tone} />
                      </div>
                      <p className="text-gray-500 text-xs truncate mt-0.5">{script.epoca}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {script.audio_path && <StatDot color="emerald" title="Narración" />}
                        {script.images_paths?.length ? <StatDot color="amber" title="Imágenes" /> : null}
                        {script.video_path && <StatDot color="violet" title="Vídeo" />}
                        {script.youtube_url && !script.youtube_scheduled_at && <StatDot color="red" title="En YouTube" />}
                        {script.youtube_url && script.youtube_scheduled_at && <StatDot color="orange" title="YouTube programado" />}
                        {hasAnyShort(script) && <StatDot color="pink" title="Shorts" />}
                        {shortListForScript(script).some((sh) => sh.youtube_url) && <StatDot color="rose" title="Shorts en YouTube" />}
                        {script.thumbnail_path && <StatDot color="orange" title="Miniatura" />}
                        {(script.video_status === 'processing' || script.youtube_status === 'processing' || isAnyShortProcessing(script.shorts) || script.thumbnail_status === 'processing') && (
                          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" title="Procesando..." />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(script._id); }}
                      disabled={deletingId === script._id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-600 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10 shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${TONO_COLOR[script.tono] ?? 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}>
                      {TONO_LABEL[script.tono] ?? script.tono}
                    </span>
                    <span className="text-xs text-gray-600">{script.duracion} min</span>
                    <span className="text-xs text-gray-700 ml-auto">{formatDate(script.creado_en)}</span>
                  </div>
                  {visibleSteps.length > 0 ? (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-[11px] text-gray-600 uppercase tracking-wider mb-2">Falta</p>
                      <div className="flex flex-wrap gap-1.5">
                        {visibleSteps.map((step) => (
                          <button
                            key={step}
                            onClick={(e) => { e.stopPropagation(); void handleQuickStep(script, step); }}
                            disabled={quickAction?.scriptId === script._id}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/8 text-xs text-gray-400 hover:text-white hover:border-violet-500/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {quickAction?.scriptId === script._id && quickAction.step === step && <MiniSpinIcon />}
                            {PRODUCTION_STEP_LABELS[step]}
                          </button>
                        ))}
                        {missingSteps.length > visibleSteps.length && (
                          <span className="px-2 py-1 text-xs text-gray-600">+{missingSteps.length - visibleSteps.length}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-xs text-emerald-400">Pipeline completo</p>
                    </div>
                  )}
                </div>
                );
              })}
            </div>

            {/* ── Panel derecho ── */}
            <div>
              {loadingScript && (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                </div>
              )}
              {!loadingScript && !selectedScript && (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-gray-600 text-sm">Selecciona un guión para verlo</p>
                </div>
              )}

              {!loadingScript && selectedScript && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedScript.personaje}</h2>
                    <p className="text-gray-500 text-sm mt-0.5">{selectedScript.epoca} · {selectedScript.duracion} min</p>
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/8 rounded-xl overflow-x-auto">
                    {([
                      { key: 'pipeline', label: 'Pipeline' },
                      { key: 'seo', label: 'SEO' },
                      { key: 'shorts', label: 'Shorts' },
                      { key: 'publicacion', label: 'Publicación' },
                      { key: 'guion', label: 'Guion' },
                    ] as { key: DetailTab; label: string }[]).map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setDetailTab(tab.key)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          detailTab === tab.key
                            ? 'bg-violet-600 text-white'
                            : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {detailTab === 'pipeline' && (<>
                  {/* ── Narración ── */}
                  <Section title="Narración" icon="audio" complete={!!selectedScript.audio_path}>
                    {selectedScript.audio_path ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {selectedScript.audio_engine === 'edge-tts' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Edge TTS
                            </span>
                          ) : selectedScript.audio_engine === 'gemini-tts' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Gemini TTS
                            </span>
                          ) : selectedScript.audio_engine === 'nvidia-tts' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 border border-green-500/20 text-green-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> NVIDIA TTS
                            </span>
                          ) : selectedScript.audio_engine === 'azure-tts' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 border border-sky-500/20 text-sky-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Azure TTS
                            </span>
                          ) : selectedScript.audio_engine === 'openai-tts' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-500/10 border border-teal-500/20 text-teal-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> OpenAI TTS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ElevenLabs
                            </span>
                          )}
                        </div>
                        <audio controls className="w-full h-10" src={`/api/studio/audio/${selectedScript.audio_path.split('/').pop()}`} key={selectedScript.audio_path} />
                        {!!selectedScript.audio_versions?.length && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Versiones de narración</p>
                            <div className="space-y-2">
                              {selectedScript.audio_versions
                                .slice()
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .map((version) => {
                                  const active = version.is_active || version.path === selectedScript.audio_path;
                                  return (
                                    <div key={version.id} className={`p-3 rounded-lg border ${active ? 'bg-emerald-500/5 border-emerald-500/25' : 'bg-white/[0.02] border-white/8'}`}>
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                          <p className="text-sm text-white font-medium">{version.label ?? version.engine}</p>
                                          <p className="text-xs text-gray-600">
                                            {new Date(version.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            {version.section_durations?.length ? ` · ${version.section_durations.length} secciones` : ''}
                                          </p>
                                        </div>
                                        {active ? (
                                          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full shrink-0">Activa</span>
                                        ) : (
                                          <button
                                            onClick={() => handleSelectAudioVersion(version.id)}
                                            disabled={audioState === 'loading'}
                                            className="text-xs text-violet-300 hover:text-white bg-violet-600/15 border border-violet-500/25 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                                          >
                                            Usar en montaje
                                          </button>
                                        )}
                                      </div>
                                      <audio controls className="w-full h-9 mt-2" src={`/api/studio/audio/${version.path.split('/').pop()}`} />
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          <a href={`/api/studio/audio/${selectedScript.audio_path.split('/').pop()}`} download className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                            <DownloadIcon /> Descargar MP3
                          </a>
                          <button onClick={() => handleGenerateAudio('elevenlabs')} disabled={audioState === 'loading'}
                            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors disabled:opacity-50">
                            {audioState === 'loading' ? <SpinIcon /> : <RefreshIcon />}
                            Nueva versión ElevenLabs
                          </button>
                          <button onClick={() => handleGenerateAudio('edge-tts')} disabled={audioState === 'loading'}
                            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors disabled:opacity-50">
                            {audioState === 'loading' ? <SpinIcon /> : <RefreshIcon />}
                            Nueva versión Edge TTS
                          </button>
                          <button onClick={() => handleGenerateAudio('gemini-tts')} disabled={audioState === 'loading'}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors disabled:opacity-50">
                            {audioState === 'loading' ? <SpinIcon /> : <RefreshIcon />}
                            Nueva versión Gemini TTS
                          </button>
                          <button onClick={() => handleGenerateAudio('nvidia-tts')} disabled={audioState === 'loading'}
                            className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors disabled:opacity-50">
                            {audioState === 'loading' ? <SpinIcon /> : <RefreshIcon />}
                            Nueva versión NVIDIA TTS
                          </button>
                          <button onClick={() => handleGenerateAudio('azure-tts')} disabled={audioState === 'loading'}
                            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors disabled:opacity-50">
                            {audioState === 'loading' ? <SpinIcon /> : <RefreshIcon />}
                            Nueva versión Azure TTS
                          </button>
                          <button onClick={() => handleGenerateAudio('openai-tts')} disabled={audioState === 'loading'}
                            className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors disabled:opacity-50">
                            {audioState === 'loading' ? <SpinIcon /> : <RefreshIcon />}
                            Nueva versión OpenAI TTS
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ActionButton label="Generar narración" loadingLabel="Generando..." state={audioState} onClick={() => handleGenerateAudio('elevenlabs')} color="emerald" info="ElevenLabs · 30-90s" />
                          <div className="space-y-1.5">
                            <button onClick={() => handleGenerateAudio('edge-tts')} disabled={audioState === 'loading'}
                              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600/80 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
                              {audioState === 'loading' && <SpinIcon />}
                              Edge TTS
                            </button>
                            <p className="text-xs text-gray-600">Gratuito · es-ES-AlvaroNeural</p>
                          </div>
                          <div className="space-y-1.5">
                            <button onClick={() => handleGenerateAudio('gemini-tts')} disabled={audioState === 'loading'}
                              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/80 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
                              {audioState === 'loading' && <SpinIcon />}
                              Gemini TTS
                            </button>
                            <p className="text-xs text-gray-600">Google · voz expresiva</p>
                          </div>
                          <div className="space-y-1.5">
                            <button onClick={() => handleGenerateAudio('nvidia-tts')} disabled={audioState === 'loading'}
                              className="flex items-center gap-2 px-4 py-2.5 bg-green-600/80 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
                              {audioState === 'loading' && <SpinIcon />}
                              NVIDIA TTS
                            </button>
                            <p className="text-xs text-gray-600">Magpie · es-ES · alta calidad</p>
                          </div>
                          <div className="space-y-1.5">
                            <button onClick={() => handleGenerateAudio('azure-tts')} disabled={audioState === 'loading'}
                              className="flex items-center gap-2 px-4 py-2.5 bg-sky-600/80 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
                              {audioState === 'loading' && <SpinIcon />}
                              Azure TTS
                            </button>
                            <p className="text-xs text-gray-600">Azure AI Speech · es-ES</p>
                          </div>
                          <div className="space-y-1.5">
                            <button onClick={() => handleGenerateAudio('openai-tts')} disabled={audioState === 'loading'}
                              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600/80 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
                              {audioState === 'loading' && <SpinIcon />}
                              OpenAI TTS
                            </button>
                            <p className="text-xs text-gray-600">gpt-4o-mini-tts · voz guiada</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {audioFallbackWarning && (
                      <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        {audioFallbackWarning}
                      </div>
                    )}
                    {audioError && <ErrorBox>{audioError}</ErrorBox>}
                  </Section>

                  {/* ── Imágenes ── */}
                  <Section title="Imágenes" icon="image" complete={!!selectedScript.images_paths?.length}>
                    {selectedScript.images_paths?.length ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          {selectedScript.images_paths.map((img, i) => (
                            <div key={i} className="aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img} alt={`Sección ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleGenerateImages}
                          disabled={imagesState === 'loading' || selectedScript.images_status === 'processing'}
                          className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
                        >
                          {imagesState === 'loading' ? <SpinIcon /> : <RefreshIcon />}
                          Regenerar imágenes
                        </button>
                      </div>
                    ) : selectedScript.images_status === 'processing' || imagesState === 'loading' ? (
                      <ImagesProgress progress={selectedScript.images_progress ?? 0} total={selectedScript.images_count ?? 0} />
                    ) : selectedScript.audio_path ? (
                      <ActionButton label="Generar imágenes" loadingLabel="Iniciando..." state={imagesState} onClick={handleGenerateImages} color="amber" info="Auto · Freepik / HuggingFace FLUX.1" />
                    ) : (
                      <Pending>Primero genera la narración</Pending>
                    )}
                    {(imagesError || selectedScript.images_error) && <ErrorBox>{imagesError || selectedScript.images_error}</ErrorBox>}
                  </Section>

                  {/* ── Vídeo ── */}
                  <Section title="Vídeo" icon="video" complete={!!selectedScript.video_path}>
                    {selectedScript.video_path && selectedScript.video_file_exists ? (
                      <div className="space-y-2">
                        <video controls className="w-full rounded-lg" src={selectedScript.video_path} key={selectedScript.video_path} />
                        <div className="flex items-center gap-3 flex-wrap">
                          <a href={selectedScript.video_path} download className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                            <DownloadIcon /> Descargar MP4
                          </a>
                          <button onClick={handleGenerateVideo} disabled={videoState === 'loading' || selectedScript.video_status === 'processing'}
                            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50">
                            {videoState === 'loading' ? <SpinIcon /> : <RefreshIcon />}
                            Regenerar vídeo
                          </button>
                        </div>
                      </div>
                    ) : selectedScript.video_path && selectedScript.youtube_url ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                          <p className="text-sm font-medium text-emerald-300">Vídeo subido a YouTube</p>
                          <p className="text-xs text-gray-500 mt-1">El MP4 local se eliminó para liberar espacio del VPS.</p>
                        </div>
                        <a
                          href={selectedScript.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Ver en YouTube
                        </a>
                      </div>
                    ) : selectedScript.video_status === 'processing' || videoState === 'loading' ? (
                      <VideoProgress progress={selectedScript.video_progress ?? 0} stage={selectedScript.video_stage} />
                    ) : selectedScript.images_paths?.length ? (
                      <ActionButton label="Montar vídeo" loadingLabel="Iniciando..." state={videoState} onClick={handleGenerateVideo} color="violet" info="FFmpeg Ken Burns · 1920×1080 · Música por secciones" />
                    ) : (
                      <Pending>Primero genera las imágenes</Pending>
                    )}
                    {(videoError || selectedScript.video_error) && <ErrorBox>{videoError || selectedScript.video_error}</ErrorBox>}
                  </Section>
                  </>)}

                  {detailTab === 'seo' && (<>
                  {/* ── YouTube SEO ── */}
                  <Section title="YouTube SEO" icon="seo" complete={seoTitulos.length > 0}>
                    {seoTitulos.length > 0 ? (
                      <div className="space-y-4">
                        {/* Títulos */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Títulos SEO — selecciona uno</p>
                          <div className="space-y-2">
                            {seoTitulos.map((titulo, idx) => (
                              <label key={idx} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                seoTituloIdx === idx ? 'border-violet-500/40 bg-violet-500/8' : 'border-white/8 bg-white/[0.02] hover:border-white/15'
                              }`}>
                                <input
                                  type="radio"
                                  name="seo_titulo"
                                  checked={seoTituloIdx === idx}
                                  onChange={() => handleSeoTituloSelect(idx)}
                                  className="mt-0.5 accent-violet-500 shrink-0"
                                />
                                <span className="text-sm text-white leading-snug">{titulo}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Descripción */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Descripción</p>
                          <textarea
                            value={seoDescripcion}
                            onChange={(e) => { setSeoDescripcion(e.target.value); setYtDesc(e.target.value); }}
                            onBlur={handleSeoDescBlur}
                            rows={6}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50 transition-colors resize-none leading-relaxed"
                          />
                          <p className="text-xs text-gray-700 mt-0.5">{seoDescripcion.split(/\s+/).filter(Boolean).length} palabras</p>
                        </div>

                        {/* Tags */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tags ({seoTags.length})</p>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {seoTags.map((tag) => (
                              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs rounded-full">
                                {tag}
                                <button onClick={() => handleSeoTagRemove(tag)} className="text-violet-400 hover:text-red-400 transition-colors leading-none">×</button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={seoTagInput}
                              onChange={(e) => setSeoTagInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSeoTagAdd(); } }}
                              placeholder="Añadir tag..."
                              className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                            />
                            <button onClick={handleSeoTagAdd} className="px-3 py-1.5 bg-violet-600/60 hover:bg-violet-600 text-white text-xs rounded-lg transition-colors">
                              Añadir
                            </button>
                          </div>
                        </div>

                        {/* Regenerar */}
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={handleRegenerateSeo}
                            disabled={seoState === 'loading'}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-gray-300 text-sm rounded-lg transition-colors"
                          >
                            {seoState === 'loading' ? <SpinIcon /> : <RefreshIcon />}
                            {seoState === 'loading' ? 'Generando...' : 'Regenerar SEO'}
                          </button>
                          <p className="text-xs text-gray-600">Claude Sonnet 4.6 · Evergreen</p>
                        </div>
                        {seoError && <ErrorBox>{seoError}</ErrorBox>}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500">Sin datos SEO. Genera automáticamente títulos, descripción y tags optimizados para YouTube.</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleRegenerateSeo}
                            disabled={seoState === 'loading'}
                            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            {seoState === 'loading' ? <SpinIcon /> : null}
                            {seoState === 'loading' ? 'Generando SEO...' : 'Generar SEO'}
                          </button>
                          <p className="text-xs text-gray-600">Claude Sonnet 4.6</p>
                        </div>
                        {seoError && <ErrorBox>{seoError}</ErrorBox>}
                      </div>
                    )}
                  </Section>

                  {/* ── Hooks alternativos ── */}
                  <Section title="Hooks alternativos" icon="hook" complete={hookIdx !== null}>
                    {hooks.length > 0 ? (
                      <div className="space-y-4">
                        <p className="text-xs text-gray-500">Selecciona un hook para reemplazar el inicio de la sección. El guión original queda guardado.</p>
                        <div className="space-y-2">
                          {hooks.map((hook, idx) => {
                            const estiloLabel: Record<string, string> = {
                              pregunta_provocadora: 'Pregunta provocadora',
                              narrativa_alto_riesgo: 'Narrativa de alto riesgo',
                              revelacion_oculta: 'Revelación oculta',
                            };
                            const estiloColor: Record<string, string> = {
                              pregunta_provocadora: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                              narrativa_alto_riesgo: 'text-red-400 bg-red-500/10 border-red-500/20',
                              revelacion_oculta: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
                            };
                            const isSelected = hookIdx === idx;
                            return (
                              <div key={idx} className={`p-3 rounded-xl border transition-all ${
                                isSelected
                                  ? 'border-emerald-500/40 bg-emerald-500/5'
                                  : 'border-white/8 bg-white/[0.02] hover:border-white/15'
                              }`}>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${estiloColor[hook.estilo] ?? 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}>
                                    {estiloLabel[hook.estilo] ?? hook.estilo}
                                  </span>
                                  {isSelected && (
                                    <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">Aplicado</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed mb-3">{hook.texto}</p>
                                <div className="flex items-center gap-2">
                                  {!isSelected ? (
                                    <button
                                      onClick={() => handleApplyHook(idx)}
                                      disabled={hooksState === 'loading'}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/70 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs rounded-lg transition-colors"
                                    >
                                      {hooksState === 'loading' ? <SpinIcon /> : null}
                                      Usar este hook
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleApplyHook(null)}
                                      disabled={hooksState === 'loading'}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-gray-400 text-xs rounded-lg transition-colors"
                                    >
                                      Revertir al original
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={handleRegenerateHooks}
                            disabled={hooksState === 'loading'}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-gray-300 text-sm rounded-lg transition-colors"
                          >
                            {hooksState === 'loading' ? <SpinIcon /> : <RefreshIcon />}
                            {hooksState === 'loading' ? 'Generando...' : 'Regenerar hooks'}
                          </button>
                          <p className="text-xs text-gray-600">Claude Sonnet 4.6</p>
                        </div>
                        {hooksError && <ErrorBox>{hooksError}</ErrorBox>}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500">Genera 3 aperturas alternativas virales para el inicio del vídeo.</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleRegenerateHooks}
                            disabled={hooksState === 'loading'}
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            {hooksState === 'loading' ? <SpinIcon /> : null}
                            {hooksState === 'loading' ? 'Generando hooks...' : 'Generar hooks'}
                          </button>
                          <p className="text-xs text-gray-600">Pregunta · Riesgo · Revelación</p>
                        </div>
                        {hooksError && <ErrorBox>{hooksError}</ErrorBox>}
                      </div>
                    )}
                  </Section>
                  </>)}

                  {detailTab === 'publicacion' && (<>
                  {/* ── YouTube ── */}
                  <Section title="YouTube" icon="youtube" complete={!!selectedScript.youtube_url}>
                    {selectedScript.youtube_url && !ytReupload ? (
                      <div className="space-y-3">
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${selectedScript.youtube_scheduled_at && !selectedScript.youtube_published_at ? 'bg-orange-500/5 border-orange-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
                          <svg className={`w-6 h-6 shrink-0 ${selectedScript.youtube_scheduled_at && !selectedScript.youtube_published_at ? 'text-orange-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          <div className="flex-1 min-w-0">
                            {selectedScript.youtube_scheduled_at && !selectedScript.youtube_published_at ? (
                              <>
                                <p className="text-sm font-medium text-orange-300">Programado para {formatDate(selectedScript.youtube_scheduled_at)}</p>
                                <a href={selectedScript.youtube_url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-400/70 hover:text-orange-300 transition-colors">{selectedScript.youtube_url}</a>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium text-white">Publicado en YouTube{selectedScript.youtube_published_at ? ` · ${formatDate(selectedScript.youtube_published_at)}` : ''}</p>
                                <a href={selectedScript.youtube_url} target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:text-red-300 transition-colors truncate block">{selectedScript.youtube_url}</a>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setYtReupload(true)}
                          className="w-full py-2 text-xs text-gray-400 border border-white/10 rounded-lg hover:border-red-500/30 hover:text-red-400 transition-colors"
                        >
                          Subir de nuevo a YouTube
                        </button>
                      </div>
                    ) : selectedScript.youtube_status === 'processing' || ytState === 'loading' ? (
                      <Processing label="Subiendo a YouTube... puede tardar varios minutos" />
                    ) : selectedScript.video_path && selectedScript.video_file_exists ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Título</label>
                            <input type="text" value={ytTitulo} onChange={(e) => setYtTitulo(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors" placeholder="Título del vídeo" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Descripción</label>
                            <textarea value={ytDesc} onChange={(e) => setYtDesc(e.target.value)} rows={3}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors resize-none" placeholder="Descripción del vídeo" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Tags (separados por comas)</label>
                            <input type="text" value={ytTags} onChange={(e) => setYtTags(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors" placeholder="tag1, tag2, tag3" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Visibilidad</label>
                            <div className="flex gap-2">
                              {(['unlisted', 'public', 'private'] as const).map((v) => (
                                <button key={v} onClick={() => setYtVisibilidad(v)}
                                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${ytVisibilidad === v ? 'bg-red-600/20 border-red-500/40 text-red-300' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}>
                                  {v === 'unlisted' ? 'No listado' : v === 'public' ? 'Público' : 'Privado'}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Programar publicación <span className="text-gray-700">(opcional — vacío = publicar ahora)</span>
                            </label>
                            <input type="datetime-local" value={ytPublishAt} onChange={(e) => setYtPublishAt(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors [color-scheme:dark]" />
                            {ytPublishAt && (
                              <p className="mt-1 text-xs text-orange-400">Se subirá como privado y se publicará el {formatDate(new Date(ytPublishAt).toISOString())}</p>
                            )}
                          </div>
                        </div>
                        <ActionButton label="Subir a YouTube" loadingLabel="Iniciando subida..." state={ytState} onClick={handleUploadYoutube} color="red" info="YouTube Data API v3 · Streaming upload" />
                      </div>
                    ) : selectedScript.video_path ? (
                      <Pending>El MP4 local ya no existe. Regenera el vídeo si necesitas subirlo de nuevo.</Pending>
                    ) : (
                      <Pending>Primero genera el vídeo</Pending>
                    )}
                    {ytError && <ErrorBox>{ytError}</ErrorBox>}
                    {!ytError && selectedScript.youtube_error && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400/80 text-xs">
                        <span className="font-medium">Error del último intento:</span> {selectedScript.youtube_error}
                      </div>
                    )}
                  </Section>
                  </>)}

                  {detailTab === 'shorts' && (<>
                  {/* ── YouTube Shorts ── */}
                  {selectedScript.video_path && (
                    <Section title="YouTube Shorts" icon="short" complete={hasAnyShort(selectedScript)}>
                      <div className="space-y-5">
                        {/* ── Selección inteligente ── */}
                        {!hasAnyShort(selectedScript) || (selectedScript.shorts ?? []).length < 3 ? (
                          <div className="space-y-3">
                            <div className="p-4 bg-pink-500/5 border border-pink-500/15 rounded-xl">
                              <p className="text-sm font-medium text-white">Shorts de máxima retención</p>
                              <p className="text-xs text-gray-500 mt-1">
                                El sistema analiza el guion completo y monta sólo 3 clips con giro, revelación, sospecha o impacto. Ya no corta un Short por cada tramo.
                              </p>
                            </div>

                            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Estrategia de publicación sugerida:</p>
                              <div className="space-y-0.5">
                                {[0, 1, 2].map((_, i) => (
                                  <p key={i} className="text-xs text-gray-600">
                                    Short {i + 1} → {i === 0 ? 'mismo día que el vídeo largo' : `${i * 2} días después`}
                                  </p>
                                ))}
                              </div>
                            </div>

                            {shortState === 'loading' || (selectedScript.shorts ?? []).some((sh) => sh.status === 'processing') ? (
                              <Processing label="Generando Shorts con FFmpeg..." />
                            ) : (
                              <ActionButton
                                label="Generar 3 Shorts potentes"
                                loadingLabel="Iniciando..."
                                state={shortState}
                                onClick={handleGenerateShort}
                                color="pink"
                                info="LLM + scoring de retención · 1080×1920 · Máx 58s"
                              />
                            )}
                            {shortError && <ErrorBox>{shortError}</ErrorBox>}
                          </div>
                        ) : null}

                        {/* ── Grid de Shorts generados ── */}
                        {(selectedScript.shorts ?? []).length > 0 && (
                          <div className="space-y-6">
                            {(selectedScript.shorts ?? [])
                              .slice()
                              .sort((a, b) => a.seccion - b.seccion)
                              .map((short) => {
                                const sourceIdx = short.source_seccion ?? short.seccion;
                                const secInfo = shortSections.find((s) => s.idx === sourceIdx);
                                const form = shortForms[short.seccion];

                                return (
                                  <div key={short.seccion} className="border border-white/8 rounded-xl overflow-hidden">
                                    {/* Cabecera del short */}
                                    <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Short {short.seccion + 1}</span>
                                        <span className="text-xs text-gray-600">Origen: {secInfo?.label ?? `Sección ${sourceIdx + 1}`}</span>
                                        {short.clip_score !== undefined && (
                                          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                            Retención {short.clip_score}
                                          </span>
                                        )}
                                      </div>
                                      <ShortStatusBadge status={short.status} ytStatus={short.youtube_status} scheduledAt={short.scheduled_at} youtubeUrl={short.youtube_url} />
                                    </div>

                                    {/* Cuerpo */}
                                    <div className="p-4 space-y-4">
                                      {short.status === 'processing' ? (
                                        <Processing label={`Generando Short ${short.seccion + 1}...`} />
                                      ) : short.status === 'error' ? (
                                        <ErrorBox>{short.error}</ErrorBox>
                                      ) : short.path ? (
                                        <>
                                          {short.clip_reason && (
                                            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Por qué se eligió</p>
                                              <p className="text-sm text-gray-300">{short.clip_reason}</p>
                                              {short.clip_start !== undefined && short.clip_duration !== undefined && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                  Corte aprox. {Math.round(short.clip_start)}s · duración {Math.round(short.clip_duration)}s
                                                </p>
                                              )}
                                            </div>
                                          )}
                                          {short.local_file_exists ? (
                                            <>
                                              {/* Preview vídeo vertical */}
                                              <div className="flex justify-center">
                                                <video controls className="rounded-xl border border-white/10"
                                                  style={{ width: 270, height: 480 }} src={short.path} key={short.path} />
                                              </div>
                                              <div className="flex justify-center">
                                                <a href={short.path} download className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                                                  <DownloadIcon /> Descargar MP4
                                                </a>
                                              </div>
                                            </>
                                          ) : short.youtube_url ? (
                                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-center">
                                              <p className="text-sm font-medium text-emerald-300">Short subido a YouTube</p>
                                              <p className="text-xs text-gray-500 mt-1">El MP4 local se eliminó para liberar espacio.</p>
                                            </div>
                                          ) : (
                                            <ErrorBox>El archivo local del Short no existe. Regenera el Short para volver a subirlo.</ErrorBox>
                                          )}

                                          {/* Si ya está publicado/programado */}
                                          {short.youtube_url && (
                                            <div className={`flex items-center gap-3 p-3 rounded-xl border ${short.scheduled_at ? 'bg-orange-500/5 border-orange-500/15' : 'bg-pink-500/5 border-pink-500/15'}`}>
                                              <svg className={`w-5 h-5 shrink-0 ${short.scheduled_at ? 'text-orange-400' : 'text-pink-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                                              </svg>
                                              <div>
                                                {short.scheduled_at ? (
                                                  <p className="text-sm text-orange-300">Programado · {formatDate(short.scheduled_at)}</p>
                                                ) : (
                                                  <p className="text-sm text-white font-medium">Short publicado</p>
                                                )}
                                                <a href={short.youtube_url} target="_blank" rel="noopener noreferrer" className="text-xs text-pink-400 hover:text-pink-300 transition-colors">Ver en YouTube</a>
                                              </div>
                                            </div>
                                          )}

                                          {/* Formulario de subida (si no está en YouTube todavía) */}
                                          {!short.youtube_url && short.local_file_exists && form && (
                                            <>
                                              {short.youtube_status === 'processing' || form.ytState === 'loading' ? (
                                                <Processing label="Subiendo Short a YouTube..." />
                                              ) : (
                                                <div className="space-y-3">
                                                  <p className="text-xs text-gray-500 uppercase tracking-wider">Subir a YouTube</p>
                                                  <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Título</label>
                                                    <input type="text" value={form.titulo}
                                                      onChange={(e) => setShortForms((p) => ({ ...p, [short.seccion]: { ...p[short.seccion], titulo: e.target.value } }))}
                                                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500/50 transition-colors"
                                                      placeholder="Título del Short" maxLength={100} />
                                                    <p className="text-xs text-gray-700 mt-0.5">{form.titulo.length}/100</p>
                                                  </div>
                                                  <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Descripción</label>
                                                    <textarea value={form.desc}
                                                      onChange={(e) => setShortForms((p) => ({ ...p, [short.seccion]: { ...p[short.seccion], desc: e.target.value } }))}
                                                      rows={2} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500/50 transition-colors resize-none" />
                                                  </div>
                                                  <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Tags</label>
                                                    <input type="text" value={form.tags}
                                                      onChange={(e) => setShortForms((p) => ({ ...p, [short.seccion]: { ...p[short.seccion], tags: e.target.value } }))}
                                                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500/50 transition-colors" placeholder="tag1, tag2" />
                                                  </div>
                                                  <div>
                                                    <label className="block text-xs text-gray-600 mb-1">
                                                      Programar publicación
                                                      <span className="text-gray-700 ml-1">
                                                        (sugerido: +{short.seccion * 2} días)
                                                      </span>
                                                    </label>
                                                    <input type="datetime-local" value={form.publishAt}
                                                      onChange={(e) => setShortForms((p) => ({ ...p, [short.seccion]: { ...p[short.seccion], publishAt: e.target.value } }))}
                                                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors [color-scheme:dark]" />
                                                    {form.publishAt && (
                                                      <p className="mt-1 text-xs text-orange-400">
                                                        Privado hasta {formatDate(new Date(form.publishAt).toISOString())}
                                                      </p>
                                                    )}
                                                    {!form.publishAt && (
                                                      <p className="mt-1 text-xs text-gray-600">Vacío = publicar inmediatamente</p>
                                                    )}
                                                  </div>
                                                  <ActionButton
                                                    label="Subir Short a YouTube"
                                                    loadingLabel="Iniciando subida..."
                                                    state={form.ytState}
                                                    onClick={() => handleUploadShort(short.seccion)}
                                                    color="pink"
                                                    info="YouTube Shorts · 1080×1920 · <60s"
                                                  />
                                                  {(form.ytError || short.youtube_error) && <ErrorBox>{form.ytError || short.youtube_error}</ErrorBox>}
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </>
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </Section>
                  )}
                  {!selectedScript.video_path && (
                    <Section title="YouTube Shorts" icon="short" complete={false}>
                      <Pending>Primero genera el vídeo</Pending>
                    </Section>
                  )}
                  </>)}

                  {detailTab === 'pipeline' && (<>
                  {/* ── Miniatura ── */}
                  <Section title="Miniatura YouTube" icon="thumbnail" complete={!!selectedScript.thumbnail_path}>
                    {selectedScript.thumbnail_status === 'processing' || thumbnailState === 'loading' ? (
                      <Processing label="Generando miniatura con FLUX.1 + Sharp..." />
                    ) : selectedScript.thumbnail_path ? (
                      <div className="space-y-4">
                        <div className="rounded-xl overflow-hidden border border-white/10" style={{ aspectRatio: '16/9', maxWidth: 320 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`${selectedScript.thumbnail_path}?t=${Date.now()}`} alt="Miniatura" className="w-full h-full object-cover" key={selectedScript.thumbnail_path} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Editar textos</p>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Texto principal (rojo)</label>
                            <input type="text" value={thumbnailTexts.texto_principal} onChange={(e) => setThumbnailTexts((p) => ({ ...p, texto_principal: e.target.value }))}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors font-mono uppercase" placeholder="EL ÁNGEL DE LA MUERTE" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Subtítulo (blanco)</label>
                            <input type="text" value={thumbnailTexts.subtitulo} onChange={(e) => setThumbnailTexts((p) => ({ ...p, subtitulo: e.target.value }))}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors font-mono uppercase" placeholder="NADIE LO DETUVO" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Contexto (gris)</label>
                            <input type="text" value={thumbnailTexts.contexto} onChange={(e) => setThumbnailTexts((p) => ({ ...p, contexto: e.target.value }))}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors font-mono uppercase" placeholder="AUSCHWITZ, 1943" />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={handleRecomposeThumbnail} disabled={recomposeState === 'loading' || !thumbnailTexts.texto_principal}
                            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
                            {recomposeState === 'loading' && <SpinIcon />}
                            {recomposeState === 'loading' ? 'Recomponiendo...' : 'Recomponer'}
                          </button>
                          <button onClick={handleGenerateThumbnail} disabled={thumbnailState !== 'idle'}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-60 disabled:cursor-not-allowed text-gray-300 text-sm font-medium rounded-lg transition-colors">
                            Regenerar miniatura
                          </button>
                          <a href={selectedScript.thumbnail_path} download className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors">
                            <DownloadIcon /> JPG
                          </a>
                        </div>
                      </div>
                    ) : (
                      <ActionButton label="Generar miniatura" loadingLabel="Iniciando..." state={thumbnailState} onClick={handleGenerateThumbnail} color="orange" info="FLUX.1 + Sharp · Bebas Neue · 1280×720" />
                    )}
                    {(thumbnailError || (selectedScript.thumbnail_status === 'error' && selectedScript.thumbnail_error)) && (
                      <ErrorBox>{thumbnailError || selectedScript.thumbnail_error}</ErrorBox>
                    )}
                  </Section>
                  </>)}

                  {detailTab === 'guion' && (
                    <div className="space-y-4 pt-2 border-t border-white/5">
                      <p className="text-xs text-gray-600 uppercase tracking-wider">Guión</p>
                      {selectedScript.guion_json.map((section, idx) => (
                        <div key={idx} className={`bg-white/[0.03] border border-white/8 border-l-4 ${SECTION_COLORS[idx] ?? 'border-l-gray-500'} rounded-xl p-5`}>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-white text-sm">{section.title}</h3>
                            <span className="text-xs text-gray-600">{section.content.split(/\s+/).filter(Boolean).length} palabras</span>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{section.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
        )}
      </div>
    </StudioLayout>
  );
}

// ── Badge estado de un Short ──
function ShortStatusBadge({
  status, ytStatus, scheduledAt, youtubeUrl,
}: {
  status: string; ytStatus?: string; scheduledAt?: string | null; youtubeUrl?: string;
}) {
  if (youtubeUrl && scheduledAt) return (
    <span className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">Programado</span>
  );
  if (youtubeUrl) return (
    <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Publicado</span>
  );
  if (ytStatus === 'processing') return (
    <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full animate-pulse">Subiendo...</span>
  );
  if (status === 'ready') return (
    <span className="text-xs text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">Generado</span>
  );
  if (status === 'processing') return (
    <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full animate-pulse">Generando...</span>
  );
  if (status === 'error') return (
    <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Error</span>
  );
  return <span className="text-xs text-gray-600">Pendiente</span>;
}

// ── Componentes auxiliares ──

function StatDot({ color, title }: { color: string; title: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-400', amber: 'bg-amber-400', violet: 'bg-violet-400',
    red: 'bg-red-400', pink: 'bg-pink-400', rose: 'bg-rose-400', orange: 'bg-orange-400',
  };
  return <span className={`w-2 h-2 rounded-full ${colors[color] ?? 'bg-gray-400'}`} title={title} />;
}

function ProductionStatusBadge({ label, tone }: { label: string; tone: 'ready' | 'processing' | 'error' | 'published' | 'pending' }) {
  const colors = {
    ready: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
    processing: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
    error: 'text-red-300 bg-red-500/10 border-red-500/20',
    published: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    pending: 'text-gray-500 bg-white/[0.03] border-white/8',
  };
  return (
    <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border ${colors[tone]}`}>
      {label}
    </span>
  );
}

function Section({ title, icon, complete, children }: { title: string; icon: string; complete: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${complete ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
          {complete ? (
            <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
      {children}
    </div>
  );
}

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-600 hover:bg-emerald-700',
  amber: 'bg-amber-600 hover:bg-amber-700',
  violet: 'bg-violet-600 hover:bg-violet-700',
  red: 'bg-red-600 hover:bg-red-700',
  pink: 'bg-pink-600 hover:bg-pink-700',
  orange: 'bg-orange-600 hover:bg-orange-700',
};

function ActionButton({ label, loadingLabel, state, onClick, color, info }: {
  label: string; loadingLabel: string; state: ActionState; onClick: () => void; color: string; info: string;
}) {
  const isLoading = state === 'loading';
  return (
    <div className="space-y-1.5">
      <button onClick={onClick} disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2.5 ${COLOR_MAP[color] ?? 'bg-gray-600 hover:bg-gray-700'} disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors`}>
        {isLoading && <SpinIcon />}
        {isLoading ? loadingLabel : label}
      </button>
      <p className="text-xs text-gray-600">{info}</p>
    </div>
  );
}

function ImagesProgress({ progress, total }: { progress: number; total: number }) {
  const hasTotal = total > 0;
  const pct = hasTotal ? Math.round((progress / total) * 100) : 0;
  const label = hasTotal && progress > 0 ? `Generando imagen ${progress} de ${total}...` : hasTotal ? `Preparando ${total} imágenes...` : 'Generando imágenes...';
  return (
    <div className="space-y-2.5 py-1">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
        <p className="text-sm text-amber-400 font-medium">{label}</p>
        {hasTotal && <span className="ml-auto text-xs text-gray-500 font-mono">{pct}%</span>}
      </div>
      {hasTotal && (
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      )}
      <p className="text-xs text-gray-700">Comprobando cada 5s...</p>
    </div>
  );
}

function VideoProgress({ progress, stage }: { progress: number; stage?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress || 0)));
  return (
    <div className="space-y-2.5 py-1">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin shrink-0" />
        <p className="text-sm text-violet-300 font-medium">{stage || 'Montando vídeo...'}</p>
        <span className="ml-auto text-xs text-gray-500 font-mono">{pct}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-violet-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-700">Comprobando cada 5s...</p>
    </div>
  );
}

function Processing({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-7 h-7 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin shrink-0" />
      <div>
        <p className="text-sm text-yellow-400 font-medium">{label}</p>
        <p className="text-xs text-gray-600 mt-0.5">Comprobando cada 5s...</p>
      </div>
    </div>
  );
}

function Pending({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 text-sm">{children}</p>;
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono break-all">
      {children}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function SpinIcon() {
  return (
    <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function MiniSpinIcon() {
  return (
    <svg className="w-3 h-3 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}
