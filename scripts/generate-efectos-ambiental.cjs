#!/usr/bin/env node
/**
 * Genera los MP4 de efectos visuales para el pipeline de música ambiental.
 * Ejecutar una vez en el servidor: node scripts/generate-efectos-ambiental.js
 *
 * Efectos generados (fondo negro + elementos brillantes):
 *   - lluvia.mp4          → lluvia intensa (ruido + desenfoque vertical)
 *   - lluvia_suave.mp4    → lluvia suave (ídem, más tenue)
 *   - particulas_luz.mp4  → partículas doradas flotantes (interferencia de senos)
 *   - vapor_cafe.mp4      → volutas de vapor ascendente
 *   - olas_suaves.mp4     → bandas horizontales ondulantes
 *
 * Todos usan fondo negro puro. El generador de vídeo los aplica con blend=screen,
 * por lo que el negro desaparece y solo se ven los elementos brillantes sobre la imagen.
 */

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const OUT = path.join(process.cwd(), 'public', 'studio', 'efectos');
fs.mkdirSync(OUT, { recursive: true });

const W = 1920, H = 1080, FPS = 30, DUR = 60;

function runFFmpeg(args) {
  const outFile = args[args.length - 1];
  process.stdout.write(`→ ${path.basename(outFile)}... `);
  try {
    execFileSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    console.log('✓');
  } catch (err) {
    console.log('✗');
    console.error(err.stderr?.toString() || err.message);
    process.exit(1);
  }
}

function o(name) {
  return path.join(OUT, `${name}.mp4`);
}

const base = ['-y', '-f', 'lavfi', '-i', `color=c=black:size=${W}x${H}:rate=${FPS}`];
const enc = ['-t', String(DUR), '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-preset', 'fast', '-crf', '28', '-an'];

console.log(`\nGenerando efectos en: ${OUT}\n`);

// ─── lluvia ─────────────────────────────────────────────────────────────────
// Ruido espacial (no temporal) + desenfoque vertical + scroll descendente
// scroll hace que las rayas caigan hacia abajo y H.264 lo comprime bien con motion vectors
runFFmpeg([
  ...base,
  '-vf', [
    'noise=alls=80',
    'gblur=sigma=0.3:sigmaV=10',
    'colorlevels=rimin=0.12:rimax=0.31:gimin=0.12:gimax=0.31:bimin=0.12:bimax=0.31',
    'scroll=vertical=0.25',
  ].join(','),
  ...enc, o('lluvia'),
]);

// ─── lluvia_suave ────────────────────────────────────────────────────────────
// Igual pero más tenue: menos ruido, más desenfoque, caída más lenta
runFFmpeg([
  ...base,
  '-vf', [
    'noise=alls=42',
    'gblur=sigma=0.5:sigmaV=18',
    'colorlevels=rimin=0.06:rimax=0.17:gimin=0.06:gimax=0.17:bimin=0.06:bimax=0.17',
    'scroll=vertical=0.12',
  ].join(','),
  ...enc, o('lluvia_suave'),
]);

// ─── particulas_luz ──────────────────────────────────────────────────────────
// Interferencia de 3 ondas seno → puntos de luz dorados animados
// cb=100 (menos azul) cr=155 (más rojo) → tono cálido/dorado
runFFmpeg([
  ...base,
  '-vf', [
    "geq=lum='max(0,sin(X*0.12+T*2.1)*sin(Y*0.11-T*1.6)*sin((X-Y)*0.06+T*0.9)*255)':cb=100:cr=155",
    'gblur=sigma=4',
  ].join(','),
  ...enc, o('particulas_luz'),
]);

// ─── vapor_cafe ──────────────────────────────────────────────────────────────
// Volutas de vapor ascendente con movimiento sinusoidal
// Y*0.01-T*1.2 → desplazamiento hacia arriba en el tiempo
// cb=120 cr=140 → tono cálido marrón/tostado
runFFmpeg([
  ...base,
  '-vf', [
    "geq=lum='max(0,sin(X*0.02+sin(T*0.4+Y*0.004)*12+T*0.15)*sin(Y*0.01-T*1.2)*sin(X*0.035-T*0.3)*200)':cb=120:cr=140",
    'gblur=sigma=20',
  ].join(','),
  ...enc, o('vapor_cafe'),
]);

// ─── olas_suaves ─────────────────────────────────────────────────────────────
// Bandas horizontales ondulantes (efecto río/lago)
// cb=130 cr=135 → tono ligeramente azulado/agua
runFFmpeg([
  ...base,
  '-vf', [
    "geq=lum='max(0,sin(Y*0.008+T*0.4+X*0.003)*sin(Y*0.015-T*0.3)*100+20)':cb=130:cr=135",
    'gblur=sigma=8',
  ].join(','),
  ...enc, o('olas_suaves'),
]);

console.log('\n✅ Todos los efectos generados correctamente.\n');
