import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  try {
    const { path: segments } = await params;
    // Anti-traversal: reject any segment containing '..'
    if (segments.some(s => s.includes('..'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const filePath = path.join(process.cwd(), 'public', 'studio', 'carteles', ...segments);
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(segments[segments.length - 1]).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=2592000',
      },
    });
  } catch {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
}
