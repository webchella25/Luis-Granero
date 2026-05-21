import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioAsset from '@/models/StudioAsset';

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const asset = await StudioAsset.findOne({ tipo: 'logo_local' }).sort({ creado_en: -1 }).lean();
    return NextResponse.json({ asset });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const sharp = (await import('sharp')).default;
    const jpgBuffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();

    const dir = path.join(process.cwd(), 'public', 'studio', 'assets');
    await fs.mkdir(dir, { recursive: true });
    const filename = `logo_local_${Date.now()}.jpg`;
    await fs.writeFile(path.join(dir, filename), jpgBuffer);
    const urlPath = `/studio/assets/${filename}`;

    await connectDB();
    const asset = await StudioAsset.create({
      tipo: 'logo_local',
      nombre: file.name,
      dj_id: null,
      archivo_path: urlPath,
    });

    return NextResponse.json({ success: true, asset });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
