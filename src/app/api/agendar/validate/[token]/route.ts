// src/app/api/agendar/validate/[token]/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Lead from '@/models/Lead';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    await connectDB();
    
    // Buscar cita por token
    const appointment = await Appointment.findOne({
      token,
      tokenExpiresAt: { $gt: new Date() } // Token no expirado
    }).populate('leadId');
    
    if (!appointment) {
      return NextResponse.json({ 
        valid: false,
        error: 'Token inválido o expirado' 
      }, { status: 404 });
    }
    
    // Obtener información del lead
    const lead = await Lead.findById(appointment.leadId);
    
    return NextResponse.json({
      valid: true,
      lead: {
        _id: lead._id,
        name: lead.name,
        phone: lead.phone,
        email: lead.possibleEmails?.[0]
      }
    });
    
  } catch (error: any) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}