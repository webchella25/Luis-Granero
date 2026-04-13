import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioDj from '@/models/StudioDj';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    await connectDB();
    const djs = await StudioDj.find({
      $or: [{ workspace_id: session.workspace_id }, { workspace_id: null }, { workspace_id: { $exists: false } }]
    }).sort({ creado_en: -1 }).lean();
    return NextResponse.json({ djs });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { nombre } = (await request.json()) as { nombre?: string };
    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }
    await connectDB();
    const dj = await StudioDj.create({ nombre: nombre.trim(), workspace_id: session.workspace_id });
    return NextResponse.json({ dj });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
