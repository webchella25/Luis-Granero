// src/app/api/agendar/confirm/route.ts - CORREGIDO
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Lead from '@/models/Lead';
import { sendEmail } from '@/lib/email/mailer';
import { emailTemplates } from '@/lib/email/templates';

export async function POST(request: Request) {
  try {
    const { token, date, time, name, phone } = await request.json();
    
    if (!token || !date || !time || !name || !phone) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Buscar y actualizar cita
    const appointment = await Appointment.findOne({
      token,
      tokenExpiresAt: { $gt: new Date() }
    });
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 404 }
      );
    }
    
    // Actualizar appointment
    appointment.name = name;
    appointment.phone = phone;
    appointment.scheduledDate = new Date(date);
    appointment.scheduledTime = time;
    appointment.status = 'confirmed';
    appointment.updatedAt = new Date();
    
    await appointment.save();
    
    // Actualizar lead
    await Lead.findByIdAndUpdate(appointment.leadId, {
      $set: { 
        status: 'interested',
        phone: phone
      },
      $push: {
        contactHistory: {
          date: new Date(),
          type: 'meeting',
          notes: `Llamada agendada para ${date} a las ${time}`
        }
      }
    });
    
    // Enviar email de confirmación
    const confirmationTemplate = emailTemplates.appointmentConfirmation;

    await sendEmail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: appointment.email || phone,
      subject: confirmationTemplate.subject(),
      html: confirmationTemplate.htmlBody(appointment)
    });
    
    // Enviar notificación a ti mismo
    await sendEmail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_FROM || 'luis@luisgranero.com',
      subject: `🔔 Nueva llamada agendada - ${name}`,
      html: `
        <h2>Nueva llamada agendada</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Hora:</strong> ${time}</p>
        <p><a href="https://www.luisgranero.com/admin/appointments">Ver en panel admin</a></p>
      `
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Cita confirmada correctamente'
    });
    
  } catch (error: any) {
    console.error('Error confirming appointment:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}