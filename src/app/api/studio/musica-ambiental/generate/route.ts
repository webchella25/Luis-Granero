import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioMusicaAmbiental from '@/models/StudioMusicaAmbiental';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const execAsync = promisify(exec);
void execAsync; // referenced by build only

const VIDEOS_DIR = path.join(process.cwd(), 'public', 'studio', 'musica-ambiental', 'videos');
const EFECTOS_DIR = path.join(process.cwd(), 'public', 'studio', 'efectos');

interface TextoOverlayBody {
  activo: boolean;
  linea1: string;
  linea2: string;
  color: string;
  posicion: 'top' | 'center' | 'bottom';
}

interface GenerateBody {
  mood: string;
  prompt_flux: string;
  imagen_path: string;
  musica_base64?: string;
  musica_nombre?: string;
  musica_track_path?: string;
  duracion_horas: number;
  efectos: string[];
  titulo: string;
  descripcion: string;
  texto_overlay: TextoOverlayBody | null;
}

function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const stderr: string[] = [];
    proc.stderr?.on('data', (d: Buffer) => stderr.push(d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg código ${code}: ${stderr.slice(-5).join('')}`));
    });
    proc.on('error', reject);
  });
}

function buildDrawtext(overlay: TextoOverlayBody): string {
  if (!overlay.activo) return '';
  const color = overlay.color.replace('#', '');
  const yMap: Record<string, string> = {
    top: 'h*0.1',
    center: '(h-text_h)/2',
    bottom: 'h*0.82',
  };
  const lines: string[] = [];
  if (overlay.linea1) {
    lines.push(
      `drawtext=text='${overlay.linea1.replace(/'/g, "\\'")}':fontsize=72:fontcolor=0x${color}:borderw=3:bordercolor=black:x=(w-text_w)/2:y=${yMap[overlay.posicion]}`
    );
  }
  if (overlay.linea2) {
    const y2 =
      overlay.posicion === 'top'
        ? 'h*0.1+90'
        : overlay.posicion === 'center'
          ? '(h-text_h)/2+90'
          : 'h*0.82+90';
    lines.push(
      `drawtext=text='${overlay.linea2.replace(/'/g, "\\'")}':fontsize=54:fontcolor=0x${color}:borderw=2:bordercolor=black:x=(w-text_w)/2:y=${y2}`
    );
  }
  return lines.join(',');
}

async function generateBackground(
  videoId: string,
  imagenAbsPath: string,
  musicaAbsPath: string,
  duracionHoras: number,
  efectos: string[],
  textoOverlay: TextoOverlayBody | null
): Promise<void> {
  mkdirSync(VIDEOS_DIR, { recursive: true });

  const durSec = Math.round(duracionHoras * 3600);
  const tmpDir = path.join(VIDEOS_DIR, `tmp-${videoId}`);
  await fs.mkdir(tmpDir, { recursive: true });

  const musicaLoopPath = path.join(tmpDir, 'musica_loop.mp3');
  const outputPath = path.join(VIDEOS_DIR, `${videoId}.mp4`);

  try {
    // Paso 1: loop de música con fade in/out
    await runFFmpeg([
      '-stream_loop', '-1',
      '-i', musicaAbsPath,
      '-t', String(durSec),
      '-af', `afade=t=in:d=3,afade=t=out:st=${durSec - 3}:d=3`,
      '-y', musicaLoopPath,
    ]);

    // Paso 2: construir filtros y overlays
    //
    // Input layout:
    //   [0] imagen estática  (-loop 1 -i imagen.jpg)
    //   [1] música en loop   (-i musica_loop.mp3)
    //   [2+] overlays MP4 de efectos (si existen)
    //
    const overlayInputs: string[] = [];
    const filterParts: string[] = [];
    let videoTag = '[0:v]';

    const efectosConOverlay = ['lluvia', 'lluvia_suave', 'vapor_cafe', 'particulas_luz', 'olas_suaves'];

    // El primer overlay ocupa el índice 2 (0=imagen, 1=musica_loop)
    let nextInputIdx = 2;

    for (const efecto of efectos) {
      if (!efectosConOverlay.includes(efecto)) continue;
      const overlayFile = path.join(EFECTOS_DIR, `${efecto}.mp4`);
      if (!existsSync(overlayFile)) continue;
      overlayInputs.push('-stream_loop', '-1', '-t', String(durSec), '-i', overlayFile);
      const nextTag = `[v${nextInputIdx}]`;
      filterParts.push(`${videoTag}[${nextInputIdx}:v]overlay=format=auto${nextTag}`);
      videoTag = nextTag;
      nextInputIdx++;
    }

    // Efectos FFmpeg puros (sin fichero externo)
    const pureParts: string[] = [];
    if (efectos.includes('parpadeo_luces')) pureParts.push("eq=brightness='0.03*sin(t/3)'");
    if (efectos.includes('niebla')) pureParts.push("colorchannelmixer=rr=1.02:gg=1.02:bb=1.02");
    if (efectos.includes('neon_parpadeo')) pureParts.push("eq=saturation='1.1+0.1*sin(t*2)'");

    if (pureParts.length > 0) {
      const nextTag = '[vpure]';
      filterParts.push(`${videoTag}${pureParts.join(',')}${nextTag}`);
      videoTag = nextTag;
    }

    // Texto overlay
    if (textoOverlay?.activo) {
      const drawtextFilter = buildDrawtext(textoOverlay);
      if (drawtextFilter) {
        const nextTag = '[vtext]';
        filterParts.push(`${videoTag}${drawtextFilter}${nextTag}`);
        videoTag = nextTag;
      }
    }

    // Comando FFmpeg final
    const args: string[] = [
      '-loop', '1', '-i', imagenAbsPath,   // [0] imagen
      '-i', musicaLoopPath,                 // [1] música
      ...overlayInputs,                     // [2+] efectos MP4
    ];

    if (filterParts.length > 0) {
      args.push('-filter_complex', filterParts.join(';'));
      args.push('-map', videoTag);
      args.push('-map', '1:a');  // audio del input [1] (música)
    }

    args.push(
      '-c:v', 'libx264',
      '-tune', 'stillimage',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-pix_fmt', 'yuv420p',
      '-t', String(durSec),
      '-y', outputPath
    );

    await runFFmpeg(args);
    await fs.rm(tmpDir, { recursive: true, force: true });

    await connectDB();
    await StudioMusicaAmbiental.findByIdAndUpdate(videoId, {
      $set: {
        video_path: `/api/studio/musica-ambiental/video/${videoId}.mp4`,
        estado: 'listo',
      },
    });
    console.log(`✅ Vídeo musical listo: ${videoId}`);
  } catch (err) {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => null);
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[musica-ambiental/generate]', msg);
    await connectDB();
    await StudioMusicaAmbiental.findByIdAndUpdate(videoId, {
      $set: { estado: 'error', error_msg: msg.slice(0, 500) },
    });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id)
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  try {
    const body = (await request.json()) as GenerateBody;

    if (!body.imagen_path)
      return NextResponse.json({ error: 'imagen_path es obligatorio' }, { status: 400 });
    if (!body.musica_base64 && !body.musica_track_path) {
      return NextResponse.json(
        { error: 'Se requiere archivo de música o track de biblioteca' },
        { status: 400 }
      );
    }

    await connectDB();

    const doc = await StudioMusicaAmbiental.create({
      canal_id: session.canal_id,
      workspace_id: session.workspace_id,
      mood: body.mood,
      prompt_flux: body.prompt_flux,
      imagen_path: body.imagen_path,
      musica_nombre: body.musica_nombre ?? 'track',
      duracion_horas: body.duracion_horas,
      efectos: body.efectos,
      titulo: body.titulo,
      descripcion: body.descripcion,
      texto_overlay: body.texto_overlay,
      estado: 'generando_video',
    });

    const videoId = doc._id.toString();
    const imagenAbsPath = path.join(process.cwd(), 'public', body.imagen_path);

    let musicaAbsPath: string;
    if (body.musica_track_path) {
      musicaAbsPath = body.musica_track_path;
    } else {
      const musicaDir = path.join(
        process.cwd(),
        'public',
        'studio',
        'musica-ambiental',
        'musica'
      );
      mkdirSync(musicaDir, { recursive: true });
      const ext = body.musica_nombre?.split('.').pop() ?? 'mp3';
      const musicaFilename = `${videoId}-musica.${ext}`;
      musicaAbsPath = path.join(musicaDir, musicaFilename);
      const buffer = Buffer.from(body.musica_base64!, 'base64');
      await fs.writeFile(musicaAbsPath, buffer);
    }

    await StudioMusicaAmbiental.findByIdAndUpdate(videoId, {
      $set: { musica_path: musicaAbsPath },
    });

    // Fire-and-forget — devolvemos inmediatamente
    generateBackground(
      videoId,
      imagenAbsPath,
      musicaAbsPath,
      body.duracion_horas,
      body.efectos,
      body.texto_overlay
    ).catch(console.error);

    return NextResponse.json({ status: 'processing', video_id: videoId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('[musica-ambiental/generate] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
