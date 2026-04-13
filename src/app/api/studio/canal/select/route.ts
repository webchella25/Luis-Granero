import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession, createStudioJWT } from '@/lib/studio/session';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { canal_id } = (await request.json()) as { canal_id?: string };
  if (!canal_id) return NextResponse.json({ error: 'canal_id requerido' }, { status: 400 });

  await connectDB();
  const canal = await StudioCanal.findOne({
    _id: canal_id,
    workspace_id: session.workspace_id,
  }).lean();

  if (!canal) return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 });

  const token = await createStudioJWT({ workspace_id: session.workspace_id, canal_id });

  const response = NextResponse.json({ success: true });
  response.cookies.set('studio_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
  return response;
}
