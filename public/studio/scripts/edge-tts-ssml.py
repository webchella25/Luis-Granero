import asyncio
import edge_tts
import sys

async def main():
    ssml_file = sys.argv[1]
    output_file = sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else "es-ES-AlvaroNeural"

    with open(ssml_file, 'r', encoding='utf-8') as f:
        ssml_content = f.read()

    communicate = edge_tts.Communicate(
        ssml_content,
        voice=voice
    )
    await communicate.save(output_file)

asyncio.run(main())
