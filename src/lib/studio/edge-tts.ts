import { spawn } from 'child_process';
import path from 'path';

export const EDGE_TTS_VOICE = 'es-ES-AlvaroNeural';
export const EDGE_TTS_RATE = process.env.EDGE_TTS_RATE ?? '-8%';
export const EDGE_TTS_PITCH = process.env.EDGE_TTS_PITCH ?? '-14Hz';
export const EDGE_TTS_VOLUME = process.env.EDGE_TTS_VOLUME ?? '+0%';

// Script Python que sintetiza por secciones y añade silencios reales con pydub
const PYTHON_SCRIPT = path.join(process.cwd(), 'scripts', 'edge-tts-ssml.py');

export interface EdgeTTSResult {
  sectionDurations: number[];
}

/**
 * Genera audio con edge_tts vía el script Python.
 * El inputFile debe ser un JSON con { sections, pause_between, pause_paragraph }.
 * Devuelve las duraciones exactas de cada sección en segundos.
 */
export function runEdgeTTS(inputFile: string, outputMp3: string): Promise<EdgeTTSResult> {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', [
      PYTHON_SCRIPT,
      inputFile,
      outputMp3,
      EDGE_TTS_VOICE,
      EDGE_TTS_RATE,
      EDGE_TTS_PITCH,
      EDGE_TTS_VOLUME,
    ]);

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (chunk: Buffer) => {
      const txt = chunk.toString();
      stdout += txt;
      console.log('[EdgeTTS-PY]', txt.trim());
    });
    proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

    proc.on('close', (code) => {
      if (code === 0) {
        const match = stdout.match(/SECTION_DURATIONS:(\[[\d.,\s]+\])/);
        const sectionDurations: number[] = match ? (JSON.parse(match[1]) as number[]) : [];
        console.log('[EdgeTTS-PY] Duraciones por sección:', sectionDurations);
        resolve({ sectionDurations });
      } else {
        reject(new Error(`edge-tts-ssml.py falló (código ${code}): ${stderr.trim()}`));
      }
    });

    proc.on('error', (err) => reject(new Error(`No se pudo ejecutar python3: ${err.message}`)));
  });
}
