// src/app/api/leads/send-email/route.ts - ACTUALIZADO CON TEMPLATES
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Template from '@/models/Template'; // ← NUEVO
import Appointment from '@/models/Appointment';
import nodemailer from 'nodemailer';
import { generateMagicToken, getMagicLinkExpiration, createMagicLink } from '@/lib/utils/magicLinks';

// Función para procesar variables en template
function processTemplate(template: any, lead: any, magicLink: string) {
  const variableMap: Record<string, any> = {
    business_name: lead.name,
    category: lead.category || 'negocios locales',
    review_count: lead.reviewCount || 0,
    rating: lead.rating || 0,
    phone: lead.phone,
    address: lead.address,
    website: lead.website,
    load_time: lead.webAnalysis?.loadTime 
      ? Math.round(lead.webAnalysis.loadTime / 1000) 
      : '?',
    issues_list: lead.webAnalysis?.issues 
      ? lead.webAnalysis.issues.slice(0, 3).map((issue: string) => `• ${issue}`).join('\n')
      : '• Sin análisis disponible',
    magic_link: magicLink,
    score: lead.opportunityScore
  };

  let processedSubject = template.subject || '';
  let processedBody = template.body;

  // Reemplazar variables
  Object.entries(variableMap).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedSubject = processedSubject.replace(regex, String(value));
    processedBody = processedBody.replace(regex, String(value));
  });

  return { subject: processedSubject, body: processedBody };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { leadId, to, templateId } = await request.json(); // ← AÑADIDO templateId

    if (!leadId || !to) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Obtener lead
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
    }

    // Obtener template (si se especifica, sino usar el por defecto)
    let template;
    if (templateId) {
      template = await Template.findOne({ id: templateId, isActive: true });
    } else {
      // Template por defecto según si tiene web o no
      const defaultTemplateId = lead.website ? 'email_has_website' : 'email_no_website';
      template = await Template.findOne({ id: defaultTemplateId, isActive: true });
    }

    if (!template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 });
    }

    // Generar magic link
    const token = generateMagicToken();
    const magicLink = createMagicLink(token);
    const tokenExpiresAt = getMagicLinkExpiration();
    
    // Crear appointment
    const appointment = new Appointment({
      leadId: lead._id,
      token,
      tokenExpiresAt,
      name: lead.name,
      phone: lead.phone || '',
      email: to,
      status: 'pending'
    });
    
    await appointment.save();
    
    // Procesar template con variables
    const processed = processTemplate(template, lead, magicLink);
    
    console.log('📧 Enviando email a:', to);
    console.log('📝 Template usado:', template.name);

    // Configurar Brevo SMTP (tu configuración existente)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Convertir texto a HTML básico (opcional: puedes mejorarlo)
    const htmlBody = processed.body
      .split('\n')
      .map(line => {
        if (line.startsWith('✓') || line.startsWith('•')) {
          return `<li>${line.substring(1).trim()}</li>`;
        }
        if (line.includes('{{magic_link}}')) {
          return `<p><a href="${magicLink}" style="background: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Agendar Llamada</a></p>`;
        }
        return line ? `<p>${line}</p>` : '<br>';
      })
      .join('');

    // Enviar email
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject: processed.subject,
      text: processed.body, // Versión texto plano
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${htmlBody}
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 13px;">
            <strong>Luis Granero</strong><br>
            Desarrollo Web Profesional<br>
            🌐 www.luisgranero.com<br>
            📧 ${process.env.EMAIL_FROM}
          </p>
        </div>
      `
    });

    console.log('✅ Email enviado:', info.messageId);

    // Actualizar lead
    await Lead.findByIdAndUpdate(leadId, {
      $set: { 
        status: 'contacted',
        updatedAt: new Date()
      },
      $push: {
        contactHistory: {
          date: new Date(),
          type: 'email',
          emailSubject: processed.subject,
          notes: `Email enviado con magic link. Template: ${template.name}
Token: ${token}`,
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado correctamente',
      messageId: info.messageId,
      magicLink: magicLink,
      templateUsed: template.name
    });

  } catch (error: any) {
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