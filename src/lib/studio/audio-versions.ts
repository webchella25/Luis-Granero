import path from 'path';
import type { AudioEngine, AudioVersion, IStudioScript } from '@/models/StudioScript';

const ENGINE_LABELS: Record<AudioEngine, string> = {
  elevenlabs: 'ElevenLabs',
  'edge-tts': 'Edge TTS',
  'gemini-tts': 'Gemini TTS',
  'nvidia-tts': 'NVIDIA TTS',
  'azure-tts': 'Azure TTS',
  'openai-tts': 'OpenAI TTS',
};

export function createAudioOutput(scriptId: string, engine: AudioEngine): {
  filename: string;
  outputPath: string;
  audioPath: string;
} {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const safeEngine = engine.replace(/[^a-z0-9-]/gi, '');
  const filename = `${scriptId}-${safeEngine}-${stamp}.mp3`;
  const outputPath = path.join(process.cwd(), 'public', 'studio', 'audio', filename);
  return {
    filename,
    outputPath,
    audioPath: `/studio/audio/${filename}`,
  };
}

export function addAudioVersion(
  script: IStudioScript,
  params: {
    engine: AudioEngine;
    path: string;
    sectionDurations?: number[];
    label?: string;
    meta?: Record<string, unknown>;
  }
): AudioVersion {
  const version: AudioVersion = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    path: params.path,
    engine: params.engine,
    label: params.label ?? ENGINE_LABELS[params.engine],
    created_at: new Date(),
    is_active: true,
    section_durations: params.sectionDurations?.length ? params.sectionDurations : undefined,
    meta: params.meta ?? {},
  };

  const existing = script.audio_versions ?? [];
  for (const item of existing) item.is_active = false;
  script.audio_versions = [...existing, version];
  script.audio_path = version.path;
  script.audio_engine = version.engine;
  script.audio_status = 'ready';
  script.audio_error = undefined;
  script.audio_section_durations = version.section_durations;

  return version;
}
