import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioDj from '@/models/StudioDj';
import StudioAsset from '@/models/StudioAsset';
import { getStudioSession } from '@/lib/studio/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });

    await connectDB();
    const dj = await StudioDj.findById(id);
    if (!dj) return NextResponse.json({ error: 'DJ no encontrado' }, { status: 404 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const sharp = (await import('sharp')).default;
    const jpgBuffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();

    const dir = path.join(process.cwd(), 'public', 'studio', 'assets', 'djs', id);
    await fs.mkdir(dir, { recursive: true });

    const filename = `foto_${Date.now()}.jpg`;
    await fs.writeFile(path.join(dir, filename), jpgBuffer);

    const urlPath = `/studio/assets/djs/${id}/${filename}`;
    dj.fotos.push(urlPath);
    await dj.save();

    await StudioAsset.create({
      tipo: 'foto_dj',
      nombre: file.name,
      dj_id: id,
      archivo_path: urlPath,
    });

    return NextResponse.json({ success: true, path: urlPath, dj });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
