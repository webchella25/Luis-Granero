import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import connectDB from '@/lib/mongodb';
import StudioAsset from '@/models/StudioAsset';
import StudioCartel from '@/models/StudioCartel';
import { renderCartelV2, TextosV2 } from '@/lib/studio/cartel-puppeteer';
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

interface RenderBody {
  fondo_path: string;
  foto_dj_path?: string | null;
  logo_local_path?: string | null;
  logo_dj_path?: string | null;
  qr_url?: string | null;
  preset?: string;
  fuente?: string;
  color_acento?: string;
  efecto_texto?: string;
  overlay_intensidad?: number;
  grano_intensidad?: number;
  layout?: string;
  textos: TextosV2;
  foto_dj_size?: number;
  foto_dj_position_y?: number;
  titulo_position_y?: number;
  fecha_position_y?: number;
  usar_foto_dj?: boolean;
  usar_logo_local?: boolean;
  usar_logo_dj?: boolean;
  cartel_id?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const body = (await request.json()) as RenderBody;

    if (!body.fondo_path) {
      return NextResponse.json({ error: 'fondo_path es obligatorio' }, { status: 400 });
    }
    if (!body.textos) {
      return NextResponse.json({ error: 'textos es obligatorio' }, { status: 400 });
    }

    await connectDB();

    // Cargar buffers
    const fondoBuffer = await loadBuffer(body.fondo_path);
    if (!fondoBuffer) {
      return NextResponse.json({ error: 'Fondo no encontrado: ' + body.fondo_path }, { status: 404 });
    }

    const djFotoBuffer = (body.usar_foto_dj !== false && body.foto_dj_path)
      ? await loadBuffer(body.foto_dj_path)
      : null;

    // Logo local: usar el proporcionado o buscar el último subido
    let logoLocalBuffer: Buffer | null = null;
    if (body.usar_logo_local !== false) {
      if (body.logo_local_path) {
        logoLocalBuffer = await loadBuffer(body.logo_local_path);
      } else {
        const logoAsset = await StudioAsset.findOne({ tipo: 'logo_local' }).sort({ creado_en: -1 });
        logoLocalBuffer = await loadBuffer(logoAsset?.archivo_path);
      }
    }

    const logoDjBuffer = (body.usar_logo_dj !== false && body.logo_dj_path)
      ? await loadBuffer(body.logo_dj_path)
      : null;

    // QR si hay URL
    let qrBuffer: Buffer | null = null;
    if (body.qr_url) {
      try {
        const QRCode = (await import('qrcode')).default;
        const qrDataUrl = await QRCode.toDataURL(body.qr_url, { width: 380, margin: 1 });
        const base64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
        qrBuffer = Buffer.from(base64, 'base64');
      } catch { /* QR opcional */ }
    }

    // Renderizar
    const outputId = randomUUID();
    const outputPath = path.join(CARTELES_DIR, `${outputId}.jpg`);
    await fs.mkdir(CARTELES_DIR, { recursive: true });

    await renderCartelV2(
      {
        fondoBuffer,
        djFotoBuffer,
        logoLocalBuffer,
        logoDjBuffer,
        qrBuffer,
        preset: body.preset ?? 'OSCURO_ELEGANTE',
        fuente: body.fuente ?? 'Bebas Neue',
        colorAcento: body.color_acento ?? '#FFD700',
        efectoTexto: body.efecto_texto ?? 'Normal',
        overlayIntensidad: body.overlay_intensidad ?? 75,
        granoIntensidad: body.grano_intensidad ?? 10,
        layout: body.layout ?? 'CLASICO',
        fotoDjSize: body.foto_dj_size ?? 300,
        fotoDjPositionY: body.foto_dj_position_y ?? 0,
        tituloPositionY: body.titulo_position_y ?? 0,
        fechaPositionY: body.fecha_position_y ?? 0,
        textos: body.textos,
        usarFotoDj: body.usar_foto_dj !== false,
        usarLogoLocal: body.usar_logo_local !== false,
        usarLogoDj: body.usar_logo_dj !== false,
      },
      outputPath
    );

    const cartelPath = `/studio/carteles/${outputId}.jpg`;

    // Actualizar MongoDB si se proporciona cartel_id
    if (body.cartel_id) {
      await StudioCartel.findOneAndUpdate(
        { _id: body.cartel_id, canal_id: session.canal_id },
        { cartel_path: cartelPath }
      );
    }

    return NextResponse.json({ success: true, cartelPath });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error interno';
    console.error('Error en render V2:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
