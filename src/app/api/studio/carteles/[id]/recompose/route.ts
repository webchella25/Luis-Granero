import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import QRCode from 'qrcode';
import connectDB from '@/lib/mongodb';
import StudioCartel from '@/models/StudioCartel';
import StudioDj from '@/models/StudioDj';
import StudioAsset from '@/models/StudioAsset';
import { renderCartel, renderCartelHorizontal, type ComposeParams } from '@/lib/studio/cartel-puppeteer';
import { getStudioSession } from '@/lib/studio/session';

const CARTELES_DIR = path.join(process.cwd(), 'public', 'studio', 'carteles');

async function loadBuffer(urlPath: string | null | undefined): Promise<Buffer | null> {
  if (!urlPath) return null;
  try {
    return await fs.readFile(path.join(process.cwd(), 'public', urlPath));
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { id } = await params;
    const overrides = (await request.json()) as {
      dj_foto_path?: string;
      tematica?: string;
      info_extra?: string;
      generos?: string;
      hora_inicio?: string;
      hora_fin?: string;
      lugar?: string;
      usar_foto_dj?: boolean;
    };

    await connectDB();
    const cartel = await StudioCartel.findById(id);
    if (!cartel) return NextResponse.json({ error: 'Cartel no encontrado' }, { status: 404 });
    if (!cartel.fondo_path) return NextResponse.json({ error: 'Sin fondo generado' }, { status: 400 });

    const dj = await StudioDj.findById(cartel.dj_id);
    if (!dj) return NextResponse.json({ error: 'DJ no encontrado' }, { status: 404 });

    // Aplicar overrides al cartel
    if (overrides.tematica !== undefined) cartel.tematica = overrides.tematica;
    if (overrides.info_extra !== undefined) cartel.info_extra = overrides.info_extra;
    if (overrides.generos !== undefined) cartel.generos = overrides.generos;
    if (overrides.hora_inicio !== undefined) cartel.hora_inicio = overrides.hora_inicio;
    if (overrides.hora_fin !== undefined) cartel.hora_fin = overrides.hora_fin;
    if (overrides.lugar !== undefined) cartel.lugar = overrides.lugar;
    if (overrides.dj_foto_path !== undefined) cartel.dj_foto_path = overrides.dj_foto_path;
    if (overrides.usar_foto_dj !== undefined) cartel.usar_foto_dj = overrides.usar_foto_dj;

    const fondoBuffer = await loadBuffer(cartel.fondo_path);
    if (!fondoBuffer) return NextResponse.json({ error: 'Fondo no encontrado en disco' }, { status: 400 });

    const usarFotoDj = cartel.usar_foto_dj ?? true;
    const djFotoPath = usarFotoDj ? (cartel.dj_foto_path ?? dj.fotos?.[0] ?? null) : null;
    const djFotoBuffer = djFotoPath ? await loadBuffer(djFotoPath) : null;
    const logoDjBuffer = await loadBuffer(dj.logo_path);
    const logoAsset = await StudioAsset.findOne({ tipo: 'logo_local' }).sort({ creado_en: -1 });
    const logoLocalBuffer = await loadBuffer(logoAsset?.archivo_path);

    const qrBuffer = cartel.url_qr
      ? await QRCode.toBuffer(cartel.url_qr, {
          width: 200,
          margin: 1,
          color: { dark: '#FFFFFF', light: '#000000' },
        })
      : null;

    const compParams: ComposeParams = {
      fondoBuffer,
      djNombre: dj.nombre,
      nombreEvento: cartel.nombre_evento,
      fecha: cartel.fecha,
      horaInicio: cartel.hora_inicio,
      horaFin: cartel.hora_fin,
      lugar: cartel.lugar,
      tematica: cartel.tematica,
      infoExtra: cartel.info_extra,
      generos: cartel.generos,
      usarFotoDj,
      djFotoBuffer,
      logoLocalBuffer,
      logoDjBuffer,
      qrBuffer,
    };

    await fs.mkdir(CARTELES_DIR, { recursive: true });
    await renderCartel(compParams, path.join(CARTELES_DIR, `${id}.jpg`));
    await renderCartelHorizontal(compParams, path.join(CARTELES_DIR, `${id}-h.jpg`));

    cartel.cartel_path = `/studio/carteles/${id}.jpg`;
    cartel.cartel_h_path = `/studio/carteles/${id}-h.jpg`;
    await cartel.save();

    return NextResponse.json({
      success: true,
      cartelPath: cartel.cartel_path,
      cartelHPath: cartel.cartel_h_path,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
