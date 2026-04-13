import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import { getStudioSession } from '@/lib/studio/session';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
  try {
    const { id } = await params;
    await connectDB();
    const script = await StudioScript.findById(id).lean();

    if (!script) {
      return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
    }
    if (script.canal_id && script.canal_id !== session.canal_id) {
      return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ script });
  } catch (error) {
    console.error('Error obteniendo guión:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
  try {
    const { id } = await params;
    await connectDB();
    const script = await StudioScript.findById(id).lean();
    if (script?.canal_id && script.canal_id !== session.canal_id) {
      return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
    }
    await StudioScript.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando guión:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
