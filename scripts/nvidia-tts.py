#!/usr/bin/env python3
import sys
import json
import os
import struct
import tempfile
import subprocess

import re
import unicodedata
import riva.client

FUNCTION_ID = "877104f7-e885-42b9-8de8-f6e4c6303969"
GRPC_URI    = "grpc.nvcf.nvidia.com:443"
SAMPLE_RATE = 24000
CHAR_LIMIT  = 1500  # Riva/Magpie límite real: 2000 chars; margen para expansión de sanitize

# Mapa de caracteres Unicode problemáticos para Riva/Triton TTS
_CHAR_MAP = str.maketrans({
    '‘': "'", '’': "'",   # comillas simples tipográficas
    '“': '"', '”': '"',   # comillas dobles tipográficas
    '«': '"', '»': '"',   # comillas angulares « »
    '—': '-', '–': '-',   # em-dash, en-dash
    '…': '...', '•': '-', # elipsis, bullet
    ' ': ' ',                  # espacio no separable
})

def sanitize_text(text: str) -> str:
    """Normaliza el texto para evitar errores de parsing en Riva/Triton Magpie TTS."""
    text = text.translate(_CHAR_MAP)
    text = re.sub(r'<[^>]*>?', '', text)   # tags XML/SSML incompletos o completos
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)  # control chars
    # Caracteres que actúan como delimitadores en el normalizador de texto de Triton
    text = re.sub(r'[{}|\\^`~]', '', text)
    # Normaliza múltiples espacios/saltos
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def build_wav(pcm_bytes: bytes, sample_rate: int = SAMPLE_RATE) -> bytes:
    """Envuelve PCM crudo (s16le mono) en un contenedor WAV."""
    num_channels   = 1
    bits_per_sample = 16
    byte_rate = sample_rate * num_channels * (bits_per_sample // 8)
    block_align = num_channels * (bits_per_sample // 8)
    data_size = len(pcm_bytes)
    header = struct.pack(
        '<4sI4s4sIHHIIHH4sI',
        b'RIFF', 36 + data_size, b'WAVE',
        b'fmt ', 16, 1, num_channels, sample_rate,
        byte_rate, block_align, bits_per_sample,
        b'data', data_size,
    )
    return header + pcm_bytes

def _hard_split(text: str, max_chars: int) -> list[str]:
    """Divide texto en fragmentos de max_chars por palabras como último recurso."""
    if len(text) <= max_chars:
        return [text]
    result = []
    words = text.split(' ')
    current = ''
    for word in words:
        candidate = (current + ' ' + word).strip() if current else word
        if len(candidate) > max_chars and current:
            result.append(current)
            current = word
        else:
            current = candidate
    if current:
        result.append(current)
    return result

def split_text(text: str, max_chars: int) -> list[str]:
    if len(text) <= max_chars:
        return [text]
    chunks = []
    paragraphs = text.split('\n\n')
    current = ''
    for para in paragraphs:
        sep = '\n\n' if current else ''
        candidate = current + sep + para
        if len(candidate) > max_chars:
            if current:
                chunks.append(current.strip())
                current = para
            else:
                sentences = re.findall(r'[^.!?]+[.!?]+', para) or [para]
                for sent in sentences:
                    cand = (current + ' ' + sent).strip() if current else sent
                    if len(cand) > max_chars and current:
                        chunks.append(current.strip())
                        current = sent
                    else:
                        current = cand
        else:
            current = candidate
    if current.strip():
        chunks.append(current.strip())
    # Garantía final: ningún chunk supera max_chars
    result = []
    for c in chunks:
        result.extend(_hard_split(c, max_chars))
    return result

# Locales no soportados por el endpoint NIM → alias correcto
LOCALE_ALIASES = {'ES-ES': 'ES-US', 'PT-PT': 'PT-BR'}

def normalize_voice(voice: str) -> str:
    """Normaliza el locale en el nombre de voz manteniendo la estructura completa.
    'Magpie-Multilingual.ES-ES.Sofia' → 'Magpie-Multilingual.ES-US.Sofia'
    'ES-US.Leo' → 'ES-US.Leo' (sin cambios)
    """
    parts = voice.split('.')
    normalized = []
    for part in parts:
        if '-' in part and len(part) == 5:
            normalized.append(LOCALE_ALIASES.get(part.upper(), part.upper()))
        else:
            normalized.append(part)
    return '.'.join(normalized)

def voice_to_language_code(voice: str) -> str:
    """Extrae el language_code del nombre de voz normalizado."""
    parts = normalize_voice(voice).split('.')
    for part in parts:
        if '-' in part and len(part) == 5:
            lang, locale = part.split('-', 1)
            return f'{lang.lower()}-{locale.upper()}'
    return 'es-US'


def synthesize(tts: riva.client.SpeechSynthesisService, text: str, voice: str) -> bytes:
    normalized = normalize_voice(voice)
    lang = voice_to_language_code(normalized)
    print(f'[NV] voice_name={normalized} language_code={lang}', flush=True)
    for attempt in range(4):
        try:
            resp = tts.synthesize(
                text,
                voice_name=normalized,
                language_code=lang,
                sample_rate_hz=SAMPLE_RATE,
            )
            return resp.audio
        except Exception as e:
            if attempt < 3:
                import time
                wait = 2 ** attempt
                print(f'[NV]  Error (intento {attempt+1}/4): {e}. Retry en {wait}s...', flush=True)
                time.sleep(wait)
            else:
                raise

def main():
    if len(sys.argv) < 5:
        print('Usage: nvidia-tts.py <chunks_json> <output_mp3> <voice> <api_key>', file=sys.stderr)
        sys.exit(1)

    chunks_file = sys.argv[1]
    output_path = sys.argv[2]
    voice       = sys.argv[3]
    api_key     = sys.argv[4]

    with open(chunks_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sections = data['sections']
    print(f'[NV] Secciones recibidas: {len(sections)}', flush=True)

    auth = riva.client.Auth(
        use_ssl=True,
        uri=GRPC_URI,
        metadata_args=[
            ['function-id', FUNCTION_ID],
            ['authorization', f'Bearer {api_key}'],
        ],
        options=[('grpc.max_receive_message_length', -1)],
    )
    tts = riva.client.SpeechSynthesisService(auth)

    tmpdir = tempfile.mkdtemp()
    wav_files = []

    for i, section in enumerate(sections):
        paragraphs = [p.strip() for p in section.split('\n\n') if p.strip()]
        print(f'[NV] Sección {i+1}/{len(sections)}: {len(paragraphs)} párrafos', flush=True)

        for j, para in enumerate(paragraphs):
            chunks = split_text(para, CHAR_LIMIT)
            for k, chunk in enumerate(chunks):
                chunk = sanitize_text(chunk)
                if not chunk:
                    continue
                print(f'[NV]   chunk {i}-{j}-{k}: {len(chunk)} chars | {repr(chunk[:80])}', flush=True)
                pcm = synthesize(tts, chunk, voice)
                wav_bytes = build_wav(pcm)
                wav_path = os.path.join(tmpdir, f'chunk_{i}_{j}_{k}.wav')
                with open(wav_path, 'wb') as wf:
                    wf.write(wav_bytes)
                wav_files.append(wav_path)

    concat_list = os.path.join(tmpdir, 'concat.txt')
    with open(concat_list, 'w') as f:
        for p in wav_files:
            f.write(f"file '{p}'\n")

    subprocess.run([
        'ffmpeg', '-y', '-f', 'concat', '-safe', '0',
        '-i', concat_list,
        '-acodec', 'libmp3lame', '-b:a', '192k',
        output_path,
    ], check=True, capture_output=True)

    for p in wav_files:
        os.remove(p)
    os.remove(concat_list)
    os.rmdir(tmpdir)

    print(f'Audio generado: {output_path}', flush=True)

main()
