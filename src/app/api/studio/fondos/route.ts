import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioFondo from '@/models/StudioFondo';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    await connectDB();
    const fondos = await StudioFondo.find({ canal_id: session.canal_id }).sort({ created_at: -1 }).limit(6).lean();
    return NextResponse.json({ fondos });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
