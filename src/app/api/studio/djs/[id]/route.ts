import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioDj from '@/models/StudioDj';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    await connectDB();
    const dj = await StudioDj.findById(id).lean();
    if (!dj) return NextResponse.json({ error: 'DJ no encontrado' }, { status: 404 });
    return NextResponse.json({ dj });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    const { nombre } = (await request.json()) as { nombre?: string };
    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }
    await connectDB();
    const dj = await StudioDj.findByIdAndUpdate(id, { nombre: nombre.trim() }, { new: true });
    if (!dj) return NextResponse.json({ error: 'DJ no encontrado' }, { status: 404 });
    return NextResponse.json({ dj });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    await connectDB();
    const dj = await StudioDj.findById(id);
    if (!dj) return NextResponse.json({ error: 'DJ no encontrado' }, { status: 404 });

    // Borrar archivos del disco
    const djDir = path.join(process.cwd(), 'public', 'studio', 'assets', 'djs', id);
    await fs.rm(djDir, { recursive: true, force: true });

    await StudioDj.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
