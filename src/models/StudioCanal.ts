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
  voz_motor: 'elevenlabs' | 'edge-tts' | 'gemini-tts';
  voz_id: string;
  imagen_motor: 'huggingface' | 'freepik' | 'comfyui';
  llm_motor: 'claude' | 'openai' | 'openrouter' | 'gemini';
  openai_api_key: string;
  openrouter_api_key: string;
  gemini_api_key: string;
  system_prompt_guion: string;
  tono: string;
  idioma: string;
  comfyui_api_key?: string;
  comfyui_workflow_overrides?: {
    thumbnail?: string;
    cartel?: string;
    fondo?: string;
    video?: string;
    edit_image?: string;
    dj_photo?: string;
  };
  thumbnail_accent_color?: string;
  thumbnail_style_prompt?: string;
  icono?: string;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
  notificaciones?: {
    alerta_1000_vistas: boolean;
    alerta_despegando: boolean;
    alerta_short_viral: boolean;
    alerta_suscriptores: boolean;
    alerta_calendario_vacio: boolean;
  };
}

export interface IStudioCanal extends Document {
  workspace_id: string;
  nombre: string;
  descripcion: string;
  nicho: string;
  pipeline_tipo: 'narrativo' | 'musica_ambiental';
  logo_url: string;
  youtube_tokens: YoutubeTokensCanal | null;
  config: CanalConfig;
  creado_en: Date;
}

const StudioCanalSchema = new Schema<IStudioCanal>({
  workspace_id: { type: String, required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, default: '' },
  nicho: { type: String, default: '' },
  pipeline_tipo: { type: String, enum: ['narrativo', 'musica_ambiental'], default: 'narrativo' },
  logo_url: { type: String, default: '' },
  youtube_tokens: { type: Schema.Types.Mixed, default: null },
  config: {
    voz_motor: { type: String, enum: ['elevenlabs', 'edge-tts', 'gemini-tts'], default: 'elevenlabs' },
    voz_id: { type: String, default: '' },
    imagen_motor: { type: String, enum: ['huggingface', 'freepik', 'comfyui'], default: 'freepik' },
    llm_motor: { type: String, enum: ['claude', 'openai', 'openrouter', 'gemini'], default: 'claude' },
    openai_api_key: { type: String, default: '' },
    openrouter_api_key: { type: String, default: '' },
    gemini_api_key: { type: String, default: '' },
    system_prompt_guion: { type: String, default: '' },
    tono: { type: String, default: '' },
    idioma: { type: String, default: 'es-ES' },
    comfyui_api_key: { type: String, default: '' },
    comfyui_workflow_overrides: { type: Schema.Types.Mixed, default: {} },
    thumbnail_accent_color: { type: String, default: '#CC0000' },
    thumbnail_style_prompt: { type: String, default: '' },
    icono: { type: String, default: '' },
    telegram_bot_token: { type: String, default: '' },
    telegram_chat_id: { type: String, default: '' },
    notificaciones: {
      alerta_1000_vistas: { type: Boolean, default: true },
      alerta_despegando: { type: Boolean, default: true },
      alerta_short_viral: { type: Boolean, default: true },
      alerta_suscriptores: { type: Boolean, default: false },
      alerta_calendario_vacio: { type: Boolean, default: true },
    },
  },
  creado_en: { type: Date, default: Date.now },
});

const StudioCanal: Model<IStudioCanal> =
  mongoose.models.StudioCanal ||
  mongoose.model<IStudioCanal>('StudioCanal', StudioCanalSchema);

export default StudioCanal;
