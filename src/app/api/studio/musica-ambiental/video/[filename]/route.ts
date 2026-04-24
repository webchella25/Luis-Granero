import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { createReadStream, statSync } from 'fs';
import path from 'path';

interface RouteParams { params: Promise<{ filename: string }> }

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { filename } = await params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'studio', 'musica-ambiental', 'videos', safeFilename);

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
      return new NextResponse(stream as unknown as ReadableStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': 'video/mp4',
          'Cache-Control': 'public, max-age=2592000',
        },
      });
    }

    const buffer = await fs.readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Content-Length': String(fileSize),
        'Cache-Control': 'public, max-age=2592000',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
