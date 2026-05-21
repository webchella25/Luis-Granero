import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { createReadStream, statSync } from 'fs';
import path from 'path';

interface RouteParams {
  params: Promise<{ canal_id: string; categoria: string; filename: string }>;
}

const VALID_CATEGORIES = [
  'hook',
  'intro',
  'desarrollo',
  'profundizacion',
  'perspectiva',
  'reflexion',
  'background',
  'intense',
  'ending',
];

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { canal_id, categoria, filename } = await params;

    if (!VALID_CATEGORIES.includes(categoria)) {
      return new NextResponse(null, { status: 404 });
    }

    const safeCanal = path.basename(canal_id);
    const safeFilename = path.basename(filename);
    const filePath = path.join(
      process.cwd(),
      'public',
      'studio',
      'music',
      safeCanal,
      categoria,
      safeFilename
    );

    await fs.access(filePath);

    const stat = statSync(filePath);
    const fileSize = stat.size;
    const rangeHeader = request.headers.get('range');

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const stream = createReadStream(filePath, { start, end });
      const nodeStream = stream as unknown as ReadableStream;

      return new NextResponse(nodeStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=2592000',
        },
      });
    }

    const buffer = await fs.readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
        'Content-Length': String(fileSize),
        'Cache-Control': 'public, max-age=2592000',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
