// src/app/api/email-tracking/click/[id]/route.js
import { NextResponse } from 'next/response';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import Lead from '@/models/Lead';
import { extractRequestMetadata } from '@/lib/email/tracking';

export async function GET(request, { params }) {
  try {
    const emailLogId = params.id;
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    
    // Validar parámetros
    if (!emailLogId || !/^[0-9a-fA-F]{24}$/.test(emailLogId)) {
      console.log('❌ Invalid emailLogId:', emailLogId);
      return NextResponse.redirect(targetUrl || 'https://luisgranero.com');
    }
    
    if (!targetUrl) {
      console.log('❌ Missing target URL');
      return NextResponse.redirect('https://luisgranero.com');
    }
    
    // Conectar a DB
    await dbConnect();
    
    // Buscar EmailLog
    const emailLog = await EmailLog.findById(emailLogId);
    
    if (!emailLog) {
      console.log('❌ EmailLog not found:', emailLogId);
      return NextResponse.redirect(targetUrl);
    }
    
    // Extraer metadata de la request
    const metadata = extractRequestMetadata(request);
    
    console.log('🖱️ Link clicked:', {
      emailLogId,
      leadId: emailLog.leadId,
      emailTo: emailLog.emailTo,
      targetUrl,
      clickCount: emailLog.clickCount + 1,
      ip: metadata.ip
    });
    
    // Registrar click usando el método del modelo
    await emailLog.trackClick(targetUrl, metadata);
    
    // Actualizar lead con interacción
    if (emailLog.leadId) {
      await Lead.findByIdAndUpdate(emailLog.leadId, {
        $set: {
          lastInteraction: new Date(),
          lastInteractionType: 'email_clicked'
        },
        $push: {
          contactHistory: {
            date: new Date(),
            type: 'note',
            notes: `Hizo click en: ${targetUrl}`
          }
        }
      });
    }
    
    // TODO: Enviar notificación en tiempo real
    // await sendNotification(`🔥 ${emailLog.emailTo} hizo click en tu email!`);
    
    // Redirigir al URL original
    return NextResponse.redirect(targetUrl);
    
  } catch (error) {
    console.error('❌ Error tracking click:', error);
    
    // Redirigir al URL aunque haya error
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url') || 'https://luisgranero.com';
    return NextResponse.redirect(targetUrl);
  }
}

// Permitir OPTIONS para CORS
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
