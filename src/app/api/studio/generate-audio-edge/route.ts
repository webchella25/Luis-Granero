import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import { runEdgeTTS, EDGE_TTS_PITCH, EDGE_TTS_RATE, EDGE_TTS_VOICE, EDGE_TTS_VOLUME } from '@/lib/studio/edge-tts';
import { cleanScriptForTTS } from '@/lib/studio/clean-script-for-tts';
import { addAudioVersion, createAudioOutput } from '@/lib/studio/audio-versions';

export const maxDuration = 300;

export async function POST(request: NextRequest): Promise<NextResponse> {
  let tmpTextPath: string | null = null;

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
    const script = await StudioScript.findById(scriptId);

    if (!script) {
      return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
    }

    console.log('[EdgeTTS] Secciones en guion_json:', script.guion_json.length);
    script.guion_json.forEach((s: { title: string; content: string }, i: number) => {
      console.log(`[EdgeTTS] Sección ${i + 1} "${s.title}": ${s.content.length} chars`);
    });

    const narrationText = cleanScriptForTTS(script.guion_json, 'edge-tts');
    const parsed = JSON.parse(narrationText) as { sections: string[] };
    console.log('[EdgeTTS] JSON sections:', parsed.sections.length);
    parsed.sections.forEach((sec, i) => {
      console.log(`[EdgeTTS] JSON sección ${i + 1}: ${sec.length} chars`);
    });
    console.log('[EdgeTTS] JSON total chars:', narrationText.length);

    // Escribir JSON de secciones en fichero temporal
    tmpTextPath = `/tmp/studio-chunks-${scriptId}.json`;
    await fs.writeFile(tmpTextPath, narrationText, 'utf-8');

    const stats = await fs.stat(tmpTextPath);
    console.log('[EdgeTTS] Fichero escrito bytes:', stats.size);

    // Directorio de salida
    const audioDir = path.join(process.cwd(), 'public', 'studio', 'audio');
    await fs.mkdir(audioDir, { recursive: true });

    const { outputPath, audioPath } = createAudioOutput(scriptId, 'edge-tts');

    // Ejecutar edge-tts
    const { sectionDurations } = await runEdgeTTS(tmpTextPath, outputPath);

    // Borrar fichero temporal
    await fs.unlink(tmpTextPath).catch(() => null);
    tmpTextPath = null;

    const audioVersion = addAudioVersion(script, {
      engine: 'edge-tts',
      path: audioPath,
      sectionDurations,
      meta: { voice: EDGE_TTS_VOICE, rate: EDGE_TTS_RATE, pitch: EDGE_TTS_PITCH, volume: EDGE_TTS_VOLUME },
    });
    await script.save();

    return NextResponse.json({
      success: true,
      audioPath,
      audioVersion,
      engine: 'edge-tts',
      voice: EDGE_TTS_VOICE,
      rate: EDGE_TTS_RATE,
      pitch: EDGE_TTS_PITCH,
      volume: EDGE_TTS_VOLUME,
    });
  } catch (error) {
    if (tmpTextPath) {
      await fs.unlink(tmpTextPath).catch(() => null);
    }

    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error generando audio con Edge TTS:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
