import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface RouteParams { params: Promise<{ filename: string }> }

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { filename } = await params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'studio', 'musica-ambiental', 'miniaturas', safeFilename);
    const buffer = await fs.readFile(filePath);
    const isDownload = new URL(request.url).searchParams.get('download') === '1';
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        ...(isDownload
          ? { 'Content-Disposition': `attachment; filename="${safeFilename}"` }
          : { 'Cache-Control': 'no-store' }),
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
