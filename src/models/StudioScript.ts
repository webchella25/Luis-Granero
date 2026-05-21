import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ScriptSection {
  title: string;
  content: string;
}

export interface GiroNarrativo {
  seccion: number;
  tipo: 'GIRO' | 'REVELACION' | 'SOSPECHA' | 'IMPACTO';
  frase: string;
  timestamp_estimado?: string;
}

export interface ClipEntry {
  timestamp_estimado: string;
  texto: string;
  tipo: 'hook' | 'giro' | 'impacto' | 'revelacion';
  duracion: 15 | 30 | 45;
  viralidad: number;
}

export interface ShortEstructurado {
  seccion: number;
  hook: string;
  desarrollo: string;
  cierre: string;
  duracion_estimada: number;
}

export interface Plataformas {
  youtube: string;
  tiktok: string;
  reels: string;
}

export type Tono = string;
export type Duracion = string;

export type VideoStatus = 'idle' | 'processing' | 'ready' | 'error';
export type YoutubeStatus = 'idle' | 'processing' | 'ready' | 'uploaded' | 'completed' | 'error';
export type AudioEngine = 'elevenlabs' | 'edge-tts' | 'gemini-tts' | 'nvidia-tts' | 'azure-tts' | 'openai-tts';

export interface ShortEntry {
  seccion: number;
  titulo?: string;
  descripcion?: string;
  tags?: string[];
  path?: string | null;
  status: 'idle' | 'processing' | 'ready' | 'error';
  error?: string;
  hook_visual?: { linea1: string; linea2: string };
  source_seccion?: number;
  clip_start?: number;
  clip_duration?: number;
  clip_score?: number;
  clip_reason?: string;
  youtube_id?: string;
  youtube_url?: string;
  youtube_status?: YoutubeStatus;
  youtube_error?: string;
  scheduled_at?: Date | null;
  local_deleted_at?: Date | null;
}

export interface AudioVersion {
  id: string;
  path: string;
  engine: AudioEngine;
  label?: string;
  created_at: Date;
  is_active: boolean;
  section_durations?: number[];
  meta?: Record<string, unknown>;
}

export interface IStudioScript extends Document {
  personaje: string;
  epoca: string;
  tono: Tono;
  duracion: Duracion;
  guion_json: ScriptSection[];
  audio_path?: string;
  audio_engine?: AudioEngine;
  audio_status?: 'idle' | 'processing' | 'ready' | 'error';
  audio_error?: string;
  audio_section_durations?: number[];
  audio_versions?: AudioVersion[];
  images_paths?: string[];
  images_count?: number;
  images_duration?: number;
  images_status?: 'idle' | 'processing' | 'ready' | 'error';
  images_progress?: number;
  images_error?: string;
  video_path?: string;
  video_status?: VideoStatus;
  video_progress?: number;
  video_stage?: string;
  video_error?: string;
  video_local_deleted_at?: Date | null;
  youtube_id?: string;
  youtube_url?: string;
  youtube_status?: YoutubeStatus;
  youtube_error?: string;
  youtube_scheduled_at?: Date | null;
  youtube_published_at?: Date | null;
  // New multi-short system
  shorts?: ShortEntry[];
  // Legacy fields (kept for backward compat with existing records)
  short_path?: string;
  short_status?: 'idle' | 'processing' | 'ready' | 'error';
  short_error?: string;
  youtube_short_id?: string;
  youtube_short_url?: string;
  youtube_short_status?: YoutubeStatus;
  youtube_short_error?: string;
  // Thumbnail
  thumbnail_path?: string;
  thumbnail_base_path?: string;
  thumbnail_status?: 'idle' | 'processing' | 'ready' | 'error';
  thumbnail_error?: string;
  thumbnail_texts?: {
    texto_principal: string;
    subtitulo: string;
    contexto: string;
  };
  // SEO para YouTube
  titulos_seo?: string[];
  titulo_miniatura_seo?: string;
  descripcion_seo?: string;
  tags_seo?: string[];
  titulos_seo_shorts?: string[];
  shorts_seo?: { titulo_a: string; titulo_b: string; desc: string; tags: string[] }[];
  seo_titulo_seleccionado?: number;
  // Hooks alternativos
  hooks_seo?: { estilo: string; texto: string }[];
  hook_seleccionado?: number | null;
  hook_original?: string; // backup del content original de la sección 0
  // Multi-output narrative layers
  giros_detectados?: GiroNarrativo[];
  clips?: ClipEntry[];
  shorts_estructurados?: ShortEstructurado[];
  plataformas?: Plataformas;
  nivel_tension?: number[];
  retention_warnings?: string[];
  canal_id?: string | null;
  creado_en: Date;
}

const ScriptSectionSchema = new Schema<ScriptSection>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: false }
);

const ShortEntrySchema = new Schema<ShortEntry>(
  {
    seccion: { type: Number, required: true },
    titulo: { type: String },
    descripcion: { type: String },
    tags: { type: [String], default: undefined },
    path: { type: String, default: null },
    status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
    error: { type: String },
    hook_visual: {
      linea1: { type: String },
      linea2: { type: String },
    },
    source_seccion: { type: Number },
    clip_start: { type: Number },
    clip_duration: { type: Number },
    clip_score: { type: Number },
    clip_reason: { type: String },
    youtube_id: { type: String },
    youtube_url: { type: String },
    youtube_status: { type: String, enum: ['idle', 'processing', 'ready', 'uploaded', 'completed', 'error'], default: 'idle' },
    youtube_error: { type: String },
    scheduled_at: { type: Date, default: null },
    local_deleted_at: { type: Date, default: null },
  },
  { _id: false }
);

const AudioVersionSchema = new Schema<AudioVersion>(
  {
    id: { type: String, required: true },
    path: { type: String, required: true },
    engine: { type: String, enum: ['elevenlabs', 'edge-tts', 'gemini-tts', 'nvidia-tts', 'azure-tts', 'openai-tts'], required: true },
    label: { type: String },
    created_at: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: false },
    section_durations: { type: [Number], default: undefined },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const StudioScriptSchema = new Schema<IStudioScript>({
  personaje: { type: String, required: true, trim: true },
  epoca: { type: String, required: true, trim: true },
  tono: { type: String, required: true },
  duracion: { type: String, required: true },
  guion_json: { type: [ScriptSectionSchema], required: true },
  audio_path: { type: String },
  audio_engine: { type: String, enum: ['elevenlabs', 'edge-tts', 'gemini-tts', 'nvidia-tts', 'azure-tts', 'openai-tts'] },
  audio_status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
  audio_error: { type: String },
  audio_section_durations: { type: [Number], default: undefined },
  audio_versions: { type: [AudioVersionSchema], default: [] },
  images_paths: { type: [String] },
  images_count: { type: Number },
  images_duration: { type: Number },
  images_status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
  images_progress: { type: Number, default: 0 },
  images_error: { type: String },
  video_path: { type: String },
  video_status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
  video_progress: { type: Number, default: 0 },
  video_stage: { type: String },
  video_error: { type: String },
  video_local_deleted_at: { type: Date, default: null },
  youtube_id: { type: String },
  youtube_url: { type: String },
  youtube_status: { type: String, enum: ['idle', 'processing', 'ready', 'uploaded', 'completed', 'error'], default: 'idle' },
  youtube_error: { type: String },
  youtube_scheduled_at: { type: Date, default: null },
  youtube_published_at: { type: Date, default: null },
  shorts: { type: [ShortEntrySchema], default: [] },
  // Legacy
  short_path: { type: String },
  short_status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
  short_error: { type: String },
  youtube_short_id: { type: String },
  youtube_short_url: { type: String },
  youtube_short_status: { type: String, enum: ['idle', 'processing', 'ready', 'uploaded', 'completed', 'error'], default: 'idle' },
  youtube_short_error: { type: String },
  thumbnail_path: { type: String },
  thumbnail_base_path: { type: String },
  thumbnail_status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
  thumbnail_error: { type: String },
  thumbnail_texts: {
    texto_principal: { type: String },
    subtitulo: { type: String },
    contexto: { type: String },
  },
  titulos_seo: { type: [String], default: [] },
  titulo_miniatura_seo: { type: String },
  descripcion_seo: { type: String },
  tags_seo: { type: [String], default: [] },
  titulos_seo_shorts: { type: [String], default: [] },
  shorts_seo: {
    type: [{ titulo_a: String, titulo_b: String, desc: String, tags: [String] }],
    default: [],
  },
  seo_titulo_seleccionado: { type: Number, default: 0 },
  hooks_seo: { type: [{ estilo: String, texto: String }], default: [] },
  hook_seleccionado: { type: Number, default: null },
  hook_original: { type: String },
  // Multi-output narrative layers
  giros_detectados: {
    type: [{ seccion: Number, tipo: String, frase: String, timestamp_estimado: String }],
    default: [],
  },
  clips: {
    type: [{ timestamp_estimado: String, texto: String, tipo: String, duracion: Number, viralidad: Number }],
    default: [],
  },
  shorts_estructurados: {
    type: [{ seccion: Number, hook: String, desarrollo: String, cierre: String, duracion_estimada: Number }],
    default: [],
  },
  plataformas: {
    youtube: { type: String },
    tiktok: { type: String },
    reels: { type: String },
  },
  nivel_tension: { type: [Number], default: undefined },
  retention_warnings: { type: [String], default: [] },
  canal_id: { type: String, index: true, default: null },
  creado_en: { type: Date, default: Date.now },
});

const StudioScript: Model<IStudioScript> =
  mongoose.models.StudioScript ||
  mongoose.model<IStudioScript>('StudioScript', StudioScriptSchema);

export default StudioScript;
