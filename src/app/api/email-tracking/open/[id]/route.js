// src/app/api/webhooks/brevo/route.js
import { NextResponse } from 'next/response';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import Lead from '@/models/Lead';

/**
 * Webhook de Brevo para recibir eventos de emails
 * 
 * CONFIGURACIÓN EN BREVO:
 * 1. Ir a: https://app.brevo.com/settings/webhooks
 * 2. Crear nuevo webhook
 * 3. URL: https://tudominio.com/api/webhooks/brevo
 * 4. Eventos a activar:
 *    - delivered (email entregado)
 *    - hard_bounce (rebote permanente)
 *    - soft_bounce (rebote temporal)
 *    - complaint (marcado como spam)
 *    - opened (abierto - opcional si usas tu pixel)
 *    - click (click en enlace - opcional si usas tu tracking)
 */

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('📨 Webhook Brevo received:', {
      event: body.event,
      email: body.email,
      messageId: body['message-id']
    });
    
    // Validar que viene de Brevo (opcional pero recomendado)
    const brevoSecret = request.headers.get('x-brevo-signature');
    // TODO: Validar signature si Brevo lo soporta
    
    await dbConnect();
    
    const event = body.event;
    const messageId = body['message-id'] || body.messageId;
    const email = body.email;
    const timestamp = body.ts || new Date();
    
    // Buscar el EmailLog por messageId
    const emailLog = await EmailLog.findOne({ messageId });
    
    if (!emailLog) {
      console.log('⚠️ EmailLog not found for messageId:', messageId);
      return NextResponse.json({ 
        success: true, 
        message: 'EmailLog not found but webhook accepted' 
      });
    }
    
    // Procesar según el tipo de evento
    switch (event) {
      case 'delivered':
        await handleDelivered(emailLog, body);
        break;
        
      case 'hard_bounce':
        await handleHardBounce(emailLog, body);
        break;
        
      case 'soft_bounce':
        await handleSoftBounce(emailLog, body);
        break;
        
      case 'complaint':
      case 'spam':
        await handleComplaint(emailLog, body);
        break;
        
      case 'opened':
        // Solo procesar si no usas tu propio pixel
        await handleOpened(emailLog, body);
        break;
        
      case 'click':
        // Solo procesar si no usas tu propio tracking
        await handleClick(emailLog, body);
        break;
        
      case 'unsubscribe':
        await handleUnsubscribe(emailLog, body);
        break;
        
      default:
        console.log('⚠️ Unknown event type:', event);
    }
    
    return NextResponse.json({ 
      success: true, 
      event: event,
      processed: true 
    });
    
  } catch (error) {
    console.error('❌ Error processing Brevo webhook:', error);
    
    // Siempre retornar 200 para que Brevo no reintente
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 200 });
  }
}

// Handler para email entregado
async function handleDelivered(emailLog, webhookData) {
  console.log('✅ Email delivered:', emailLog.emailTo);
  
  await EmailLog.findByIdAndUpdate(emailLog._id, {
    status: 'delivered',
    deliveredAt: new Date()
  });
}

// Handler para rebote permanente (email no existe)
async function handleHardBounce(emailLog, webhookData) {
  console.log('❌ Hard bounce:', emailLog.emailTo);
  
  const reason = webhookData.reason || 'Unknown';
  
  await EmailLog.findByIdAndUpdate(emailLog._id, {
    status: 'bounced',
    bounceType: 'hard',
    bounceReason: reason,
    error: `Hard bounce: ${reason}`
  });
  
  // Marcar el email como inválido en el lead
  if (emailLog.leadId) {
    await Lead.findByIdAndUpdate(emailLog.leadId, {
      $pull: { 
        possibleEmails: emailLog.emailTo 
      },
      $push: {
        contactHistory: {
          date: new Date(),
          type: 'note',
          notes: `⚠️ Email rebotado (hard bounce): ${emailLog.emailTo}`
        }
      }
    });
  }
}

// Handler para rebote temporal (buzón lleno, servidor caído)
async function handleSoftBounce(emailLog, webhookData) {
  console.log('⚠️ Soft bounce:', emailLog.emailTo);
  
  const reason = webhookData.reason || 'Unknown';
  
  await EmailLog.findByIdAndUpdate(emailLog._id, {
    status: 'bounced',
    bounceType: 'soft',
    bounceReason: reason,
    error: `Soft bounce: ${reason}`
  });
  
  // TODO: Implementar retry logic para soft bounces
}

// Handler para quejas de spam
async function handleComplaint(emailLog, webhookData) {
  console.log('🚨 Spam complaint:', emailLog.emailTo);
  
  await EmailLog.findByIdAndUpdate(emailLog._id, {
    status: 'bounced',
    bounceType: 'complaint',
    bounceReason: 'Marked as spam',
    error: 'User marked email as spam'
  });
  
  // Marcar el lead para no contactar más
  if (emailLog.leadId) {
    await Lead.findByIdAndUpdate(emailLog.leadId, {
      $set: {
        status: 'rejected',
        doNotContact: true
      },
      $push: {
        contactHistory: {
          date: new Date(),
          type: 'note',
          notes: '🚨 Usuario marcó email como spam - NO CONTACTAR'
        }
      }
    });
  }
}

// Handler para apertura (solo si no usas tu pixel)
async function handleOpened(emailLog, webhookData) {
  console.log('📧 Email opened (Brevo):', emailLog.emailTo);
  
  // Solo actualizar si aún no se ha registrado apertura
  if (!emailLog.opened) {
    await emailLog.trackOpen({
      ip: webhookData.ip,
      userAgent: webhookData.user_agent
    });
  }
}

// Handler para click (solo si no usas tu tracking)
async function handleClick(emailLog, webhookData) {
  console.log('🖱️ Link clicked (Brevo):', emailLog.emailTo);
  
  const url = webhookData.link || webhookData.url;
  
  await emailLog.trackClick(url, {
    ip: webhookData.ip,
    userAgent: webhookData.user_agent
  });
}

// Handler para unsubscribe
async function handleUnsubscribe(emailLog, webhookData) {
  console.log('👋 User unsubscribed:', emailLog.emailTo);
  
  if (emailLog.leadId) {
    await Lead.findByIdAndUpdate(emailLog.leadId, {
      $set: {
        unsubscribed: true
      },
      $push: {
        contactHistory: {
          date: new Date(),
          type: 'note',
          notes: '👋 Usuario se dio de baja - Respetar preferencia'
        }
      }
    });
  }
}

// Permitir GET para verificar que el endpoint funciona
export async function GET() {
  return NextResponse.json({ 
    message: 'Brevo webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
