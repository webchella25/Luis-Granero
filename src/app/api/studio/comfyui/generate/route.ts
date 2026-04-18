import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import {
  runComfyWorkflow,
  submitComfyJob,
  type ComfyWorkflowType,
  type ComfyGenerateParams,
} from '@/lib/studio/comfyui-client';

const ASYNC_TYPES: ComfyWorkflowType[] = ['video'];

interface GenerateBody {
  tipo: ComfyWorkflowType;
  prompt: string;
  width?: number;
  height?: number;
  seed?: number;
  steps?: number;
  cfg?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }

  const body = (await request.json()) as GenerateBody;
  const { tipo, prompt, width, height, seed, steps, cfg } = body;

  if (!tipo || !prompt) {
    return NextResponse.json({ error: 'tipo y prompt son obligatorios' }, { status: 400 });
  }

  await connectDB();
  const canal = await StudioCanal.findById(session.canal_id).lean();
  const config = (canal as { config?: Record<string, unknown> } | null)?.config ?? {};
  const apiKey = config.comfyui_api_key as string | undefined;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key de ComfyUI no configurada para este canal' },
      { status: 400 }
    );
  }

  const overrides = (config.comfyui_workflow_overrides ?? {}) as Record<string, string>;
  const workflowOverride = overrides[tipo] as string | undefined;

  const params: ComfyGenerateParams = { prompt, width, height, seed, steps, cfg };

  try {
    if (ASYNC_TYPES.includes(tipo)) {
      const jobId = await submitComfyJob(tipo, params, apiKey, workflowOverride);
      return NextResponse.json({ jobId, status: 'pending' });
    }

    const buffer = await runComfyWorkflow(tipo, params, apiKey, workflowOverride);

    const outputDir = path.join(process.cwd(), 'public', 'studio', 'comfyui', tipo);
    await fs.mkdir(outputDir, { recursive: true });
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
    await fs.writeFile(path.join(outputDir, filename), buffer);

    return NextResponse.json({
      success: true,
      url: `/studio/comfyui/${tipo}/${filename}`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[comfyui/generate]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
