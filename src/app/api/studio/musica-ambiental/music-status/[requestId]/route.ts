import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';

const MUAPI_BASE = 'https://api.muapi.ai';

interface Params { params: Promise<{ requestId: string }> }

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id)
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const { requestId } = await params;

  await connectDB();
  const canal = await StudioCanal.findOne({
    _id: session.canal_id,
    workspace_id: session.workspace_id,
  }).lean() as { config?: { muapi_api_key?: string } } | null;

  const apiKey = canal?.config?.muapi_api_key?.trim();
  if (!apiKey)
    return NextResponse.json({ error: 'API key de MuAPI no configurada' }, { status: 400 });

  const res = await fetch(`${MUAPI_BASE}/api/v1/predictions/${requestId}/result`, {
    headers: { 'x-api-key': apiKey },
  });

  const data = await res.json() as {
    status?: string;
    outputs?: string[];
    error?: string;
  };

  if (!res.ok)
    return NextResponse.json({ error: data.error ?? 'Error al consultar MuAPI' }, { status: 502 });

  return NextResponse.json({
    status: data.status ?? 'processing',
    outputs: data.outputs ?? [],
  });
}
