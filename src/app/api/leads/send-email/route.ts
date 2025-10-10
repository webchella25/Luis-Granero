// src/app/api/leads/send-email/route.ts - COMPLETO CORREGIDO
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Appointment from '@/models/Appointment';
import nodemailer from 'nodemailer';
import { generatePersonalizedEmail } from '@/lib/email/templates';
import { generateMagicToken, getMagicLinkExpiration, createMagicLink } from '@/lib/utils/magicLinks';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { leadId, to, subject, body } = await request.json();

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
    
    // Generar email personalizado con magic link
    const emailContent = generatePersonalizedEmail(lead, magicLink);
    
    console.log('📧 Enviando email a:', to);

    // Configurar Brevo SMTP
    const transporter = nodemailer.createTransport({  // ← CORREGIDO
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Enviar email
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.htmlBody
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
          emailSubject: emailContent.subject,
          notes: `Email enviado con magic link. Token: ${token}`,
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado correctamente con link de agendamiento',
      messageId: info.messageId,
      magicLink: magicLink
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