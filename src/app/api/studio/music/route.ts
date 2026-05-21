import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioMusicTrack, { MusicCategory } from '@/models/StudioMusicTrack';
import { getStudioSession } from '@/lib/studio/session';

const execAsync = promisify(exec);

const VALID_CATEGORIES: MusicCategory[] = ['hook', 'intro', 'desarrollo', 'profundizacion', 'perspectiva', 'reflexion'];

async function getMp3Duration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    );
    return parseFloat(stdout.trim()) || 0;
  } catch {
    return 0;
  }
}

// GET /api/studio/music — devuelve tracks agrupados por categoría + conteos
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = getStudioSession(request);
    if (!session?.canal_id) {
      return NextResponse.json({ error: 'Sin canal seleccionado' }, { status: 401 });
    }
    await connectDB();
    const tracks = await StudioMusicTrack.find({ canal_id: session.canal_id }).sort({ categoria: 1, creado_en: -1 }).lean();

    const grouped: Record<MusicCategory, typeof tracks> = {
      hook: [], intro: [], desarrollo: [], profundizacion: [], perspectiva: [], reflexion: [],
    };

    for (const track of tracks) {
      const cat = track.categoria as MusicCategory;
      if (grouped[cat]) grouped[cat].push(track);
    }

    const counts: Record<MusicCategory, number> = {
      hook: grouped.hook.length,
      intro: grouped.intro.length,
      desarrollo: grouped.desarrollo.length,
      profundizacion: grouped.profundizacion.length,
      perspectiva: grouped.perspectiva.length,
      reflexion: grouped.reflexion.length,
    };

    return NextResponse.json({ tracks: grouped, counts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/studio/music — sube un MP3 a una categoría
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = getStudioSession(request);
    if (!session?.canal_id) {
      return NextResponse.json({ error: 'Sin canal seleccionado' }, { status: 401 });
    }
    const canal_id = session.canal_id;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const categoria = formData.get('categoria') as string | null;

    if (!file || !categoria) {
      return NextResponse.json({ error: 'Se requiere file y categoria' }, { status: 400 });
    }

    if (!VALID_CATEGORIES.includes(categoria as MusicCategory)) {
      return NextResponse.json({ error: 'Categoría no válida' }, { status: 400 });
    }

    // Validar que sea MP3
    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();
    if (ext !== '.mp3') {
      return NextResponse.json({ error: 'Solo se aceptan archivos MP3' }, { status: 400 });
    }

    const musicDir = path.join(process.cwd(), 'public', 'studio', 'music', canal_id, categoria);
    await fs.mkdir(musicDir, { recursive: true });

    // Nombre seguro: timestamp + nombre original sanitizado
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}_${safeName}`;
    const filePath = path.join(musicDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Calcular duración con ffprobe
    const duracion = await getMp3Duration(filePath);

    await connectDB();
    const track = await StudioMusicTrack.create({
      canal_id,
      nombre: safeName.replace(/_/g, ' ').replace('.mp3', ''),
      categoria: categoria as MusicCategory,
      archivo_path: `/studio/music/${canal_id}/${categoria}/${filename}`,
      duracion_segundos: duracion,
    });

    return NextResponse.json({ success: true, track });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
