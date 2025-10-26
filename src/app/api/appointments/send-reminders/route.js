// src/app/api/appointments/send-reminders/route.js - NUEVO
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import EmailLog from '@/models/EmailLog';
import nodemailer from 'nodemailer';

// ✅ Configurar transporter
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS
  }
});

// POST - Enviar recordatorios automáticos
export async function POST(request) {
  try {
    await connectDB();
    
    const { appointmentId, type } = await request.json();
    
    // Si se proporciona ID específico, enviar solo ese
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId).populate('leadId');
      if (!appointment) {
        return NextResponse.json(
          { success: false, error: 'Cita no encontrada' },
          { status: 404 }
        );
      }
      
      const result = await sendReminder(appointment, type || 'manual');
      
      return NextResponse.json({
        success: true,
        sent: result.success,
        message: result.message
      });
    }
    
    // ✅ Enviar recordatorios automáticos a todas las citas que lo necesiten
    const now = new Date();
    
    // Citas en las próximas 24 horas (sin recordatorio de 24h)
    const appointments24h = await Appointment.find({
      status: 'confirmed',
      scheduledDate: {
        $gte: now,
        $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000)
      },
      'remindersSent.type': { $ne: 'email_24h' }
    }).populate('leadId');
    
    // Citas en la próxima hora (sin recordatorio de 1h)
    const appointments1h = await Appointment.find({
      status: 'confirmed',
      scheduledDate: {
        $gte: now,
        $lte: new Date(now.getTime() + 60 * 60 * 1000)
      },
      'remindersSent.type': { $ne: 'email_1h' }
    }).populate('leadId');
    
    console.log(`📧 Enviando recordatorios: ${appointments24h.length} (24h) + ${appointments1h.length} (1h)`);
    
    const results = {
      sent24h: 0,
      sent1h: 0,
      failed: 0,
      total: appointments24h.length + appointments1h.length
    };
    
    // Enviar recordatorios de 24h
    for (const appointment of appointments24h) {
      const result = await sendReminder(appointment, 'email_24h');
      if (result.success) results.sent24h++;
      else results.failed++;
    }
    
    // Enviar recordatorios de 1h
    for (const appointment of appointments1h) {
      const result = await sendReminder(appointment, 'email_1h');
      if (result.success) results.sent1h++;
      else results.failed++;
    }
    
    return NextResponse.json({
      success: true,
      results
    });
    
  } catch (error) {
    console.error('❌ Error enviando recordatorios:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ Función para enviar recordatorio individual
async function sendReminder(appointment, type) {
  try {
    const timeMap = {
      'email_24h': '24 horas',
      'email_1h': '1 hora',
      'manual': 'manual'
    };
    
    const subject = type === 'manual' 
      ? `🔔 Recordatorio: Llamada con Luis Granero`
      : `⏰ Recordatorio: Tu llamada es en ${timeMap[type]}`;
    
    const scheduledDate = new Date(appointment.scheduledDate);
    const dateStr = scheduledDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = scheduledDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">⏰ Recordatorio de Llamada</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 18px; margin: 0 0 20px 0;">Hola <strong>${appointment.name}</strong>,</p>
            
            ${type !== 'manual' ? `
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-weight: bold;">
                  ⏰ Tu llamada es en ${timeMap[type]}
                </p>
              </div>
            ` : ''}
            
            <p style="font-size: 16px; line-height: 1.8;">
              Te recuerdo que tenemos programada una llamada:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #06b6d4;">
              <p style="margin: 5px 0; font-size: 16px;">
                <strong>📅 Fecha:</strong> ${dateStr}
              </p>
              <p style="margin: 5px 0; font-size: 16px;">
                <strong>🕐 Hora:</strong> ${timeStr}
              </p>
              <p style="margin: 5px 0; font-size: 16px;">
                <strong>⏱️ Duración estimada:</strong> ${appointment.duration?.planned || 30} minutos
              </p>
            </div>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e40af;">📋 Prepara para la llamada:</p>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Detalles de tu proyecto</li>
                <li>Presupuesto aproximado</li>
                <li>Timeline esperado</li>
                <li>Referencias o ejemplos que te gusten</li>
              </ul>
            </div>
            
            <p style="font-size: 16px; line-height: 1.8; margin-top: 20px;">
              Te llamaré al número: <strong>${appointment.phone || 'No proporcionado'}</strong>
            </p>
            
            <p style="font-size: 16px; line-height: 1.8;">
              Si necesitas reprogramar, responde a este email o llámame al +34 698 38 36 10.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
              <p style="margin: 5px 0; color: #374151;">
                <strong style="font-size: 16px;">Luis Granero</strong>
              </p>
              <p style="margin: 5px 0; color: #6b7280;">
                Desarrollo Web Freelance
              </p>
              <p style="margin: 15px 0 5px 0;">
                <a href="https://luisgranero.com" style="color: #06b6d4; text-decoration: none;">🌐 www.luisgranero.com</a>
              </p>
              <p style="margin: 5px 0;">
                <a href="mailto:luis@luisgranero.com" style="color: #06b6d4; text-decoration: none;">📧 luis@luisgranero.com</a>
              </p>
              <p style="margin: 5px 0;">
                <a href="tel:+34698383610" style="color: #06b6d4; text-decoration: none;">📱 +34 698 38 36 10</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Crear log del email
    const emailLog = await EmailLog.create({
      leadId: appointment.leadId?._id,
      emailTo: appointment.email,
      subject,
      emailBody: html,
      status: 'sending',
      source: 'appointment_reminder',
      templateId: `reminder_${type}`
    });
    
    // Enviar email
    await transporter.sendMail({
      from: `"Luis Granero" <${process.env.EMAIL_FROM || 'luis@luisgranero.com'}>`,
      to: appointment.email,
      subject,
      html
    });
    
    // Actualizar log
    await EmailLog.findByIdAndUpdate(emailLog._id, {
      status: 'sent',
      sentAt: new Date()
    });
    
    // Marcar recordatorio como enviado
    await appointment.markReminderSent(type);
    
    console.log(`✅ Recordatorio enviado: ${appointment.name} (${type})`);
    
    return {
      success: true,
      message: 'Recordatorio enviado correctamente'
    };
    
  } catch (error) {
    console.error(`❌ Error enviando recordatorio:`, error);
    
    return {
      success: false,
      message: error.message
    };
  }
}

// GET - Obtener citas que necesitan recordatorio
export async function GET(request) {
  try {
    await connectDB();
    
    const now = new Date();
    
    // Citas que necesitan recordatorio de 24h
    const need24h = await Appointment.find({
      status: 'confirmed',
      scheduledDate: {
        $gte: now,
        $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000)
      },
      'remindersSent.type': { $ne: 'email_24h' }
    }).populate('leadId');
    
    // Citas que necesitan recordatorio de 1h
    const need1h = await Appointment.find({
      status: 'confirmed',
      scheduledDate: {
        $gte: now,
        $lte: new Date(now.getTime() + 60 * 60 * 1000)
      },
      'remindersSent.type': { $ne: 'email_1h' }
    }).populate('leadId');
    
    return NextResponse.json({
      success: true,
      needReminders: {
        in24h: need24h.length,
        in1h: need1h.length,
        total: need24h.length + need1h.length
      },
      appointments: {
        in24h: need24h,
        in1h: need1h
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
