// src/app/api/cron/send-scheduled-emails/route.js - ACTUALIZADO CON GITHUB ACTIONS
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
    '{{phone}}': lead.phone || lead.phoneNumbers?.[0] || '',
    '{{website}}': lead.website || 'tu sitio web',
    '{{company_name}}': lead.companyName || lead.name || '',
    '{{current_date}}': now.toLocaleDateString('es-ES'),
    '{{admin_name}}': 'Luis Granero',
    '{{admin_email}}': 'luis@luisgranero.dev',
    '{{admin_phone}}': '+34 XXX XXX XXX',
    ...additionalData
  };
  
  let result = text;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), value);
  }
  
  return result;
}

// ✅ FUNCIÓN PRINCIPAL (soporta GET y POST para GitHub Actions)
async function handleRequest(request) {
  try {
    await dbConnect();
    
    // ✅ VERIFICAR AUTENTICACIÓN (GitHub Actions + Vercel Cron)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (authHeader !== expectedAuth) {
      console.error('❌ Unauthorized cron attempt');
      console.error('Received:', authHeader);
      console.error('Expected:', expectedAuth ? 'Bearer [REDACTED]' : 'NOT SET');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('✅ Auth verified, starting email sending process...');
    
    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    
    console.log(`📅 Looking for emails scheduled before: ${endOfToday.toISOString()}`);
    
    // Buscar emails programados para hoy que no se hayan enviado
    const emailsToSend = await EmailLog.find({
      status: 'scheduled',
      scheduledFor: {
        $lte: endOfToday
      }
    }).populate('leadId').populate('sequenceId');
    
    console.log(`📧 Emails pendientes para hoy: ${emailsToSend.length}`);
    
    if (emailsToSend.length === 0) {
      return NextResponse.json({
        success: true,
        summary: {
          total: 0,
          sent: 0,
          failed: 0
        },
        message: 'No hay emails programados para hoy'
      });
    }
    
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
          results.push({
            leadName: emailLog.leadId?.name,
            status: 'failed',
            error: 'Enrollment no activo'
          });
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
          results.push({
            leadName: emailLog.leadId?.name,
            status: 'failed',
            error: 'Template no encontrado'
          });
          continue;
        }
        
        const lead = emailLog.leadId;
        
        // Verificar que el lead tiene email
        if (!lead || !lead.possibleEmails?.[0]) {
          console.log(`❌ Lead sin email: ${lead?.name || emailLog.leadId}`);
          
          await EmailLog.findByIdAndUpdate(emailLog._id, {
            status: 'failed',
            error: 'Lead sin email'
          });
          
          failed++;
          results.push({
            leadName: lead?.name,
            status: 'failed',
            error: 'Lead sin email'
          });
          continue;
        }
        
        // Reemplazar shortcodes
        const subject = replaceShortcodes(template.subject, lead);
        const body = replaceShortcodes(template.body, lead);
        
        // Enviar email
        const mailOptions = {
          from: `"Luis Granero - Developer" <${process.env.BREVO_SMTP_USER}>`,
          to: lead.possibleEmails[0],
          subject: subject,
          html: body,
          // Headers para tracking
          headers: {
            'X-Email-Log-ID': emailLog._id.toString(),
            'X-Lead-ID': lead._id.toString(),
            'X-Sequence-ID': emailLog.sequenceId?._id?.toString()
          }
        };
        
        console.log(`📤 Enviando email a ${lead.name} (${lead.possibleEmails[0]})...`);
        
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
          currentStep: emailLog.step + 1,
          lastEmailSent: new Date()
        });
        
        // Añadir a historial del lead
        await Lead.findByIdAndUpdate(lead._id, {
          $push: {
            contactHistory: {
              date: new Date(),
              type: 'email',
              subject: subject,
              notes: `Email automático enviado (Secuencia: ${emailLog.sequenceId?.name || 'Sin nombre'})`
            }
          }
        });
        
        // Verificar si es el último paso
        const sequence = emailLog.sequenceId;
        if (sequence && emailLog.step >= (sequence.steps?.length || 0) - 1) {
          console.log(`🎉 Secuencia completada para ${lead.name}`);
          
          await SequenceEnrollment.findByIdAndUpdate(enrollment._id, {
            status: 'completed',
            completedAt: new Date()
          });
          
          // Actualizar stats de la secuencia
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
          email: lead.possibleEmails[0],
          subject: subject,
          status: 'sent',
          messageId: info.messageId
        });
        
        // Delay entre emails para no saturar SMTP (rate limiting)
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
    
    console.log(`\n📊 RESUMEN DE ENVÍO:`);
    console.log(`   Total: ${emailsToSend.length}`);
    console.log(`   ✅ Enviados: ${sent}`);
    console.log(`   ❌ Fallidos: ${failed}`);
    
    return NextResponse.json({
      success: true,
      summary: {
        total: emailsToSend.length,
        sent,
        failed,
        timestamp: new Date().toISOString()
      },
      results
    });
    
  } catch (error) {
    console.error('❌ Error crítico en cron job:', error);
    
    // Intentar enviar email de alerta (opcional, comentar si no quieres)
    try {
      await transporter.sendMail({
        from: `"Luis Granero CRM" <${process.env.BREVO_SMTP_USER}>`,
        to: 'luis@luisgranero.dev',
        subject: '🚨 ERROR en Cron Job de Emails',
        html: `
          <h2>Error en el cron job de emails</h2>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <p><strong>Error:</strong> ${error.message}</p>
          <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${error.stack}</pre>
        `
      });
    } catch (emailError) {
      console.error('❌ No se pudo enviar email de alerta:', emailError);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// ✅ Exportar GET y POST (GitHub Actions usa POST, Vercel Cron puede usar GET)
export async function GET(request) {
  return handleRequest(request);
}

export async function POST(request) {
  return handleRequest(request);
}