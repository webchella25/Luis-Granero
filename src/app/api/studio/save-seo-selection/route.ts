import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
    const { scriptId, tituloIdx, descripcion, tags } = (await request.json()) as {
      scriptId?: string;
      tituloIdx?: number;
      descripcion?: string;
      tags?: string[];
    };
    if (!scriptId) {
      return NextResponse.json({ error: 'scriptId requerido' }, { status: 400 });
    }

    await connectDB();
    const update: Record<string, unknown> = {};
    if (tituloIdx !== undefined) update.seo_titulo_seleccionado = tituloIdx;
    if (descripcion !== undefined) update.descripcion_seo = descripcion;
    if (tags !== undefined) update.tags_seo = tags;

    await StudioScript.findByIdAndUpdate(scriptId, update);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error guardando selección SEO:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
