import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import QRCode from 'qrcode';
import connectDB from '@/lib/mongodb';
import StudioCartel from '@/models/StudioCartel';
import StudioDj from '@/models/StudioDj';
import StudioAsset from '@/models/StudioAsset';
import { renderCartel, renderCartelHorizontal, type ComposeParams } from '@/lib/studio/cartel-puppeteer';
import { buildFluxPrompt, generateFondoFlux } from '@/lib/studio/flux';
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

async function generateQRBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    width: 200,
    margin: 1,
    color: { dark: '#FFFFFF', light: '#000000' },
  });
}

async function doGenerate(cartelId: string): Promise<void> {
  await connectDB();
  const cartel = await StudioCartel.findById(cartelId);
  if (!cartel) throw new Error('Cartel no encontrado');

  const dj = await StudioDj.findById(cartel.dj_id);
  if (!dj) throw new Error('DJ no encontrado');

  const usarFotoDj = cartel.usar_foto_dj ?? true;

  // Paso 1: construir y guardar prompt FLUX
  const promptFlux = buildFluxPrompt(
    cartel.color_principal ?? '',
    usarFotoDj,
    cartel.prompt_usuario
  );
  cartel.prompt_flux = promptFlux;
  await cartel.save();

  // Paso 2: generar fondo con FLUX
  const fondoPath = path.join(CARTELES_DIR, `${cartelId}-fondo.jpg`);
  await generateFondoFlux(promptFlux, fondoPath);
  cartel.fondo_path = `/studio/carteles/${cartelId}-fondo.jpg`;
  await cartel.save();

  // Paso 3: cargar assets
  await fs.mkdir(CARTELES_DIR, { recursive: true });
  const fondoBuffer = await fs.readFile(fondoPath);

  const djFotoPath = usarFotoDj ? (cartel.dj_foto_path ?? dj.fotos?.[0] ?? null) : null;
  const djFotoBuffer = djFotoPath ? await loadBuffer(djFotoPath) : null;
  if (djFotoPath && usarFotoDj) cartel.dj_foto_path = djFotoPath;

  const logoAsset = await StudioAsset.findOne({ tipo: 'logo_local' }).sort({ creado_en: -1 });
  const logoLocalBuffer = await loadBuffer(logoAsset?.archivo_path);
  const logoDjBuffer = await loadBuffer(dj.logo_path);

  const qrBuffer = cartel.url_qr ? await generateQRBuffer(cartel.url_qr) : null;

  const params: ComposeParams = {
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

  // Paso 4: renderizar cartel vertical con Puppeteer
  await renderCartel(params, path.join(CARTELES_DIR, `${cartelId}.jpg`));

  // Paso 4b: renderizar versión horizontal
  await renderCartelHorizontal(params, path.join(CARTELES_DIR, `${cartelId}-h.jpg`));

  // Paso 5: guardar rutas
  cartel.cartel_path = `/studio/carteles/${cartelId}.jpg`;
  cartel.cartel_h_path = `/studio/carteles/${cartelId}-h.jpg`;
  await cartel.save();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const body = (await request.json()) as {
      dj_id?: string;
      dj_foto_path?: string;
      nombre_evento?: string;
      fecha?: string;
      hora_inicio?: string;
      hora_fin?: string;
      lugar?: string;
      tematica?: string;
      info_extra?: string;
      generos?: string;
      prompt_usuario?: string;
      color_principal?: string;
      usar_foto_dj?: boolean;
      url_qr?: string;
    };

    if (!body.dj_id || !body.nombre_evento || !body.fecha || !body.hora_inicio || !body.prompt_usuario) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    await connectDB();
    const cartel = await StudioCartel.create({
      canal_id: session.canal_id,
      dj_id: body.dj_id,
      nombre_evento: body.nombre_evento.trim(),
      fecha: body.fecha,
      hora_inicio: body.hora_inicio,
      hora_fin: body.hora_fin ?? null,
      lugar: body.lugar ?? 'Cero Ocho Pub, C/ Obispo Pastor Pérez 8, Valencia',
      tematica: body.tematica ?? '',
      info_extra: body.info_extra ?? null,
      generos: body.generos ?? '',
      prompt_usuario: body.prompt_usuario,
      color_principal: body.color_principal ?? '',
      usar_foto_dj: body.usar_foto_dj ?? true,
      url_qr: body.url_qr ?? null,
      dj_foto_path: body.dj_foto_path ?? null,
    });

    const id = String(cartel._id);

    doGenerate(id).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[cartel-generate] error:', msg);
    });

    return NextResponse.json({ success: true, cartelId: id, status: 'processing' });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
