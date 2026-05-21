import mongoose, { Schema, Document, Model } from 'mongoose';

export type DjSessionEstado =
  | 'pendiente'
  | 'queued'
  | 'audio_subido'
  | 'generando_video'
  | 'generating_video'
  | 'listo'
  | 'video_ready'
  | 'render_failed'
  | 'publicando'
  | 'publishing_youtube'
  | 'youtube_failed'
  | 'publicado'
  | 'published'
  | 'error';

export type DjSessionVisibility = 'public' | 'unlisted' | 'private';
export type DjSessionVisualMode = 'static_cover' | 'video_loop' | 'generated_visual';
export type DjSessionVisualStatus = 'idle' | 'generating' | 'ready' | 'error';
export type DjSessionVisualOutputKind = 'image' | 'video';
export type DjSessionVisualGenerationType = 'native_video' | 'image_to_loop' | 'static_image';
export type DjSessionOutputFormat = '16:9' | '9:16' | '1:1';

export interface IStudioDjSession extends Document {
  workspace_id: string;
  canal_id: string;
  dj_id: string;
  user_id: string;
  titulo: string;
  descripcion: string;
  audio_path: string;
  audio_original_name: string;
  audio_mime_type: string;
  audio_size: number;
  audio_duration: number;
  cover_image_path: string | null;
  cover_image_original_name: string | null;
  cover_image_mime_type: string | null;
  cover_image_size: number;
  logo_path: string | null;
  visual_mode: DjSessionVisualMode;
  visual_prompt: string;
  visual_status: DjSessionVisualStatus;
  visual_error: string | null;
  visual_provider_attempted: string | null;
  visual_fallback_reason: string | null;
  visual_provider_attempts: Array<{
    provider: string;
    endpoint?: string | null;
    model?: string | null;
    status?: number | null;
    error: string;
    supported?: boolean;
  }>;
  visual_output_kind: DjSessionVisualOutputKind | null;
  visual_generation_type: DjSessionVisualGenerationType | null;
  visual_model: string | null;
  visual_video_path: string | null;
  visual_video_original_name: string | null;
  visual_video_mime_type: string | null;
  visual_video_size: number;
  visual_video_duration: number;
  visual_image_path: string | null;
  visual_provider: string | null;
  visual_workflow: string | null;
  visual_generated_at: Date | null;
  video_path: string | null;
  video_file_path: string | null;
  render_job_id: string | null;
  render_pid: number | null;
  render_started_at: Date | null;
  render_finished_at: Date | null;
  render_locked_until: Date | null;
  render_error: string | null;
  render_overlays: boolean;
  video_size: number;
  video_duration: number;
  video_generated_at: Date | null;
  youtube_id: string | null;
  youtube_url: string | null;
  youtube_upload_url: string | null;
  youtube_upload_started_at: Date | null;
  youtube_upload_finished_at: Date | null;
  youtube_upload_locked_until: Date | null;
  youtube_upload_job_id: string | null;
  youtube_upload_bytes_sent: number;
  youtube_upload_total_bytes: number;
  youtube_upload_error: string | null;
  youtube_upload_attempts: number;
  youtube_uploaded_at: Date | null;
  estado: DjSessionEstado;
  progreso: number;
  error: string | null;
  tracklist: string;
  bpm: number | null;
  genre: string;
  output_format: DjSessionOutputFormat;
  tags: string[];
  visibility: DjSessionVisibility;
  scheduled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const StudioDjSessionSchema = new Schema<IStudioDjSession>(
  {
    workspace_id: { type: String, required: true, index: true },
    canal_id: { type: String, required: true, index: true },
    dj_id: { type: String, default: '' },
    user_id: { type: String, default: '' },
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },
    audio_path: { type: String, default: '' },
    audio_original_name: { type: String, default: '' },
    audio_mime_type: { type: String, default: '' },
    audio_size: { type: Number, default: 0 },
    audio_duration: { type: Number, default: 0 },
    cover_image_path: { type: String, default: null },
    cover_image_original_name: { type: String, default: null },
    cover_image_mime_type: { type: String, default: null },
    cover_image_size: { type: Number, default: 0 },
    logo_path: { type: String, default: null },
    visual_mode: { type: String, enum: ['static_cover', 'video_loop', 'generated_visual'], default: 'static_cover', index: true },
    visual_prompt: { type: String, default: '' },
    visual_status: { type: String, enum: ['idle', 'generating', 'ready', 'error'], default: 'idle', index: true },
    visual_error: { type: String, default: null },
    visual_provider_attempted: { type: String, default: null },
    visual_fallback_reason: { type: String, default: null },
    visual_provider_attempts: { type: Schema.Types.Mixed, default: [] },
    visual_output_kind: { type: String, enum: ['image', 'video'], default: null, index: true },
    visual_generation_type: { type: String, enum: ['native_video', 'image_to_loop', 'static_image'], default: null, index: true },
    visual_model: { type: String, default: null },
    visual_video_path: { type: String, default: null },
    visual_video_original_name: { type: String, default: null },
    visual_video_mime_type: { type: String, default: null },
    visual_video_size: { type: Number, default: 0 },
    visual_video_duration: { type: Number, default: 0 },
    visual_image_path: { type: String, default: null },
    visual_provider: { type: String, default: null },
    visual_workflow: { type: String, default: null },
    visual_generated_at: { type: Date, default: null },
    video_path: { type: String, default: null },
    video_file_path: { type: String, default: null },
    render_job_id: { type: String, default: null },
    render_pid: { type: Number, default: null },
    render_started_at: { type: Date, default: null },
    render_finished_at: { type: Date, default: null },
    render_locked_until: { type: Date, default: null, index: true },
    render_error: { type: String, default: null },
    render_overlays: { type: Boolean, default: false },
    video_size: { type: Number, default: 0 },
    video_duration: { type: Number, default: 0 },
    video_generated_at: { type: Date, default: null },
    youtube_id: { type: String, default: null },
    youtube_url: { type: String, default: null },
    youtube_upload_url: { type: String, default: null },
    youtube_upload_started_at: { type: Date, default: null },
    youtube_upload_finished_at: { type: Date, default: null },
    youtube_upload_locked_until: { type: Date, default: null, index: true },
    youtube_upload_job_id: { type: String, default: null },
    youtube_upload_bytes_sent: { type: Number, default: 0 },
    youtube_upload_total_bytes: { type: Number, default: 0 },
    youtube_upload_error: { type: String, default: null },
    youtube_upload_attempts: { type: Number, default: 0 },
    youtube_uploaded_at: { type: Date, default: null },
    estado: {
      type: String,
      enum: [
        'pendiente',
        'queued',
        'audio_subido',
        'generando_video',
        'generating_video',
        'listo',
        'video_ready',
        'render_failed',
        'publicando',
        'publishing_youtube',
        'youtube_failed',
        'publicado',
        'published',
        'error',
      ],
      default: 'pendiente',
      index: true,
    },
    progreso: { type: Number, default: 0 },
    error: { type: String, default: null },
    tracklist: { type: String, default: '' },
    bpm: { type: Number, default: null },
    genre: { type: String, default: '' },
    output_format: { type: String, enum: ['16:9', '9:16', '1:1'], default: '16:9', index: true },
    tags: { type: [String], default: [] },
    visibility: { type: String, enum: ['public', 'unlisted', 'private'], default: 'unlisted' },
    scheduled_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

StudioDjSessionSchema.index({ canal_id: 1, created_at: -1 });
StudioDjSessionSchema.index({ workspace_id: 1, created_at: -1 });

const StudioDjSession: Model<IStudioDjSession> =
  mongoose.models.StudioDjSession ||
  mongoose.model<IStudioDjSession>('StudioDjSession', StudioDjSessionSchema);

export default StudioDjSession;
