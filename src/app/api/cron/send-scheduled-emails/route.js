// src/app/api/cron/send-scheduled-emails/route.js - VERSIÓN CORREGIDA CON TRACKING
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import SequenceEnrollment from '@/models/SequenceEnrollment';
import Lead from '@/models/Lead';
import Template from '@/models/Template';
import Sequence from '@/models/Sequence';
import Appointment from '@/models/Appointment';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { prepareEmailForTracking } from '@/lib/email/tracking'; // ✅ AÑADIDO

// Configurar transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Función para reemplazar shortcodes
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

async function handleRequest(request) {
  try {
    await dbConnect();

    // SEGURIDAD: Verificar que CRON_SECRET esté configurado
    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Cron authentication not configured' },
        { status: 500 }
      );
    }

    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const now = new Date();
    
    // Buscar emails programados
    const emailsToSend = await EmailLog.find({
      status: 'scheduled',
      scheduledFor: { $lte: now }
    })
    .populate('leadId')
    .populate('sequenceId')
    .limit(50);
    
    console.log(`📧 Emails pendientes: ${emailsToSend.length}`);
    
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
          console.log(`⏸️ Enrollment inactivo`);
          await EmailLog.findByIdAndUpdate(emailLog._id, {
            status: 'failed',
            error: 'Enrollment no activo'
          });
          failed++;
          continue;
        }
        
        // Obtener template
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
        
        if (!lead || !lead.possibleEmails?.length) {
          console.log(`❌ Lead sin email`);
          await EmailLog.findByIdAndUpdate(emailLog._id, {
            status: 'failed',
            error: 'Lead sin email válido'
          });
          failed++;
          continue;
        }
        
        // Crear magic link para agendar llamada
        const magicToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiration = new Date();
        tokenExpiration.setDate(tokenExpiration.getDate() + 7);
        
        try {
          await Appointment.create({
            leadId: lead._id,
            token: magicToken,
            tokenExpiresAt: tokenExpiration,
            name: lead.name,
            email: lead.possibleEmails[0],
            phone: lead.phoneNumbers?.[0] || '',
            status: 'pending',
            source: 'email_sequence'
          });
        } catch (appointmentError) {
          console.log('⚠️ Error creando appointment:', appointmentError.message);
        }
        
        const magicLink = `${process.env.NEXTAUTH_URL || 'https://luisgranero.com'}/agendar/${magicToken}`;
        
        // Reemplazar shortcodes
        const subject = replaceShortcodes(
          typeof template.subject === 'function' ? template.subject() : template.subject,
          lead,
          magicLink
        );
        
        let htmlBody = replaceShortcodes(
          template.htmlBody 
            ? (typeof template.htmlBody === 'function' ? template.htmlBody(lead, magicLink) : template.htmlBody)
            : template.body,
          lead,
          magicLink
        );
        
        // ✅ AÑADIR TRACKING AL HTML
        const trackedHtml = prepareEmailForTracking(htmlBody, emailLog._id.toString());
        
        console.log(`📧 Enviando email a ${lead.name} (${lead.possibleEmails[0]})`);
        console.log(`🔍 Tracking añadido - EmailLog ID: ${emailLog._id}`);
        
        // Enviar email CON TRACKING
        await transporter.sendMail({
          from: `${process.env.EMAIL_FROM_NAME || 'Luis Granero'} <${process.env.SMTP_USER}>`,
          to: lead.possibleEmails[0],
          subject: subject,
          html: trackedHtml, // ✅ USAR trackedHtml en lugar de htmlBody
          headers: {
            'X-Email-Log-ID': emailLog._id.toString(),
            'X-Lead-ID': lead._id.toString()
          }
        });
        
        // Actualizar EmailLog
        await EmailLog.findByIdAndUpdate(emailLog._id, {
          status: 'sent',
          sentAt: new Date(),
          subject: subject
        });
        
        // Actualizar enrollment
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
              notes: `Email automático: ${template.name}`
            }
          }
        });
        
        // Verificar si es último paso de la secuencia
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
          status: 'sent'
        });
        
        // Delay 1 segundo entre emails para no saturar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error enviando email:`, error);
        
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

// Exportar GET y POST (ambos usan la misma función)
export async function GET(request) {
  return handleRequest(request);
}

export async function POST(request) {
  return handleRequest(request);
}