import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import StudioCanal from '@/models/StudioCanal';
import { getCleanedSections } from '@/lib/studio/clean-script-for-tts';
import {
  AZURE_TTS_DEFAULT_PITCH,
  AZURE_TTS_DEFAULT_RATE,
  AZURE_TTS_DEFAULT_REGION,
  AZURE_TTS_DEFAULT_STYLE,
  AZURE_TTS_DEFAULT_VOICE,
  runAzureTTS,
} from '@/lib/studio/azure-tts';
import fs from 'fs/promises';
import path from 'path';
import { addAudioVersion, createAudioOutput } from '@/lib/studio/audio-versions';

export const maxDuration = 300;

interface AzureCanalConfig {
  azure_speech_key?: string;
  azure_speech_region?: string;
  azure_speech_voice?: string;
  azure_speech_style?: string;
  azure_speech_rate?: string;
  azure_speech_pitch?: string;
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
    const config = ((canal as { config?: AzureCanalConfig } | null)?.config ?? {}) as AzureCanalConfig;

    const apiKey = config.azure_speech_key?.trim() ?? '';
    if (!apiKey) {
      return NextResponse.json({ error: 'Azure Speech key no configurada en este canal' }, { status: 400 });
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

    const { outputPath, audioPath } = createAudioOutput(scriptId, 'azure-tts');

    const region = config.azure_speech_region?.trim() || AZURE_TTS_DEFAULT_REGION;
    const voice = config.azure_speech_voice?.trim() || AZURE_TTS_DEFAULT_VOICE;
    const style = config.azure_speech_style?.trim() || AZURE_TTS_DEFAULT_STYLE;
    const rate = config.azure_speech_rate?.trim() || AZURE_TTS_DEFAULT_RATE;
    const pitch = config.azure_speech_pitch?.trim() || AZURE_TTS_DEFAULT_PITCH;

    const { sectionDurations } = await runAzureTTS(sections, outputPath, {
      apiKey,
      region,
      voice,
      style,
      rate,
      pitch,
    });

    const audioVersion = addAudioVersion(script, {
      engine: 'azure-tts',
      path: audioPath,
      sectionDurations,
      meta: { region, voice, style, rate, pitch },
    });
    await script.save();

    return NextResponse.json({
      success: true,
      audioPath,
      audioVersion,
      engine: 'azure-tts',
      region,
      voice,
      style,
      rate,
      pitch,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error generando audio Azure TTS:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
