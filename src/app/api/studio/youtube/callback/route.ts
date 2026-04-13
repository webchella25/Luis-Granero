import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokensForCanal } from '@/lib/studio/youtube-auth';

const BASE = process.env.NEXTAUTH_URL ?? 'https://www.luisgranero.com';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const canalId = searchParams.get('state');

  if (error) {
    return NextResponse.redirect(`${BASE}/studio/configuracion?error=${encodeURIComponent(error)}`);
  }
  if (!code || !canalId) {
    return NextResponse.redirect(`${BASE}/studio/configuracion?error=${encodeURIComponent('Datos de autorización incompletos')}`);
  }

  try {
    await exchangeCodeForTokensForCanal(code, canalId);
    return NextResponse.redirect(`${BASE}/studio/configuracion?connected=1`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.redirect(`${BASE}/studio/configuracion?error=${encodeURIComponent(msg)}`);
  }
}
