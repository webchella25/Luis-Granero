import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioCartel from '@/models/StudioCartel';
import StudioDj from '@/models/StudioDj';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = getStudioSession(_req);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { id } = await params;
    await connectDB();
    const cartel = await StudioCartel.findOne({ _id: id, canal_id: session.canal_id }).lean();
    if (!cartel) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    const dj = await StudioDj.findById(cartel.dj_id).lean();
    return NextResponse.json({ cartel: { ...cartel, dj } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = getStudioSession(_req);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { id } = await params;
    await connectDB();
    const cartel = await StudioCartel.findOne({ _id: id, canal_id: session.canal_id });
    if (!cartel) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

    const publicDir = path.join(process.cwd(), 'public');
    for (const p of [cartel.cartel_path, cartel.fondo_path, cartel.cartel_h_path]) {
      if (p) await fs.unlink(path.join(publicDir, p)).catch(() => null);
    }

    await cartel.deleteOne();
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
