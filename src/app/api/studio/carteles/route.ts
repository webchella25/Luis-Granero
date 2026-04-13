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
    const djIds = [...new Set(carteles.map((c) => c.dj_id))];
    const djs = await StudioDj.find({ _id: { $in: djIds } }).lean();
    const djMap = Object.fromEntries(djs.map((d) => [String(d._id), d.nombre]));

    const enriched = carteles.map((c) => ({
      ...c,
      dj_nombre: djMap[c.dj_id] ?? 'DJ',
    }));

    return NextResponse.json({ carteles: enriched });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
