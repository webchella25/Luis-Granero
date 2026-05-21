/**
 * Sincroniza los MP3 de public/studio/music/* con la colección studio_music_tracks en MongoDB.
 * Sólo inserta los que aún no existen (por archivo_path).
 * Uso: node scripts/sync-music-to-db.mjs
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI no definida'); process.exit(1); }

const CATEGORIES = ['intro', 'background', 'intense', 'ending'];

function getMp3Duration(filePath) {
  try {
    const out = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    ).toString().trim();
    return parseFloat(out) || 0;
  } catch { return 0; }
}

const TrackSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  categoria: { type: String, required: true, enum: CATEGORIES },
  archivo_path: { type: String, required: true },
  duracion_segundos: { type: Number, default: 0 },
  uses: { type: Number, default: 0 },
  ultimo_uso: { type: Date, default: null },
  creado_en: { type: Date, default: Date.now },
});

const Track = mongoose.models.StudioMusicTrack ||
  mongoose.model('StudioMusicTrack', TrackSchema);

await mongoose.connect(MONGODB_URI);
console.log('Conectado a MongoDB');

const existing = await Track.find({}, 'archivo_path').lean();
const existingPaths = new Set(existing.map(t => t.archivo_path));
console.log(`Tracks existentes en DB: ${existing.length}`);

let inserted = 0;
for (const cat of CATEGORIES) {
  const dir = path.join(root, 'public', 'studio', 'music', cat);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.mp3'));
  for (const file of files) {
    const archivoPath = `/studio/music/${cat}/${file}`;
    if (existingPaths.has(archivoPath)) {
      console.log(`  [SKIP] ${archivoPath}`);
      continue;
    }
    const absPath = path.join(dir, file);
    const duracion = getMp3Duration(absPath);
    const nombre = file.replace(/^\d+_/, '').replace(/_/g, ' ').replace(/\.mp3$/i, '');
    await Track.create({ nombre, categoria: cat, archivo_path: archivoPath, duracion_segundos: duracion });
    console.log(`  [OK] ${archivoPath} — ${duracion.toFixed(1)}s`);
    inserted++;
  }
}

console.log(`\nTotal insertados: ${inserted}`);
await mongoose.disconnect();
