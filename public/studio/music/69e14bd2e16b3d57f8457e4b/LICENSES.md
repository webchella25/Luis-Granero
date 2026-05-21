# Almas Corruptas - musica narrativa

Canal: Almas Corruptas (`69e14bd2e16b3d57f8457e4b`)

Uso previsto: fondo musical integrado dentro de videos narrativos de true crime. Las pistas proceden de Pixabay y las paginas indicaban `Free for use under the Pixabay Content License` y media type `MP3` al verificarlas el 2026-05-16.

Licencia base: Pixabay Content License

Resumen operativo: uso permitido en proyectos de video comerciales y no comerciales cuando la musica forma parte de una obra creativa mayor; atribucion no obligatoria, aunque recomendable. No redistribuir las pistas como archivos standalone.

Fuente de licencia:
- https://pixabay.com/service/faq/
- https://pixabay.com/service/license/

## Pistas instaladas

| Categoria | Archivo | Titulo | Autor | Duracion | Fuente |
| --- | --- | --- | --- | --- | --- |
| hook | `hook/1778929000001_musicviktor11-horror-dark-background-music-458078.mp3` | Horror Dark Background Music | MusicViktor11 | 0:59 | https://pixabay.com/music/mystery-horror-dark-background-music-458078/ |
| intro | `intro/1778929000002_nickpanekaiassets-slow-rise-cinematic-tense-cello-masterpiece-345244.mp3` | Slow Rise - Cinematic Tense Cello Masterpiece | nickpanekAIassets | 2:09 | https://pixabay.com/music/slow-rise-cinematic-tense-cello-masterpiece-345244/ |
| desarrollo | `desarrollo/1778929000003_ovrsoull-true-crime-investigative-pulse-dark-cinematic-drone-slow-tempo-454722.mp3` | True Crime Investigative Pulse Dark Cinematic Drone Slow Tempo | Ovrsoull | 2:11 | https://pixabay.com/music/ambient-true-crime-investigative-pulse-dark-cinematic-drone-slow-tempo-454722/ |
| profundizacion | `profundizacion/1778929000004_nickpanekaiassets-slow-rise-cinematic-tense-cello-masterpiece-345244.mp3` | Slow Rise - Cinematic Tense Cello Masterpiece | nickpanekAIassets | 2:09 | https://pixabay.com/music/slow-rise-cinematic-tense-cello-masterpiece-345244/ |
| perspectiva | `perspectiva/1778929000005_megalix-dark-ambient-soundscape-360794.mp3` | Dark Ambient Soundscape | Megalix | 1:16 | https://pixabay.com/music/mystery-dark-ambient-soundscape-360794/ |
| reflexion | `reflexion/1778929000006_musicviktor11-horror-dark-background-music-458078.mp3` | Horror Dark Background Music | MusicViktor11 | 0:59 | https://pixabay.com/music/mystery-horror-dark-background-music-458078/ |

## Notas

- Se evitaron pistas marcadas en resultados de Pixabay como `Content ID Registered` para reducir reclamaciones automaticas en YouTube.
- FFmpeg no lee este manifiesto; solo documenta procedencia y licencia. El pipeline selecciona las pistas desde MongoDB (`studiomusictracks`) por `canal_id` y `categoria`.
