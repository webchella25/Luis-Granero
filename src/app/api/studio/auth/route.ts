import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import StudioWorkspace from '@/models/StudioWorkspace';
import StudioCanal from '@/models/StudioCanal';
import { createStudioJWT } from '@/lib/studio/session';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { password } = (await request.json()) as { password?: string };
    if (!password) {
      return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 });
    }

    await connectDB();

    const workspaces = await StudioWorkspace.find({}).lean();
    if (workspaces.length === 0) {
      // Pre-migration fallback: compare with STUDIO_PASSWORD directly
      const studioPassword = process.env.STUDIO_PASSWORD;
      if (studioPassword && password === studioPassword) {
        const token = await createStudioJWT({ workspace_id: 'pre-migration', canal_id: null });
        const response = NextResponse.json({ success: true, requiresCanalSelection: true });
        response.cookies.set('studio_session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });
        return response;
      }
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    let matchedWorkspace = null;
    for (const ws of workspaces) {
      const ok = await bcrypt.compare(password, ws.password_hash);
      if (ok) { matchedWorkspace = ws; break; }
    }

    if (!matchedWorkspace) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const workspaceId = matchedWorkspace._id.toString();
    const canales = await StudioCanal.find({ workspace_id: workspaceId }).lean();

    let canalId: string | null = null;
    let requiresCanalSelection = false;

    if (canales.length === 1) {
      canalId = canales[0]._id.toString();
    } else if (canales.length > 1) {
      requiresCanalSelection = true;
    }

    const token = await createStudioJWT({ workspace_id: workspaceId, canal_id: canalId });

    const response = NextResponse.json({ success: true, requiresCanalSelection });
    response.cookies.set('studio_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('Error en auth studio:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('studio_session');
  return response;
}
