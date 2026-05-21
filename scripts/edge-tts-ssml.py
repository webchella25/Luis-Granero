import asyncio
import edge_tts
import sys
import json
import os
import tempfile
import subprocess

async def synthesize_chunk(
    text: str,
    voice: str,
    output_path: str,
    rate: str,
    pitch: str,
    volume: str,
    max_retries: int = 4
):
    for attempt in range(max_retries):
        try:
            communicate = edge_tts.Communicate(
                text,
                voice=voice,
                rate=rate,
                pitch=pitch,
                volume=volume
            )
            audio_bytes = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_bytes += chunk["data"]
            with open(output_path, 'wb') as f:
                f.write(audio_bytes)
            return
        except Exception as e:
            if attempt < max_retries - 1:
                wait = 2 ** attempt
                print(f"[PY]   Error TTS (intento {attempt+1}/{max_retries}): {e}. Reintentando en {wait}s...", flush=True)
                await asyncio.sleep(wait)
            else:
                raise

def generate_silence(duration_ms: int, output_path: str):
    subprocess.run([
        'ffmpeg', '-y',
        '-f', 'lavfi',
        '-i', 'anullsrc=r=24000:cl=mono',
        '-t', str(duration_ms / 1000),
        '-acodec', 'libmp3lame',
        '-b:a', '192k',
        output_path
    ], check=True, capture_output=True)

def concat_files(file_list: list, output_path: str):
    concat_list = output_path + '.txt'
    with open(concat_list, 'w') as f:
        for fp in file_list:
            f.write(f"file '{fp}'\n")
    subprocess.run([
        'ffmpeg', '-y',
        '-f', 'concat', '-safe', '0',
        '-i', concat_list,
        '-acodec', 'libmp3lame',
        '-b:a', '192k',
        output_path
    ], check=True, capture_output=True)
    os.remove(concat_list)

def get_duration(path: str) -> float:
    result = subprocess.run(
        ['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
        capture_output=True, text=True
    )
    try:
        return float(result.stdout.strip())
    except ValueError:
        return 0.0

async def main():
    chunks_file = sys.argv[1]
    output_file = sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else "es-ES-AlvaroNeural"
    rate = sys.argv[4] if len(sys.argv) > 4 else "-8%"
    pitch = sys.argv[5] if len(sys.argv) > 5 else "-14Hz"
    volume = sys.argv[6] if len(sys.argv) > 6 else "+0%"

    with open(chunks_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sections = data["sections"]
    pause_between = data.get("pause_between", 1500)
    pause_paragraph = data.get("pause_paragraph", 800)

    print(f"[PY] Secciones recibidas: {len(sections)}", flush=True)
    print(f"[PY] Voz: {voice} rate={rate} pitch={pitch} volume={volume}", flush=True)

    tmpdir = tempfile.mkdtemp()

    silence_section = os.path.join(tmpdir, 'silence_section.mp3')
    silence_paragraph = os.path.join(tmpdir, 'silence_paragraph.mp3')
    generate_silence(pause_between, silence_section)
    generate_silence(pause_paragraph, silence_paragraph)

    section_files = []
    section_durations = []

    for i, section in enumerate(sections):
        paragraphs = [p.strip() for p in section.split('\n\n') if p.strip()]
        print(f"[PY] Sección {i+1}/{len(sections)}: {len(paragraphs)} párrafos", flush=True)

        section_parts = []
        for j, paragraph in enumerate(paragraphs):
            print(f"[PY]   Párrafo {j+1}/{len(paragraphs)}: {len(paragraph)} chars", flush=True)
            chunk_path = os.path.join(tmpdir, f'chunk_{i}_{j}.mp3')
            await synthesize_chunk(paragraph, voice, chunk_path, rate, pitch, volume)
            section_parts.append(chunk_path)
            if j < len(paragraphs) - 1:
                section_parts.append(silence_paragraph)

        # Concatenar la sección en un archivo propio y medir su duración
        section_path = os.path.join(tmpdir, f'section_{i}.mp3')
        concat_files(section_parts, section_path)
        dur = get_duration(section_path)
        section_durations.append(round(dur, 3))
        section_files.append(section_path)
        print(f"[PY] Sección {i+1} duración: {dur:.3f}s", flush=True)

    # Concatenar secciones con silencio entre ellas
    final_parts = []
    for i, sf in enumerate(section_files):
        final_parts.append(sf)
        if i < len(section_files) - 1:
            final_parts.append(silence_section)

    concat_files(final_parts, output_file)

    for file in os.listdir(tmpdir):
        os.remove(os.path.join(tmpdir, file))
    os.rmdir(tmpdir)

    print(f"Audio generado: {output_file}")
    # Emitir duraciones como JSON para que Node.js las pueda parsear
    print(f"SECTION_DURATIONS:{json.dumps(section_durations)}", flush=True)

asyncio.run(main())
