# Studio DJ Session - Produccion

## Resumen

El pipeline `dj_session` permite subir sesiones DJ largas, generar un MP4 con FFmpeg y publicarlo en YouTube usando OAuth por canal. El sistema esta pensado para archivos grandes y usa:

- subida de audio por chunks reanudables;
- reanudacion desde `localStorage`;
- limpieza de chunks temporales;
- render FFmpeg con lock, PID, progreso real y archivo temporal;
- upload resumable de YouTube por chunks con reintento;
- publicacion por canal con tokens OAuth propios.

## Variables de entorno

Obligatorias:

```env
MONGODB_URI=...
STUDIO_JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://www.luisgranero.com/api/studio/youtube/callback
INTERNAL_CRON_SECRET=...
```

Recomendadas para sesiones DJ:

```env
STORAGE_DIR=/home/ubuntu/luisgranero-com/studio
DJ_MAX_AUDIO_BYTES=5368709120
DJ_UPLOAD_CHUNK_BYTES=8388608
DJ_UPLOAD_EXPIRES_HOURS=24
DJ_YOUTUBE_UPLOAD_CHUNK_BYTES=16777216
DJ_SESSION_RENDER_LOCK_HOURS=6
DJ_YOUTUBE_UPLOAD_LOCK_HOURS=12
FFMPEG_PATH=ffmpeg
FFPROBE_PATH=ffprobe
```

Compatibilidad:

- `DJ_SESSION_MAX_AUDIO_BYTES` sigue funcionando como alias de `DJ_MAX_AUDIO_BYTES`.
- `DJ_SESSION_UPLOAD_CHUNK_BYTES` sigue funcionando como alias de `DJ_UPLOAD_CHUNK_BYTES`.
- `DJ_SESSION_UPLOAD_TTL_HOURS` sigue funcionando como alias de `DJ_UPLOAD_EXPIRES_HOURS`.
- `DJ_SESSION_STORAGE_DIR` puede usarse si se quiere una ruta especifica para `dj-sessions`.

## Rutas de almacenamiento

Por defecto:

```text
studio/dj-sessions/audio/{canalId}/
studio/dj-sessions/chunks/{workspaceId}/{uploadId}/
public/studio/dj-sessions/videos/{canalId}/
```

Si `STORAGE_DIR=/mnt/storage`, los audios/chunks pasan a:

```text
/mnt/storage/dj-sessions/audio/{canalId}/
/mnt/storage/dj-sessions/chunks/{workspaceId}/{uploadId}/
```

Los videos se guardan en `public/studio/dj-sessions/videos/{canalId}` porque se sirven por rutas API controladas. No se expone `video_file_path` al frontend.

## Nginx recomendado

Los chunks son pequenos, pero conviene permitir margen:

```nginx
client_max_body_size 64m;
proxy_request_buffering off;
proxy_buffering off;
proxy_read_timeout 900s;
proxy_send_timeout 900s;
send_timeout 900s;
```

Para rutas Studio:

```nginx
location /api/studio/ {
  proxy_pass http://127.0.0.1:3001;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_request_buffering off;
  proxy_read_timeout 900s;
  proxy_send_timeout 900s;
}
```

## PM2 recomendado

Los renders largos dependen de FFmpeg como proceso hijo. PM2 debe evitar reinicios agresivos por memoria.

```js
{
  name: "luisgranero-com",
  script: "node_modules/next/dist/bin/next",
  args: "start -H 127.0.0.1 -p 3001",
  instances: 2,
  exec_mode: "cluster",
  max_memory_restart: "2G",
  kill_timeout: 30000,
  wait_ready: false,
  autorestart: true
}
```

Riesgo conocido: si PM2 reinicia durante un render o upload, el job en memoria se pierde. El lock caduca y el usuario puede reintentar sin duplicar la operacion.

## Cron de limpieza

Endpoint:

```text
POST /api/internal/studio/cleanup-dj-uploads
Authorization: Bearer $INTERNAL_CRON_SECRET
```

Ejemplo cron cada hora:

```bash
0 * * * * curl -fsS -X POST https://www.luisgranero.com/api/internal/studio/cleanup-dj-uploads -H "Authorization: Bearer $INTERNAL_CRON_SECRET" >/dev/null
```

Resumen devuelto:

```json
{
  "uploads_expired": 0,
  "chunks_deleted": 0,
  "orphan_audios_deleted": 0,
  "orphan_videos_deleted": 0,
  "temp_renders_deleted": 0,
  "errors": []
}
```

La limpieza borra:

- chunks de upload cancelados, fallidos, expirados o abandonados;
- audios en `dj-sessions/audio` sin sesion asociada;
- videos no referenciados por ninguna sesion;
- renders temporales `*.rendering-*.mp4` antiguos.

No borra videos de sesiones publicadas mientras la sesion siga existiendo.

## YouTube

Scopes usados:

```text
https://www.googleapis.com/auth/youtube.upload
https://www.googleapis.com/auth/youtube.readonly
```

Metadata:

- categoria `10` Music;
- `visibility` desde la sesion;
- si hay `scheduled_at`, se publica como `private` con `publishAt`;
- tags de la sesion mas `DJ`, `DJ Set`, `Live Session`, `Mix`, `Music`;
- si YouTube rechaza tags, se reintenta iniciar upload sin tags.

## Flujo completo

1. El usuario crea una sesion DJ y selecciona audio.
2. La UI inicia `/uploads/start` y guarda `uploadId` en `localStorage`.
3. El audio sube por chunks.
4. Si el navegador se cierra, la UI consulta `/uploads/{uploadId}` y sube solo chunks pendientes.
5. `/complete` reconstruye el audio, calcula duracion con `ffprobe` y crea `StudioDjSession`.
6. `generate-video` adquiere lock, lanza FFmpeg y actualiza progreso por `out_time`.
7. El MP4 se escribe como temporal y solo reemplaza el video final al terminar bien.
8. `publish-youtube` adquiere lock, inicia o reutiliza `youtube_upload_url`, consulta offset y sube chunks.
9. Al terminar guarda `youtube_id`, `youtube_url` y `published`.

## Pruebas operativas

Subida:

- subir un MP3 pequeno;
- refrescar la pagina a mitad de subida;
- volver a seleccionar el mismo archivo;
- confirmar que continua desde chunks pendientes.

Render:

- generar video;
- observar `progreso` en historial;
- confirmar que aparece preview MP4;
- revisar `video_size` y `video_duration`.

Publicacion:

- conectar YouTube en el canal;
- publicar una sesion `unlisted`;
- cortar red o forzar fallo controlado;
- reintentar y verificar que reusa progreso si YouTube conserva la URL.

Limpieza:

```bash
curl -fsS -X POST https://www.luisgranero.com/api/internal/studio/cleanup-dj-uploads \
  -H "Authorization: Bearer $INTERNAL_CRON_SECRET"
```

## Diagnostico

Errores frecuentes:

- `Este canal no tiene YouTube conectado`: falta OAuth por canal o refresh token invalido.
- `Ya hay una generacion de video en curso`: lock de render activo; esperar o revisar si PM2 reinicio y dejar caducar.
- `Ya hay una publicacion en YouTube en curso`: lock de upload activo.
- `Archivo MP4 no encontrado en disco`: el video fue borrado o la ruta de storage cambio.
- `Upload expirado`: la subida chunked supero `DJ_UPLOAD_EXPIRES_HOURS`.
- `ENOSPC`: disco lleno; revisar audios, temporales y videos.

Comandos utiles:

```bash
du -sh studio/dj-sessions public/studio/dj-sessions
pm2 logs luisgranero-com --lines 200
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 archivo.mp4
```

## Checklist de seguridad

- Todas las rutas API de `dj_session` validan `workspace_id`.
- Las rutas operativas validan `canal_id`.
- La subida valida extension, MIME y tamano.
- La publicacion busca la sesion por `workspace_id` y `canal_id`.
- `youtube_upload_url`, `video_file_path` y tokens OAuth no se exponen en respuestas publicas.
- El borrado de limpieza esta limitado a rutas bajo `DJ_SESSION_ROOT` y `DJ_SESSION_PUBLIC_ROOT`.
- Los chunks se guardan por `workspaceId/uploadId`, no por nombre de archivo del usuario.
- Los nombres de archivo pasan por `sanitizeFilename`.
