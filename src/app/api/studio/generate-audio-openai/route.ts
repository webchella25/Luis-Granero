import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import StudioCanal from '@/models/StudioCanal';
import { getCleanedSections } from '@/lib/studio/clean-script-for-tts';
import {
  OPENAI_TTS_DEFAULT_INSTRUCTIONS,
  OPENAI_TTS_DEFAULT_MODEL,
  OPENAI_TTS_DEFAULT_SPEED,
  OPENAI_TTS_DEFAULT_VOICE,
  runOpenAITTS,
} from '@/lib/studio/openai-tts';
import fs from 'fs/promises';
import path from 'path';
import { addAudioVersion, createAudioOutput } from '@/lib/studio/audio-versions';

export const maxDuration = 300;

interface OpenAITTSCanalConfig {
  openai_api_key?: string;
  openai_tts_api_key?: string;
  openai_tts_model?: string;
  openai_tts_voice?: string;
  openai_tts_instructions?: string;
  openai_tts_speed?: number | string;
}

function parseSpeed(value: number | string | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return OPENAI_TTS_DEFAULT_SPEED;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = getStudioSession(request);
    if (!session?.canal_id) {
      return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
    }

    const { scriptId } = (await request.json()) as { scriptId?: string };
    if (!scriptId) {
      return NextResponse.json({ error: 'scriptId es obligatorio' }, { status: 400 });
    }

    await connectDB();
    const canal = await StudioCanal.findById(session.canal_id).select('config').lean();
    const config = ((canal as { config?: OpenAITTSCanalConfig } | null)?.config ?? {}) as OpenAITTSCanalConfig;

    const apiKey = config.openai_tts_api_key?.trim() || config.openai_api_key?.trim() || '';
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key no configurada en este canal' }, { status: 400 });
    }

    const script = await StudioScript.findById(scriptId);
    if (!script) {
      return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
    }

    const sections = getCleanedSections(script.guion_json);
    if (sections.length === 0) {
      return NextResponse.json({ error: 'El guión no tiene texto para narrar' }, { status: 400 });
    }

    const audioDir = path.join(process.cwd(), 'public', 'studio', 'audio');
    await fs.mkdir(audioDir, { recursive: true });

    const { outputPath, audioPath } = createAudioOutput(scriptId, 'openai-tts');

    const model = config.openai_tts_model?.trim() || OPENAI_TTS_DEFAULT_MODEL;
    const voice = config.openai_tts_voice?.trim() || OPENAI_TTS_DEFAULT_VOICE;
    const instructions = config.openai_tts_instructions?.trim() || OPENAI_TTS_DEFAULT_INSTRUCTIONS;
    const speed = parseSpeed(config.openai_tts_speed);

    const { sectionDurations } = await runOpenAITTS(sections, outputPath, {
      apiKey,
      model,
      voice,
      instructions,
      speed,
    });

    const audioVersion = addAudioVersion(script, {
      engine: 'openai-tts',
      path: audioPath,
      sectionDurations,
      meta: { model, voice, speed },
    });
    await script.save();

    return NextResponse.json({
      success: true,
      audioPath,
      audioVersion,
      engine: 'openai-tts',
      model,
      voice,
      speed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error generando audio OpenAI TTS:', message);
    const status = message.includes('Cuota de OpenAI agotada') ? 402 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
