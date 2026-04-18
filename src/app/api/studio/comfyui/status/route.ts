import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { pollComfyJob } from '@/lib/studio/comfyui-client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const jobId = request.nextUrl.searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json({ error: 'jobId es obligatorio' }, { status: 400 });
  }

  await connectDB();
  const canal = await StudioCanal.findById(session.canal_id).lean();
  const config = (canal as { config?: Record<string, unknown> } | null)?.config ?? {};
  const apiKey = config.comfyui_api_key as string | undefined;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key de ComfyUI no configurada' }, { status: 400 });
  }

  try {
    const result = await pollComfyJob(jobId, apiKey);

    if (result.status === 'completed' && result.buffer) {
      const outputDir = path.join(process.cwd(), 'public', 'studio', 'comfyui', 'video');
      await fs.mkdir(outputDir, { recursive: true });
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
      await fs.writeFile(path.join(outputDir, filename), result.buffer);
      return NextResponse.json({
        status: 'completed',
        url: `/studio/comfyui/video/${filename}`,
      });
    }

    return NextResponse.json({ status: result.status });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[comfyui/status]', msg);
    return NextResponse.json({ error: msg, status: 'failed' }, { status: 500 });
  }
}
