import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface RouteParams {
  params: Promise<{ filename: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { filename } = await params;
    const safeFilename = path.basename(filename);

    const filePath = path.join(
      process.cwd(),
      'public',
      'studio',
      'thumbnails',
      safeFilename
    );

    const buffer = await fs.readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=2592000',
        'Content-Length': String(buffer.length),
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
