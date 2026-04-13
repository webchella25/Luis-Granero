import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error('JWT_SECRET o NEXTAUTH_SECRET no configurado');
  return new TextEncoder().encode(s);
}

export interface StudioSession {
  workspace_id: string;
  canal_id: string | null;
}

export async function createStudioJWT(session: StudioSession): Promise<string> {
  return new SignJWT({ workspace_id: session.workspace_id, canal_id: session.canal_id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyStudioJWT(token: string): Promise<StudioSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const workspace_id = payload.workspace_id as string | undefined;
    if (!workspace_id) return null;
    return {
      workspace_id,
      canal_id: (payload.canal_id as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

// Read session from headers injected by middleware
export function getStudioSession(request: NextRequest): StudioSession | null {
  const workspace_id = request.headers.get('x-studio-workspace-id');
  if (!workspace_id) return null;
  const canal_id = request.headers.get('x-studio-canal-id') || null;
  return { workspace_id, canal_id };
}
