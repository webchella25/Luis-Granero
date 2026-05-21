// src/app/api/leads/send-email/route.js - ACTUALIZADO CON TRACKING
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import EmailLog from '@/models/EmailLog';
import EmailTemplate from '@/models/EmailTemplate';
import { sendEmail } from '@/lib/email/mailer';
import { prepareEmailForTracking } from '@/lib/email/tracking';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { leadId, to, templateId } = await request.json();
    
    if (!leadId || !to) {
      return NextResponse.json(
        { error: 'leadId y to son requeridos' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead no encontrado' },
        { status: 404 }
      );
    }
    
    let template;
    if (templateId) {
      template = await EmailTemplate.findOne({ templateId });
    } else {
      const defaultTemplateId = lead.website ? 'email_has_website' : 'email_no_website';
      template = await EmailTemplate.findOne({ templateId: defaultTemplateId, isActive: true });
    }
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template no encontrado' },
        { status: 404 }
      );
    }
    
    const subject = replaceShortcodes(template.subject, lead);
    let htmlBody = replaceShortcodes(template.body, lead);
    
    if (!htmlBody.includes('<html>')) {
      htmlBody = convertTextToHtml(htmlBody);
    }
    
    const emailLog = await EmailLog.create({
      leadId: lead._id,
      emailTo: to,
      subject: subject,
      emailBody: htmlBody,
      status: 'sending',
      source: 'manual',
      templateId: template.templateId
    });
    
    console.log('📧 EmailLog created:', emailLog._id);
    
    const trackedHtml = prepareEmailForTracking(htmlBody, emailLog._id.toString());
    
    console.log('🔍 Tracking añadido al email');
    
    const mailOptions = {
      from: `"Luis Granero - Developer" <${process.env.BREVO_SMTP_USER}>`,
      to: to,
      subject: subject,
      text: htmlBody.replace(/<[^>]*>/g, ''),
      html: trackedHtml,
      headers: {
        'X-Email-Log-ID': emailLog._id.toString(),
        'X-Lead-ID': lead._id.toString()
      }
    };
    
    const info = await sendEmail(mailOptions);
    
    console.log('✅ Email enviado:', info.messageId);
    
    await EmailLog.findByIdAndUpdate(emailLog._id, {
      status: 'sent',
      sentAt: new Date(),
      messageId: info.messageId
    });
    
    await Lead.findByIdAndUpdate(leadId, {
      $set: { 
        status: 'contacted',
        lastInteraction: new Date(),
        lastInteractionType: 'email_sent'
      },
      $push: {
        contactHistory: {
          date: new Date(),
          type: 'email',
          emailSubject: subject,
          notes: `Email enviado: ${template.name}`
        }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado correctamente',
      emailLogId: emailLog._id.toString(),
      messageId: info.messageId,
      templateUsed: template.name
    });
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error al enviar email',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

function replaceShortcodes(text, lead) {
  if (!text) return '';
  
  const now = new Date();
  const replacements = {
    '{{name}}': lead.name || '',
    '{{first_name}}': lead.name?.split(' ')[0] || '',
    '{{email}}': lead.possibleEmails?.[0] || '',
    '{{phone}}': lead.phone || '',
    '{{website}}': lead.website || 'tu sitio web',
    '{{company_name}}': lead.name || '',
    '{{current_date}}': now.toLocaleDateString('es-ES'),
    '{{admin_name}}': 'Luis Granero',
    '{{admin_email}}': 'luis@luisgranero.com',
    '{{admin_phone}}': '+34 XXX XXX XXX'
  };
  
  let result = text;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), value);
  }
  
  return result;
}

function convertTextToHtml(text) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    p {
      margin-bottom: 15px;
    }
    a {
      color: #06b6d4;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  ${text.split('\n').map(line => {
    if (line.trim() === '') return '<br>';
    return `<p>${line}</p>`;
  }).join('\n')}
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
  
  <p style="color: #666; font-size: 13px;">
    <strong>Luis Granero</strong><br>
    Desarrollo Web Profesional<br>
    🌐 <a href="https://www.luisgranero.com">www.luisgranero.com</a><br>
    📧 luis@luisgranero.com
  </p>
</body>
</html>
  `.trim();
}
