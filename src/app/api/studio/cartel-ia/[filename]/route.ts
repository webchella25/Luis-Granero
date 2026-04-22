import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import fs from 'fs/promises';
import path from 'path';

const CARTELES_IA_DIR = path.join(process.cwd(), 'public', 'studio', 'carteles', 'ia');

interface RouteParams {
  params: Promise<{ filename: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return new NextResponse(null, { status: 401 });

  try {
    const { filename } = await params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(CARTELES_IA_DIR, safeFilename);

    if (!filePath.startsWith(CARTELES_IA_DIR + path.sep)) {
      return new NextResponse(null, { status: 400 });
    }

    const buffer = await fs.readFile(filePath);
    const ext = path.extname(safeFilename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };
    const contentType = mimeTypes[ext] ?? 'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=2592000',
        'Content-Length': String(buffer.length),
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
