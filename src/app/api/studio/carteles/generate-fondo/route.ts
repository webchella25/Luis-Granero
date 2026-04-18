import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { randomUUID } from 'crypto';
import connectDB from '@/lib/mongodb';
import StudioFondo from '@/models/StudioFondo';
import { buildFluxPrompt, generateFondoFlux } from '@/lib/studio/flux';
import { getStudioSession } from '@/lib/studio/session';
import fs from 'fs/promises';
import StudioCanal from '@/models/StudioCanal';
import { runComfyWorkflow } from '@/lib/studio/comfyui-client';

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

    await connectDB();
    const canal = await StudioCanal.findById(session.canal_id).lean();
    const canalCfg = (canal as { config?: { imagen_motor?: string; comfyui_api_key?: string; comfyui_workflow_overrides?: Record<string, string> } } | null)?.config;

    if (canalCfg?.imagen_motor === 'comfyui') {
      const comfyKey = canalCfg.comfyui_api_key;
      if (!comfyKey) throw new Error('API key ComfyUI no configurada');
      const overrides = canalCfg.comfyui_workflow_overrides ?? {};
      const buffer = await runComfyWorkflow('fondo', { prompt: promptFlux }, comfyKey, overrides.fondo);
      await fs.mkdir(FONDOS_DIR, { recursive: true });
      await fs.writeFile(outputPath, buffer);
    } else {
      await generateFondoFlux(promptFlux, outputPath);
    }

    const fondoPath = `/studio/carteles/fondos/${id}.jpg`;
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
