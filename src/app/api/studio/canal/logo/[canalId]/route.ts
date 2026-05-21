import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const EXTS = ['png', 'jpg', 'webp'];
const MIME: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };

interface RouteParams {
  params: Promise<{ canalId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { canalId } = await params;
  const safeCanalId = path.basename(canalId);
  const dir = path.join(process.cwd(), 'public', 'studio', 'canales', safeCanalId);

  for (const ext of EXTS) {
    try {
      const buffer = await fs.readFile(path.join(dir, `logo.${ext}`));
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': MIME[ext],
          'Cache-Control': 'public, max-age=86400, must-revalidate',
        },
      });
    } catch {
      // siguiente extensión
    }
  }

  return new NextResponse(null, { status: 404 });
}
