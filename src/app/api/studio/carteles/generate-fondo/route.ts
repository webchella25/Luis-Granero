import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { randomUUID } from 'crypto';
import connectDB from '@/lib/mongodb';
import StudioFondo from '@/models/StudioFondo';
import { buildFluxPrompt, generateFondoFlux } from '@/lib/studio/flux';
import { getStudioSession } from '@/lib/studio/session';

const FONDOS_DIR = path.join(process.cwd(), 'public', 'studio', 'carteles', 'fondos');

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { prompt, color_hint } = (await request.json()) as {
      prompt?: string;
      color_hint?: string;
    };

    const promptFlux = buildFluxPrompt(color_hint ?? '', false, prompt ?? '');

    const id = randomUUID();
    const outputPath = path.join(FONDOS_DIR, `${id}.jpg`);
    await generateFondoFlux(promptFlux, outputPath);

    const fondoPath = `/studio/carteles/fondos/${id}.jpg`;

    await connectDB();
    const fondo = await StudioFondo.create({
      canal_id: session.canal_id,
      path: fondoPath,
      prompt: promptFlux,
      used_count: 1,
    });

    return NextResponse.json({
      fondo_path: fondoPath,
      fondo_url: fondoPath,
      fondo_id: String(fondo._id),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[generate-fondo]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
