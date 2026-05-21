import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/checkAuth';

export async function requireAdmin(request) {
  const session = await checkAuth(request);

  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    };
  }

  if (session.user.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Permisos insuficientes' },
        { status: 403 }
      )
    };
  }

  return {
    ok: true,
    session,
    user: session.user
  };
}

export function clampPaginationLimit(value, defaultLimit = 50, maxLimit = 100) {
  const parsed = Number.parseInt(value || `${defaultLimit}`, 10);
  if (Number.isNaN(parsed) || parsed < 1) return defaultLimit;
  return Math.min(parsed, maxLimit);
}

export function clampPage(value) {
  const parsed = Number.parseInt(value || '1', 10);
  if (Number.isNaN(parsed) || parsed < 1) return 1;
  return parsed;
}
