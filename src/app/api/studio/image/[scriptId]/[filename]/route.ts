import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface RouteParams {
  params: Promise<{ scriptId: string; filename: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { scriptId, filename } = await params;

    // Sanitizar para evitar path traversal
    const safeScriptId = path.basename(scriptId);
    const safeFilename = path.basename(filename);

    const filePath = path.join(
      process.cwd(),
      'public',
      'studio',
      'images',
      safeScriptId,
      safeFilename
    );

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
