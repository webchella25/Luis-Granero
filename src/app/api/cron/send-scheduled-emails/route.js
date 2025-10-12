// src/app/api/cron/send-scheduled-emails/route.js - ACTUALIZADO COMPLETO
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import SequenceEnrollment from '@/models/SequenceEnrollment';
import Lead from '@/models/Lead';
import Template from '@/models/Template'; // ← CAMBIADO
import Sequence from '@/models/Sequence';
import Appointment from '@/models/Appointment'; // ← NUEVO
import nodemailer from 'nodemailer';
import crypto from 'crypto'; // ← NUEVO

// Configurar transporter (usa tus variables de entorno)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// ✅ FUNCIÓN ACTUALIZADA CON TODOS LOS SHORTCODES
function replaceShortcodes(text, lead, magicLink = '') {
  if (!text) return '';
  
  const replacements = {
    '{{business_name}}': lead.name || '',
    '{{contact_name}}': lead.name || '',
    '{{category}}': lead.category || 'negocios locales',
    '{{review_count}}': lead.reviewCount || 0,
    '{{rating}}': lead.rating || 0,
    '{{load_time}}': lead.webAnalysis?.loadTime 
      ? Math.round(lead.webAnalysis.loadTime / 1000) 
      : '?',
    '{{issues_list}}': lead.webAnalysis?.issues 
      ? lead.webAnalysis.issues.slice(0, 3).map(issue => `• ${issue}`).join('\n')
      : '• Sin análisis disponible',
    '{{magic_link}}': magicLink,
    '{{score}}': lead.opportunityScore || 0,
    '{{phone}}': lead.phone || lead.phoneNumbers?.[0] || '',
    '{{address}}': lead.address || '',
    '{{website}}': lead.website || 'tu sitio web',
    '{{email}}': lead.possibleEmails?.[0] || ''
  };
  
  let result = text;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
  }
  
  return result;
}

export async function GET(request) {
  try {
    await dbConnect();
    
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const now = new Date();
    
    // Buscar emails programados para hoy o antes que NO se hayan enviado
    const emailsToSend = await EmailLog.find({
      status: 'scheduled',
      scheduledFor: { $lte: now }
    })
    .populate('leadId')
    .populate('sequenceId')
    .limit(50); // Máximo 50 emails por ejecución
    
    console.log(`📧 Emails pendientes de envío: ${emailsToSend.length}`);
    
    if (emailsToSend.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay emails pendientes',
        summary: { total: 0, sent: 0, failed: 0 }
      });
    }
    
    let sent = 0;
    let failed = 0;
    const results = [];
    
    for (const emailLog of emailsToSend) {
      try {
        // Verificar enrollment activo
        const enrollment = await SequenceEnrollment.findById(emailLog.enrollmentId);
        
        if (!enrollment || enrollment.status !== 'active') {
          console.log(`⏸️ Enrollment inactivo para lead ${emailLog.leadId?.name}`);
          
          await EmailLog.findByIdAndUpdate(emailLog._id, {
            status: 'failed',
            error: 'Enrollment no activo'
          });
          
          failed++;
          continue;
        }
        
        // ✅ OBTENER TEMPLATE DEL MODELO CORRECTO
        const template = await Template.findOne({ 
          id: emailLog.templateId,
          type: 'email',
          isActive: true
        });
        
        if (!template) {
          console.log(`❌ Template no encontrado: ${emailLog.templateId}`);
          
          await EmailLog.findByIdAndUpdate(emailLog._id, {
            status: 'failed',
            error: 'Template no encontrado'
          });
          
          failed++;
          continue;
        }
        
        const lead = emailLog.leadId;
        
        if (!lead || !lead.possibleEmails?.[0]) {
          console.log(`❌ Lead sin email: ${lead?.name}`);
          
          await EmailLog.findByIdAndUpdate(emailLog._id, {
            status: 'failed',
            error: 'Lead sin email válido'
          });
          
          failed++;
          continue;
        }
        
        // ✅ CREAR MAGIC LINK
        const magicToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiration = new Date();
        tokenExpiration.setDate(tokenExpiration.getDate() + 30); // 30 días
        
        const appointment = await Appointment.create({
          leadId: lead._id,
          token: magicToken,
          tokenExpiresAt: tokenExpiration,
          name: lead.name,
          phone: lead.phone || lead.phoneNumbers?.[0],
          email: lead.possibleEmails[0],
          status: 'pending'
        });
        
        const magicLink = `https://www.luisgranero.com/agendar/${magicToken}`;
        
        console.log(`🔗 Magic link generado para ${lead.name}: ${magicToken.substring(0, 10)}...`);
        
        // ✅ REEMPLAZAR SHORTCODES CON MAGIC LINK
        const subject = replaceShortcodes(template.subject, lead, magicLink);
        const body = replaceShortcodes(template.body, lead, magicLink);
        
        // Convertir texto a HTML básico
        const htmlBody = body
          .split('\n')
          .map(line => {
            if (line.trim().startsWith('━')) return '<hr style="border: 1px solid #ddd; margin: 20px 0;">';
            if (line.includes(magicLink)) {
              return `<p style="text-align: center; margin: 20px 0;">
                <a href="${magicLink}" style="background: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  👉 Agendar Llamada Gratuita
                </a>
              </p>`;
            }
            return line ? `<p style="margin: 10px 0;">${line}</p>` : '<br>';
          })
          .join('');
        
        // ✅ ENVIAR EMAIL
        const mailOptions = {
          from: `${process.env.EMAIL_FROM_NAME || 'Luis Granero'} <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
          to: lead.possibleEmails[0],
          subject: subject,
          text: body,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              ${htmlBody}
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 13px; text-align: center;">
                <strong>Luis Granero</strong><br>
                Desarrollo Web Profesional<br>
                🌐 www.luisgranero.com<br>
                📧 ${process.env.EMAIL_FROM || 'luis@luisgranero.dev'}<br>
                📱 698 38 36 10
              </p>
            </div>
          `,
          headers: {
            'X-Email-Log-ID': emailLog._id.toString(),
            'X-Lead-ID': lead._id.toString(),
            'X-Sequence-ID': emailLog.sequenceId?._id.toString()
          }
        };
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Email enviado a ${lead.name}: ${info.messageId}`);
        
        // Actualizar EmailLog
        await EmailLog.findByIdAndUpdate(emailLog._id, {
          status: 'sent',
          sentAt: new Date(),
          messageId: info.messageId,
          subject: subject
        });
        
        // Actualizar step del enrollment
        await SequenceEnrollment.findByIdAndUpdate(enrollment._id, {
          currentStep: emailLog.step + 1,
          lastEmailSent: new Date()
        });
        
        // Añadir a historial del lead
        await Lead.findByIdAndUpdate(lead._id, {
          status: 'contacted',
          $push: {
            contactHistory: {
              date: new Date(),
              type: 'email',
              emailSubject: subject,
              notes: `Email automático: ${template.name} (Paso ${emailLog.step + 1}/${emailLog.sequenceId?.steps?.length})`
            }
          }
        });
        
        // Verificar si es el último paso de la secuencia
        const sequence = emailLog.sequenceId;
        if (sequence && emailLog.step >= sequence.steps.length - 1) {
          await SequenceEnrollment.findByIdAndUpdate(enrollment._id, {
            status: 'completed',
            completedAt: new Date()
          });
          
          await Sequence.findByIdAndUpdate(sequence._id, {
            $inc: {
              'stats.totalCompleted': 1,
              'stats.totalActive': -1
            }
          });
          
          console.log(`🎉 Secuencia completada para ${lead.name}`);
        }
        
        sent++;
        results.push({
          leadName: lead.name,
          email: lead.possibleEmails[0],
          subject: subject,
          status: 'sent',
          messageId: info.messageId
        });
        
        // Delay entre emails (1 segundo)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error enviando email a ${emailLog.leadId?.name}:`, error);
        
        await EmailLog.findByIdAndUpdate(emailLog._id, {
          status: 'failed',
          error: error.message
        });
        
        failed++;
        results.push({
          leadName: emailLog.leadId?.name,
          email: emailLog.emailTo,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    console.log(`📊 Resumen: ${sent} enviados, ${failed} fallidos`);
    
    return NextResponse.json({
      success: true,
      summary: {
        total: emailsToSend.length,
        sent,
        failed
      },
      results
    });
    
  } catch (error) {
    console.error('❌ Error en cron job:', error);
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Permitir POST para testing manual
export async function POST(request) {
  return GET(request);
}

export async function POST(request) {
  return handleRequest(request);
}