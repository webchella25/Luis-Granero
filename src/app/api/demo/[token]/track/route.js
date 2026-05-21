// src/app/api/demo/[token]/track/route.js — Tracking de visitas a demo sites
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DemoSite from '@/models/DemoSite';
import Lead from '@/models/Lead';
import Notification from '@/models/Notification';

export async function POST(request, { params }) {
  try {
    await dbConnect();

    const { token } = params;
    const demo = await DemoSite.findOne({ token, isActive: true });

    if (!demo) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    // Obtener IP del visitante
    const headers = request.headers;
    const ip = headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                headers.get('x-real-ip') ||
                'unknown';

    const now = new Date();
    const isFirstVisit = demo.visitCount === 0;

    // Actualizar demo
    await DemoSite.findByIdAndUpdate(demo._id, {
      $inc: { visitCount: 1 },
      $set: { lastVisitedAt: now },
      $setOnInsert: { firstVisitedAt: now },
      ...(isFirstVisit && { $set: { firstVisitedAt: now, lastVisitedAt: now } }),
      $addToSet: { visitIps: ip }
    });

    // Actualizar lead — marcar como "hot"
    if (demo.leadId) {
      await Lead.findByIdAndUpdate(demo.leadId, {
        $set: {
          lastInteraction: now,
          lastInteractionType: 'demo_visited'
        }
      });

      // Crear notificación de alerta hot lead
      const visitNum = demo.visitCount + 1;
      await Notification.create({
        leadId: demo.leadId,
        leadName: demo.businessName,
        type: 'demo_visited',
        title: `🔥 ${demo.businessName} visitó su demo`,
        message: `Ha visitado la demo ${visitNum} vez${visitNum > 1 ? 'es' : ''}. ¡Llama ahora!`,
        metadata: { token, visitCount: visitNum, ip }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking demo visit:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
