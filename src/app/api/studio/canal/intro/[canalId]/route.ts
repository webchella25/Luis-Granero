import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { spawn } from 'child_process';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';

interface RouteParams {
  params: Promise<{ canalId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { canalId } = await params;
  const safeCanalId = path.basename(canalId);
  const introPath = path.join(process.cwd(), 'public', 'studio', 'canales', safeCanalId, 'intro.mp4');

  try {
    const buffer = await fs.readFile(introPath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-cache, no-store',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}

// Genera un tagline corto a partir del nicho
function buildTagline(nicho: string): string {
  if (!nicho) return '';
  // Tomar primeras palabras clave separadas por comas o punto — máx 5 tokens
  const parts = nicho
    .split(/[,.\-·|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  return parts.join(' · ').slice(0, 60).toUpperCase();
}

// Regenerar intro en background con los datos reales del canal
export async function POST(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { canalId } = await params;
  const safeCanalId = path.basename(canalId);
  const outDir = path.join(process.cwd(), 'public', 'studio', 'canales', safeCanalId);
  const remotionDir = path.join(process.cwd(), 'remotion-intro');
  const outPath = path.join(outDir, 'intro.mp4');

  await fs.mkdir(outDir, { recursive: true });

  // Leer datos del canal
  await connectDB();
  const canal = await StudioCanal.findById(safeCanalId).select('nombre nicho').lean() as { nombre?: string; nicho?: string } | null;
  const nombre = canal?.nombre ?? 'MI CANAL';
  const tagline = buildTagline(canal?.nicho ?? '');

  // Copiar logo del canal al directorio de Remotion
  const logoSrc = path.join(outDir, 'logo.png');
  const logoDst = path.join(remotionDir, 'public', 'logo.png');
  try {
    await fs.copyFile(logoSrc, logoDst);
  } catch { /* sin logo */ }

  // Props para Remotion como JSON
  const props = JSON.stringify({ nombre, tagline });

  const proc = spawn(
    'npx',
    ['remotion', 'render', 'AlmasIntro', outPath, '--props', props],
    { cwd: remotionDir, stdio: 'ignore', detached: true }
  );
  proc.unref();

  return NextResponse.json({ message: `Generando intro para "${nombre}", disponible en ~40 segundos` });
}
