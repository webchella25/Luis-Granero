// src/app/api/admin/appointments/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import SequenceEnrollment from '@/models/SequenceEnrollment';
import EmailLog from '@/models/EmailLog';
import Lead from '@/models/Lead';

// PATCH - Actualizar estado de una cita
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    await connectDB();

    // Validar que el status sea válido
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      );
    }

    // Actualizar el appointment
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('leadId');

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    // Si se confirma o completa, actualizar el lead
    if ((status === 'confirmed' || status === 'completed') && appointment.leadId) {
      await Lead.findByIdAndUpdate(appointment.leadId, {
        status: 'interested',
        $push: {
          contactHistory: {
            date: new Date(),
            type: 'call',
            notes: `Llamada ${status === 'confirmed' ? 'confirmada' : 'completada'} para ${appointment.scheduledDate}`
          }
        }
      });
    }

    console.log(`✅ Cita ${id} actualizada a estado: ${status}`);

    return NextResponse.json({
      success: true,
      appointment
    });

  } catch (error: any) {
    console.error('Error actualizando cita:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una cita
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    await connectDB();

    // Buscar y eliminar
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    console.log(`🗑️ Cita ${id} eliminada: ${appointment.name}`);

    return NextResponse.json({
      success: true,
      message: 'Cita eliminada correctamente'
    });

  } catch (error: any) {
    console.error('Error eliminando cita:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}