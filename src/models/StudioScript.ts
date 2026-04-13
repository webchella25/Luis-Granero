import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ScriptSection {
  title: string;
  content: string;
}

export type Tono = 'oscuro' | 'divulgativo' | 'misterioso';
export type Duracion = '12' | '15' | '18';

export type VideoStatus = 'idle' | 'processing' | 'ready' | 'error';
export type YoutubeStatus = 'idle' | 'processing' | 'ready' | 'error';
export type AudioEngine = 'elevenlabs' | 'edge-tts';

export interface ShortEntry {
  seccion: number;
  titulo?: string;
  path?: string | null;
  status: 'idle' | 'processing' | 'ready' | 'error';
  error?: string;
  youtube_id?: string;
  youtube_url?: string;
  youtube_status?: 'idle' | 'processing' | 'ready' | 'error';
  youtube_error?: string;
  scheduled_at?: Date | null;
}

export interface IStudioScript extends Document {
  personaje: string;
  epoca: string;
  tono: Tono;
  duracion: Duracion;
  guion_json: ScriptSection[];
  audio_path?: string;
  audio_engine?: AudioEngine;
  images_paths?: string[];
  images_count?: number;
  images_duration?: number;
  images_status?: 'idle' | 'processing' | 'ready' | 'error';
  images_progress?: number;
  images_error?: string;
  video_path?: string;
  video_status?: VideoStatus;
  video_error?: string;
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
  descripcion_seo?: string;
  tags_seo?: string[];
  titulos_seo_shorts?: string[]; // 3 títulos: [hook, ascenso, lado_oscuro]
  seo_titulo_seleccionado?: number;
  // Hooks alternativos
  hooks_seo?: { estilo: string; texto: string }[];
  hook_seleccionado?: number | null;
  hook_original?: string; // backup del content original de la sección 0
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
    path: { type: String, default: null },
    status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
    error: { type: String },
    youtube_id: { type: String },
    youtube_url: { type: String },
    youtube_status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
    youtube_error: { type: String },
    scheduled_at: { type: Date, default: null },
  },
  { _id: false }
);

const StudioScriptSchema = new Schema<IStudioScript>({
  personaje: { type: String, required: true, trim: true },
  epoca: { type: String, required: true, trim: true },
  tono: { type: String, required: true, enum: ['oscuro', 'divulgativo', 'misterioso'] },
  duracion: { type: String, required: true, enum: ['12', '15', '18'] },
  guion_json: { type: [ScriptSectionSchema], required: true },
  audio_path: { type: String },
  audio_engine: { type: String, enum: ['elevenlabs', 'edge-tts'] },
  images_paths: { type: [String] },
  images_count: { type: Number },
  images_duration: { type: Number },
  images_status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
  images_progress: { type: Number, default: 0 },
  images_error: { type: String },
  video_path: { type: String },
  video_status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
  video_error: { type: String },
  youtube_id: { type: String },
  youtube_url: { type: String },
  youtube_status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
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
  youtube_short_status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
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
  descripcion_seo: { type: String },
  tags_seo: { type: [String], default: [] },
  titulos_seo_shorts: { type: [String], default: [] },
  seo_titulo_seleccionado: { type: Number, default: 0 },
  hooks_seo: { type: [{ estilo: String, texto: String }], default: [] },
  hook_seleccionado: { type: Number, default: null },
  hook_original: { type: String },
  canal_id: { type: String, index: true, default: null },
  creado_en: { type: Date, default: Date.now },
});

const StudioScript: Model<IStudioScript> =
  mongoose.models.StudioScript ||
  mongoose.model<IStudioScript>('StudioScript', StudioScriptSchema);

export default StudioScript;
