import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';

interface Params { params: Promise<{ id: string }> }

const PIPELINE_TYPES = new Set(['narrativo', 'musica_ambiental', 'dj_session']);

function publicCanal(canal: Record<string, unknown>) {
  const {
    youtube_tokens: youtubeTokens,
    ...safe
  } = canal;
  const config = (safe.config && typeof safe.config === 'object' ? { ...(safe.config as Record<string, unknown>) } : null);
  if (config) {
    delete config.hf_api_key;
    delete config.comfyui_api_key;
    safe.config = config;
  }
  return {
    ...safe,
    youtube_conectado: !!youtubeTokens,
  };
}

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const canal = await StudioCanal.findOne({ _id: id, workspace_id: session.workspace_id }).lean();
  if (!canal) return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 });

  return NextResponse.json({ canal: publicCanal({ ...canal, _id: canal._id.toString() }) });
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  const update: Record<string, unknown> = {};
  if (body.nombre !== undefined) update['nombre'] = body.nombre;
  if (body.nicho !== undefined) update['nicho'] = body.nicho;
  if (body.descripcion !== undefined) update['descripcion'] = body.descripcion;
  if (body.pipeline_tipo !== undefined) {
    if (!PIPELINE_TYPES.has(String(body.pipeline_tipo))) {
      return NextResponse.json({ error: 'pipeline_tipo inválido' }, { status: 400 });
    }
    update['pipeline_tipo'] = body.pipeline_tipo;
  }
  if (body.system_prompt_guion !== undefined) update['config.system_prompt_guion'] = body.system_prompt_guion;
  if (body.tono !== undefined) update['config.tono'] = body.tono;
  if (body.voz_motor !== undefined) update['config.voz_motor'] = body.voz_motor;
  if (body.imagen_motor !== undefined) update['config.imagen_motor'] = body.imagen_motor;
  if (body.llm_motor !== undefined) update['config.llm_motor'] = body.llm_motor;
  if (body.openai_api_key !== undefined) update['config.openai_api_key'] = body.openai_api_key;
  if (body.openai_tts_api_key !== undefined) update['config.openai_tts_api_key'] = body.openai_tts_api_key;
  if (body.openai_tts_model !== undefined) update['config.openai_tts_model'] = body.openai_tts_model;
  if (body.openai_tts_voice !== undefined) update['config.openai_tts_voice'] = body.openai_tts_voice;
  if (body.openai_tts_instructions !== undefined) update['config.openai_tts_instructions'] = body.openai_tts_instructions;
  if (body.openai_tts_speed !== undefined) update['config.openai_tts_speed'] = body.openai_tts_speed;
  if (body.openrouter_api_key !== undefined) update['config.openrouter_api_key'] = body.openrouter_api_key;
  if (body.gemini_api_key !== undefined) update['config.gemini_api_key'] = body.gemini_api_key;
  if (body.nvidia_api_key !== undefined) update['config.nvidia_api_key'] = body.nvidia_api_key;
  if (body.nvidia_voice !== undefined) update['config.nvidia_voice'] = body.nvidia_voice;
  if (body.azure_speech_key !== undefined) update['config.azure_speech_key'] = body.azure_speech_key;
  if (body.azure_speech_region !== undefined) update['config.azure_speech_region'] = body.azure_speech_region;
  if (body.azure_speech_voice !== undefined) update['config.azure_speech_voice'] = body.azure_speech_voice;
  if (body.azure_speech_style !== undefined) update['config.azure_speech_style'] = body.azure_speech_style;
  if (body.azure_speech_rate !== undefined) update['config.azure_speech_rate'] = body.azure_speech_rate;
  if (body.azure_speech_pitch !== undefined) update['config.azure_speech_pitch'] = body.azure_speech_pitch;
  if (body.idioma !== undefined) update['config.idioma'] = body.idioma;
  if (body.comfyui_api_key !== undefined) update['config.comfyui_api_key'] = body.comfyui_api_key;
  if (body.comfyui_workflow_overrides !== undefined) update['config.comfyui_workflow_overrides'] = body.comfyui_workflow_overrides;
  if (body.thumbnail_accent_color !== undefined) update['config.thumbnail_accent_color'] = body.thumbnail_accent_color;
  if (body.thumbnail_style_prompt !== undefined) update['config.thumbnail_style_prompt'] = body.thumbnail_style_prompt;
  if (body.thumbnail_mode !== undefined) update['config.thumbnail_mode'] = body.thumbnail_mode;
  if (body.imagen_referencia_url !== undefined) update['config.imagen_referencia_url'] = body.imagen_referencia_url;
  if (body.secciones_personalizadas !== undefined) update['config.secciones_personalizadas'] = body.secciones_personalizadas;
  if (body.tipos_guion !== undefined) update['config.tipos_guion'] = body.tipos_guion;
  if (body.form_campo1_label !== undefined) update['config.form_campo1_label'] = body.form_campo1_label;
  if (body.form_campo1_placeholder !== undefined) update['config.form_campo1_placeholder'] = body.form_campo1_placeholder;
  if (body.form_campo2_label !== undefined) update['config.form_campo2_label'] = body.form_campo2_label;
  if (body.form_campo2_placeholder !== undefined) update['config.form_campo2_placeholder'] = body.form_campo2_placeholder;
  if (body.logo_url !== undefined) update['logo_url'] = body.logo_url;
  if (body.tavily_api_key !== undefined) update['config.tavily_api_key'] = body.tavily_api_key;
  if (body.tavily_enabled !== undefined) update['config.tavily_enabled'] = body.tavily_enabled;
  if (body.muapi_api_key !== undefined) update['config.muapi_api_key'] = body.muapi_api_key;
  if (body.hf_api_key !== undefined) update['config.hf_api_key'] = body.hf_api_key;
  if (body.huggingface_video_enabled !== undefined) update['config.huggingface_video_enabled'] = body.huggingface_video_enabled;
  if (body.huggingface_video_model !== undefined) update['config.huggingface_video_model'] = body.huggingface_video_model;
  if (body.huggingface_video_provider !== undefined) {
    if (!['auto', 'hf-inference', 'fal-ai', 'replicate', 'novita', 'wavespeed'].includes(String(body.huggingface_video_provider))) {
      return NextResponse.json({ error: 'huggingface_video_provider inválido' }, { status: 400 });
    }
    update['config.huggingface_video_provider'] = body.huggingface_video_provider;
  }
  if (body.huggingface_video_endpoint_url !== undefined) update['config.huggingface_video_endpoint_url'] = body.huggingface_video_endpoint_url;
  if (body.huggingface_video_seconds !== undefined) update['config.huggingface_video_seconds'] = body.huggingface_video_seconds;
  if (body.huggingface_video_width !== undefined) update['config.huggingface_video_width'] = body.huggingface_video_width;
  if (body.huggingface_video_height !== undefined) update['config.huggingface_video_height'] = body.huggingface_video_height;
  if (body.huggingface_video_fps !== undefined) update['config.huggingface_video_fps'] = body.huggingface_video_fps;
  if (body.icono !== undefined) update['config.icono'] = body.icono;
  if (body.telegram_bot_token !== undefined) update['config.telegram_bot_token'] = body.telegram_bot_token;
  if (body.telegram_chat_id !== undefined) update['config.telegram_chat_id'] = body.telegram_chat_id;
  if (body.notificaciones !== undefined) update['config.notificaciones'] = body.notificaciones;

  await connectDB();
  const canal = await StudioCanal.findOneAndUpdate(
    { _id: id, workspace_id: session.workspace_id },
    { $set: update },
    { new: true }
  ).lean();

  if (!canal) return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 });
  return NextResponse.json({ success: true, canal: publicCanal({ ...canal, _id: canal._id.toString() }) });
}
