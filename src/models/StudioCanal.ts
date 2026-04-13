import mongoose, { Schema, Document, Model } from 'mongoose';

export interface YoutubeTokensCanal {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expiry_date: number;
  scope: string;
  canal_nombre?: string;
  canal_id_yt?: string;
}

export interface CanalConfig {
  voz_motor: 'elevenlabs' | 'edge-tts';
  voz_id: string;
  imagen_motor: 'huggingface' | 'freepik';
  system_prompt_guion: string;
  tono: string;
  idioma: string;
}

export interface IStudioCanal extends Document {
  workspace_id: string;
  nombre: string;
  descripcion: string;
  nicho: string;
  youtube_tokens: YoutubeTokensCanal | null;
  config: CanalConfig;
  creado_en: Date;
}

const StudioCanalSchema = new Schema<IStudioCanal>({
  workspace_id: { type: String, required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, default: '' },
  nicho: { type: String, default: '' },
  youtube_tokens: { type: Schema.Types.Mixed, default: null },
  config: {
    voz_motor: { type: String, enum: ['elevenlabs', 'edge-tts'], default: 'elevenlabs' },
    voz_id: { type: String, default: '' },
    imagen_motor: { type: String, enum: ['huggingface', 'freepik'], default: 'freepik' },
    system_prompt_guion: { type: String, default: '' },
    tono: { type: String, default: '' },
    idioma: { type: String, default: 'es-ES' },
  },
  creado_en: { type: Date, default: Date.now },
});

const StudioCanal: Model<IStudioCanal> =
  mongoose.models.StudioCanal ||
  mongoose.model<IStudioCanal>('StudioCanal', StudioCanalSchema);

export default StudioCanal;
