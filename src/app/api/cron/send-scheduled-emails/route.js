// src/app/api/cron/send-scheduled-emails/route.js - NUEVO ARCHIVO
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import SequenceEnrollment from '@/models/SequenceEnrollment';
import Lead from '@/models/Lead';
import EmailTemplate from '@/models/EmailTemplate';
import Sequence from '@/models/Sequence';
import nodemailer from 'nodemailer';

// Configurar Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS
  }
});

// Función para reemplazar shortcodes
function replaceShortcodes(text, lead, additionalData = {}) {
  if (!text) return '';
  
  const now = new Date();
  const replacements = {
    '{{name}}': lead.name || '',
    '{{first_name}}': lead.name?.split(' ')[0] || '',
    '{{email}}': lead.possibleEmails?.[0] || '',
    '{{phone}}': lead.phoneNumbers?.[0] || '',
    '{{website}}': lead.website || 'tu sitio web',
    '{{company_name}}': lead.companyName || lead.name || '',
    '{{current_date}}': now.toLocaleDateString('es-ES'),
    '{{admin_name}}': 'Luis Granero',
    '{{admin_email}}': 'luis@luisgranero.dev',
    '{{admin_phone}}': '+34 698383610', // Pon tu teléfono real
    ...additionalData
  };
  
  let result = text;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), value);
  }
  
  return result;
}

export async function GET(request) {
  try {
    await dbConnect();
    
    // Verificar autenticación del cron (Vercel añade header)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    
    // Buscar emails programados para hoy que no se hayan enviado
    const emailsToSend = await EmailLog.find({
      status: 'scheduled',
      scheduledFor: {
        $lte: endOfToday
      }
    }).populate('leadId').populate('sequenceId');
    
    console.log(`📧 Emails pendientes para hoy: ${emailsToSend.length}`);
    
    let sent = 0;
    let failed = 0;
    const results = [];
    
    for (const emailLog of emailsToSend) {
      try {
        // Verificar que el enrollment sigue activo
        const enrollment = await SequenceEnrollment.findById(emailLog.enrollmentId);
        
        if (!enrollment || enrollment.status !== 'active') {
          console.log(`⏸️ Enrollment pausado/inactivo para lead ${emailLog.leadId?.name}`);
          
          await EmailLog.findByIdAndUpdate(emailLog._id, {
            status: 'failed',
            error: 'Enrollment no activo'
          });
          
          failed++;
          continue;
        }
        
        // Obtener template
        const template = await EmailTemplate.findOne({ 
          templateId: emailLog.templateId 
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
        
        // Reemplazar shortcodes
        const subject = replaceShortcodes(template.subject, lead);
        const body = replaceShortcodes(template.body, lead);
        
        // Enviar email
        const mailOptions = {
          from: `"Luis Granero - Developer" <${process.env.BREVO_SMTP_USER}>`,
          to: lead.possibleEmails?.[0],
          subject: subject,
          html: body,
          // Headers para tracking (opcional)
          headers: {
            'X-Email-Log-ID': emailLog._id.toString(),
            'X-Lead-ID': lead._id.toString()
          }
        };
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Email enviado a ${lead.name}: ${info.messageId}`);
        
        // Actualizar log
        await EmailLog.findByIdAndUpdate(emailLog._id, {
          status: 'sent',
          sentAt: new Date(),
          messageId: info.messageId
        });
        
        // Actualizar step del enrollment
        await SequenceEnrollment.findByIdAndUpdate(enrollment._id, {
          currentStep: emailLog.step + 1
        });
        
        // Añadir a historial del lead
        await Lead.findByIdAndUpdate(lead._id, {
          $push: {
            contactHistory: {
              date: new Date(),
              type: 'email',
              subject: subject,
              notes: `Email automático enviado (Secuencia: ${emailLog.sequenceId?.name})`
            }
          }
        });
        
        // Verificar si es el último paso
        const sequence = emailLog.sequenceId;
        if (emailLog.step === sequence.steps.length - 1) {
          await SequenceEnrollment.findByIdAndUpdate(enrollment._id, {
            status: 'completed',
            completedAt: new Date()
          });
          
          // Actualizar stats
          await Sequence.findByIdAndUpdate(sequence._id, {
            $inc: {
              'stats.totalCompleted': 1,
              'stats.totalActive': -1
            }
          });
        }
        
        sent++;
        results.push({
          leadName: lead.name,
          email: lead.possibleEmails?.[0],
          subject: subject,
          status: 'sent'
        });
        
        // Delay entre emails para no saturar SMTP
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
  console.error('Error en cron job:', error);
  
  // Enviar email de alerta (opcional)
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: 'luis@luisgranero.dev',
      subject: '🚨 ERROR en Cron Job de Emails',
      html: `
        <h2>Error en el cron job</h2>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <pre>${error.stack}</pre>
      `
    })
  });
  
  return NextResponse.json(
    { success: false, error: error.message },
    { status: 500 }
  );
}
}

// También permitir POST para testing manual
export async function POST(request) {
  return GET(request);
}