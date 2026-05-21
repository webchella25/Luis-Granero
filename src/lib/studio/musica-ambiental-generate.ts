import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioMusicaAmbiental from '@/models/StudioMusicaAmbiental';
import type { TextoOverlay } from '@/models/StudioMusicaAmbiental';

export const VIDEOS_DIR = path.join(process.cwd(), 'public', 'studio', 'musica-ambiental', 'videos');
const EFECTOS_DIR = path.join(process.cwd(), 'public', 'studio', 'efectos');

export function runFFmpeg(args: string[]): Promise<void> {
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

export function buildDrawtext(overlay: TextoOverlay): string {
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

export async function generateBackground(
  videoId: string,
  imagenAbsPath: string,
  musicaAbsPath: string,
  duracionHoras: number,
  efectos: string[],
  textoOverlay: TextoOverlay | null
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

    // Input layout:
    //   [0] imagen estática  (-loop 1 -i imagen.jpg)
    //   [1] música en loop   (-i musica_loop.mp3)
    //   [2+] overlays MP4 de efectos (si existen)
    const overlayInputs: string[] = [];
    const filterParts: string[] = [];
    let videoTag = '[0:v]';

    const efectosConOverlay = ['lluvia', 'lluvia_suave', 'vapor_cafe', 'particulas_luz', 'olas_suaves'];
    let nextInputIdx = 2;

    for (const efecto of efectos) {
      if (!efectosConOverlay.includes(efecto)) continue;
      const overlayFile = path.join(EFECTOS_DIR, `${efecto}.mp4`);
      if (!existsSync(overlayFile)) continue;
      overlayInputs.push('-stream_loop', '-1', '-t', String(durSec), '-i', overlayFile);
      const nextTag = `[v${nextInputIdx}]`;
      filterParts.push(`${videoTag}[${nextInputIdx}:v]blend=all_mode=screen${nextTag}`);
      videoTag = nextTag;
      nextInputIdx++;
    }

    const pureParts: string[] = [];
    if (efectos.includes('parpadeo_luces')) pureParts.push("eq=brightness='0.03*sin(t/3)'");
    if (efectos.includes('niebla')) pureParts.push("colorchannelmixer=rr=1.02:gg=1.02:bb=1.02");
    if (efectos.includes('neon_parpadeo')) pureParts.push("eq=saturation='1.1+0.1*sin(t*2)'");

    if (pureParts.length > 0) {
      const nextTag = '[vpure]';
      filterParts.push(`${videoTag}${pureParts.join(',')}${nextTag}`);
      videoTag = nextTag;
    }

    if (textoOverlay?.activo) {
      const drawtextFilter = buildDrawtext(textoOverlay);
      if (drawtextFilter) {
        const nextTag = '[vtext]';
        filterParts.push(`${videoTag}${drawtextFilter}${nextTag}`);
        videoTag = nextTag;
      }
    }

    const args: string[] = [
      '-loop', '1', '-i', imagenAbsPath,
      '-i', musicaLoopPath,
      ...overlayInputs,
    ];

    if (filterParts.length > 0) {
      args.push('-filter_complex', filterParts.join(';'));
      args.push('-map', videoTag);
      args.push('-map', '1:a');
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
