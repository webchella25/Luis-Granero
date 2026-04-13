import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import { generateImagesHFBackground } from '@/lib/studio/hf-images';
import {
  getAudioDurationSeconds,
  estimateDurationFromWords,
  calculateImageCount,
} from '@/lib/studio/image-prompts';

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

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 });
    if (!process.env.HUGGINGFACE_TOKEN) return NextResponse.json({ error: 'HUGGINGFACE_TOKEN no configurado' }, { status: 500 });

    await connectDB();
    const script = await StudioScript.findById(scriptId);
    if (!script) return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });

    if (script.images_status === 'processing') {
      return NextResponse.json({ status: 'processing', message: 'Ya está generando imágenes' });
    }

    // ── Calcular número de imágenes necesarias ──
    const publicDir = path.join(process.cwd(), 'public');
    let durationSec = 0;
    if (script.audio_path) {
      durationSec = await getAudioDurationSeconds(path.join(publicDir, script.audio_path as string));
    }
    if (durationSec <= 0) {
      durationSec = estimateDurationFromWords(script.guion_json);
    }

    const numImages = calculateImageCount(durationSec);
    const imageDuration = durationSec / numImages;

    // Guardar metadatos en MongoDB antes de empezar
    script.images_status = 'processing';
    script.images_progress = 0;
    script.images_count = numImages;
    script.images_duration = imageDuration;
    script.images_error = undefined;
    await script.save();

    const sid = scriptId;
    const sections = script.guion_json;
    const personaje = script.personaje;
    const epoca = script.epoca;

    generateImagesHFBackground(sid, sections, personaje, epoca, anthropicKey, numImages, imageDuration)
      .catch(async (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        console.error('Error generando imágenes con HF:', msg);
        await connectDB();
        const s = await StudioScript.findById(sid);
        if (s) {
          s.images_status = 'error';
          s.images_error = msg.slice(0, 500);
          await s.save();
        }
      });

    return NextResponse.json({
      status: 'processing',
      engine: 'huggingface',
      images_count: numImages,
      images_duration: Math.round(imageDuration),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error iniciando generación HF:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
