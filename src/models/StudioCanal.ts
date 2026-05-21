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
  voz_motor: 'elevenlabs' | 'edge-tts' | 'gemini-tts' | 'nvidia-tts' | 'azure-tts' | 'openai-tts';
  voz_id: string;
  imagen_motor: 'huggingface' | 'freepik' | 'comfyui';
  llm_motor: 'claude' | 'openai' | 'openrouter' | 'gemini';
  openai_api_key: string;
  openai_tts_api_key: string;
  openai_tts_model: string;
  openai_tts_voice: string;
  openai_tts_instructions: string;
  openai_tts_speed: number;
  openrouter_api_key: string;
  gemini_api_key: string;
  nvidia_api_key: string;
  nvidia_voice: string;
  azure_speech_key: string;
  azure_speech_region: string;
  azure_speech_voice: string;
  azure_speech_style: string;
  azure_speech_rate: string;
  azure_speech_pitch: string;
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
  thumbnail_mode?: 'classic' | 'ai_complete';
  imagen_referencia_url?: string;
  secciones_personalizadas?: string;
  tipos_guion?: string;
  tavily_api_key?: string;
  muapi_api_key?: string;
  hf_api_key?: string;
  huggingface_video_enabled?: boolean;
  huggingface_video_model?: string;
  huggingface_video_provider?: 'auto' | 'hf-inference' | 'fal-ai' | 'replicate' | 'novita' | 'wavespeed';
  huggingface_video_endpoint_url?: string;
  huggingface_video_seconds?: number;
  huggingface_video_width?: number;
  huggingface_video_height?: number;
  huggingface_video_fps?: number;
  tavily_enabled?: boolean;
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
  pipeline_tipo: 'narrativo' | 'musica_ambiental' | 'dj_session';
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
  pipeline_tipo: { type: String, enum: ['narrativo', 'musica_ambiental', 'dj_session'], default: 'narrativo' },
  logo_url: { type: String, default: '' },
  youtube_tokens: { type: Schema.Types.Mixed, default: null },
  config: {
    voz_motor: { type: String, enum: ['elevenlabs', 'edge-tts', 'gemini-tts', 'nvidia-tts', 'azure-tts', 'openai-tts'], default: 'elevenlabs' },
    voz_id: { type: String, default: '' },
    imagen_motor: { type: String, enum: ['huggingface', 'freepik', 'comfyui'], default: 'freepik' },
    llm_motor: { type: String, enum: ['claude', 'openai', 'openrouter', 'gemini'], default: 'claude' },
    openai_api_key: { type: String, default: '' },
    openai_tts_api_key: { type: String, default: '' },
    openai_tts_model: { type: String, default: 'gpt-4o-mini-tts' },
    openai_tts_voice: { type: String, default: 'onyx' },
    openai_tts_instructions: {
      type: String,
      default: 'Habla en español de España con tono grave, sobrio y autoritario. Ritmo pausado, estilo documental de true crime, sin dramatizar en exceso.',
    },
    openai_tts_speed: { type: Number, default: 0.92 },
    openrouter_api_key: { type: String, default: '' },
    gemini_api_key: { type: String, default: '' },
    nvidia_api_key: { type: String, default: '' },
    nvidia_voice: { type: String, default: 'Magpie-Multilingual.ES-US.Leo' },
    azure_speech_key: { type: String, default: '' },
    azure_speech_region: { type: String, default: 'westeurope' },
    azure_speech_voice: { type: String, default: 'es-ES-AlvaroNeural' },
    azure_speech_style: { type: String, default: '' },
    azure_speech_rate: { type: String, default: '-8%' },
    azure_speech_pitch: { type: String, default: '-8Hz' },
    system_prompt_guion: { type: String, default: '' },
    tono: { type: String, default: '' },
    idioma: { type: String, default: 'es-ES' },
    comfyui_api_key: { type: String, default: '' },
    comfyui_workflow_overrides: { type: Schema.Types.Mixed, default: {} },
    thumbnail_accent_color: { type: String, default: '#CC0000' },
    thumbnail_style_prompt: { type: String, default: '' },
    thumbnail_mode: { type: String, default: 'classic' },
    imagen_referencia_url: { type: String, default: '' },
    secciones_personalizadas: { type: String, default: '' },
    tipos_guion: { type: String, default: '' },
    tavily_api_key: { type: String, default: '' },
    tavily_enabled: { type: Boolean, default: true },
    muapi_api_key: { type: String, default: '' },
    hf_api_key: { type: String, default: '' },
    huggingface_video_enabled: { type: Boolean, default: false },
    huggingface_video_model: { type: String, default: '' },
    huggingface_video_provider: { type: String, enum: ['auto', 'hf-inference', 'fal-ai', 'replicate', 'novita', 'wavespeed'], default: 'auto' },
    huggingface_video_endpoint_url: { type: String, default: '' },
    huggingface_video_seconds: { type: Number, default: 6 },
    huggingface_video_width: { type: Number, default: 768 },
    huggingface_video_height: { type: Number, default: 432 },
    huggingface_video_fps: { type: Number, default: 24 },
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
