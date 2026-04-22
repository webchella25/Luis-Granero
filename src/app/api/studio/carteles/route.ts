import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCartel from '@/models/StudioCartel';
import StudioDj from '@/models/StudioDj';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    await connectDB();
    const carteles = await StudioCartel.find({ canal_id: session.canal_id }).sort({ creado_en: -1 }).lean();

    // Enriquecer con nombre del DJ
    const djIds = [...new Set(carteles.map((c) => c.dj_id))].filter(Boolean);
    const djs = await StudioDj.find({ _id: { $in: djIds } }).lean();
    const djMap = Object.fromEntries(djs.map((d) => [String(d._id), d.nombre]));

    const enriched = carteles.map((c) => ({
      ...c,
      dj_nombre: c.dj_id ? (djMap[c.dj_id] ?? 'DJ') : 'IA',
    }));

    return NextResponse.json({ carteles: enriched });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const body = await request.json() as {
      nombre_evento: string;
      nombre_dj?: string;
      fecha: string;
      cartel_path: string;
      prompt_ia?: string;
    };

    if (!body.nombre_evento || !body.cartel_path) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    await connectDB();
    const cartel = await StudioCartel.create({
      dj_id: '',
      nombre_evento: body.nombre_evento.trim(),
      fecha: body.fecha?.trim() ?? '',
      hora_inicio: '',
      canal_id: session.canal_id,
      cartel_path: body.cartel_path,
      tipo: 'ia',
      prompt_ia: body.prompt_ia ?? '',
      prompt_usuario: body.nombre_dj ?? '',
    });

    return NextResponse.json({ cartel }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
