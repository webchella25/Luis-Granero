import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import StudioScript from '@/models/StudioScript';
import StudioCalendario from '@/models/StudioCalendario';
import { getValidAccessTokenForCanal } from '@/lib/studio/youtube-auth';
import { sendTelegramAlertForCanal } from '@/lib/studio/telegram';

interface YTStats {
  viewCount: string;
  likeCount?: string;
  commentCount?: string;
}

interface YTResponse {
  items?: Array<{ statistics: YTStats }>;
}

interface YoutubeStats {
  views: number;
  updated_at: Date;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await connectDB();

  const canales = await StudioCanal.find({
    youtube_tokens: { $ne: null },
    'config.telegram_bot_token': { $exists: true, $ne: '' },
  }).lean();

  const results: Array<{ canal: string; ok?: boolean; error?: string }> = [];

  for (const canal of canales) {
    const cfg = canal.config as Record<string, unknown>;
    const botToken = cfg.telegram_bot_token as string | undefined;
    const chatId = cfg.telegram_chat_id as string | undefined;
    const notif = cfg.notificaciones as Record<string, boolean> | undefined;

    if (!botToken || !chatId) continue;

    try {
      const accessToken = await getValidAccessTokenForCanal(String(canal._id));

      type ScriptLean = {
        _id: unknown;
        titulo: string;
        youtube_id?: string;
        youtube_stats?: YoutubeStats;
        shorts?: Array<{ youtube_id?: string; titulo?: string; youtube_stats?: YoutubeStats }>;
      };

      const scripts = (await StudioScript.find({
        canal_id: String(canal._id),
        youtube_id: { $exists: true, $ne: '' },
      })
        .select('titulo youtube_id youtube_stats shorts')
        .lean()) as unknown as ScriptLean[];

      for (const script of scripts) {
        const ytId = script.youtube_id;
        if (!ytId) continue;

        const statsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ytId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!statsRes.ok) continue;

        const statsData = (await statsRes.json()) as YTResponse;
        const ytStats = statsData.items?.[0]?.statistics;
        if (!ytStats) continue;

        const currentViews = parseInt(ytStats.viewCount, 10);
        const prevStats = (script as unknown as Record<string, unknown>).youtube_stats as YoutubeStats | undefined;
        const prevViews = prevStats?.views ?? 0;

        if (notif?.alerta_1000_vistas && prevViews < 1000 && currentViews >= 1000) {
          await sendTelegramAlertForCanal(
            `🎉 <b>${script.titulo}</b> ha superado 1.000 visitas en <b>${canal.nombre}</b>!`,
            botToken,
            chatId
          );
        }

        if (notif?.alerta_despegando && currentViews - prevViews >= 500) {
          await sendTelegramAlertForCanal(
            `🚀 <b>${script.titulo}</b> está despegando: +${(currentViews - prevViews).toLocaleString('es-ES')} visitas en 6h en <b>${canal.nombre}</b>`,
            botToken,
            chatId
          );
        }

        // Actualizar stats del vídeo principal
        await StudioScript.findByIdAndUpdate(script._id, {
          $set: { youtube_stats: { views: currentViews, updated_at: new Date() } },
        });

        // Shorts
        const shorts = script.shorts as Array<{
          youtube_id?: string;
          titulo?: string;
          youtube_stats?: YoutubeStats;
        }> | undefined;

        if (notif?.alerta_short_viral && shorts?.length) {
          for (const short of shorts) {
            if (!short.youtube_id) continue;
            const sRes = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${short.youtube_id}`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (!sRes.ok) continue;
            const sData = (await sRes.json()) as YTResponse;
            const sViews = parseInt(sData.items?.[0]?.statistics?.viewCount ?? '0', 10);
            const prevShortViews = short.youtube_stats?.views ?? 0;
            if (prevShortViews < 5000 && sViews >= 5000) {
              await sendTelegramAlertForCanal(
                `📱 Short viral en <b>${canal.nombre}</b>: <b>${short.titulo}</b> tiene ${sViews.toLocaleString('es-ES')} visitas!`,
                botToken,
                chatId
              );
            }
          }
        }
      }

      // Alerta calendario vacío — menos de 2 semanas de contenido sin completar
      if (notif?.alerta_calendario_vacio) {
        const cal = await StudioCalendario.findOne({ canal_id: String(canal._id) })
          .sort({ generado_en: -1 })
          .lean();
        const pendientes = (cal as { entries?: Array<{ completado?: boolean }> } | null)?.entries?.filter(
          (e) => !e.completado
        ).length ?? 0;
        if (pendientes < 2) {
          await sendTelegramAlertForCanal(
            `⚠️ El calendario de <b>${canal.nombre}</b> necesita contenido — solo quedan ${pendientes} vídeos pendientes`,
            botToken,
            chatId
          );
        }
      }

      results.push({ canal: canal.nombre, ok: true });
    } catch (err) {
      results.push({ canal: canal.nombre, error: String(err) });
    }
  }

  return NextResponse.json({ success: true, results });
}
