// src/app/api/appointments/route.js - MEJORADO
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Lead from '@/models/Lead';
import { requireAdmin } from '@/lib/adminAuth';

// ✅ GET - Obtener todas las citas (CON BUG FIX)
export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const leadId = searchParams.get('leadId');
    const from = searchParams.get('from'); // fecha inicio
    const to = searchParams.get('to'); // fecha fin
    const includeExpired = searchParams.get('includeExpired') === 'true';
    
    // ✅ BUG FIX: Construir filtro correctamente
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (leadId) {
      filter.leadId = leadId;
    }
    
    // Filtro por rango de fechas
    if (from || to) {
      filter.scheduledDate = {};
      if (from) filter.scheduledDate.$gte = new Date(from);
      if (to) filter.scheduledDate.$lte = new Date(to);
    }
    
    // Excluir expirados si no se solicitan
    if (!includeExpired) {
      filter.tokenExpiresAt = { $gte: new Date() };
    }
    
    console.log('📊 Filtro aplicado:', filter);
    
    // ✅ Obtener citas con populate
    const appointments = await Appointment.find(filter)
      .populate('leadId', 'name email phone status category opportunityScore')
      .sort({ scheduledDate: -1, createdAt: -1 })
      .lean();
    
    console.log(`✅ Encontradas ${appointments.length} citas`);
    
    // ✅ Calcular estadísticas
    const allAppointments = await Appointment.find({}).lean();
    const stats = {
      total: allAppointments.length,
      pending: allAppointments.filter(a => a.status === 'pending').length,
      confirmed: allAppointments.filter(a => a.status === 'confirmed').length,
      completed: allAppointments.filter(a => a.status === 'completed').length,
      cancelled: allAppointments.filter(a => a.status === 'cancelled').length,
      no_show: allAppointments.filter(a => a.status === 'no_show').length,
      thisWeek: allAppointments.filter(a => {
        const date = new Date(a.scheduledDate);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return date >= weekStart;
      }).length,
      needsReminder: allAppointments.filter(a => {
        if (!a.scheduledDate || a.status !== 'confirmed') return false;
        const hoursUntil = (new Date(a.scheduledDate) - new Date()) / (1000 * 60 * 60);
        return hoursUntil <= 24 && hoursUntil > 0;
      }).length
    };
    
    return NextResponse.json({
      success: true,
      appointments,
      stats
    });
    
  } catch (error) {
    console.error('❌ Error en GET /api/appointments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nueva cita
export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await connectDB();
    
    const data = await request.json();
    
    if (!data.leadId || !data.name) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }
    
    // Generar token único
    const token = require('crypto').randomBytes(32).toString('hex');
    
    // Expiración del token (30 días)
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30);
    
    const appointment = await Appointment.create({
      leadId: data.leadId,
      token,
      name: data.name,
      phone: data.phone || '',
      email: data.email || '',
      scheduledDate: data.scheduledDate || null,
      scheduledTime: data.scheduledTime || null,
      status: data.status || 'pending',
      notes: data.notes || '',
      tokenExpiresAt,
      source: data.source || 'manual',
      duration: {
        planned: data.plannedDuration || 30
      }
    });
    
    // Actualizar lead
    if (data.leadId) {
      await Lead.findByIdAndUpdate(data.leadId, {
        $push: {
          contactHistory: {
            date: new Date(),
            type: 'appointment_scheduled',
            notes: `Cita agendada: ${data.scheduledDate || 'Pendiente de confirmar'}`
          }
        }
      });
    }
    
    console.log('✅ Cita creada:', appointment._id);
    
    return NextResponse.json({
      success: true,
      appointment,
      magicLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/agendar/${token}`
    });
    
  } catch (error) {
    console.error('❌ Error en POST /api/appointments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar cita
export async function PATCH(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await connectDB();
    
    const data = await request.json();
    const { id, ...updates } = data;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      );
    }
    
    // ✅ Permitir actualizar campos específicos
    const allowedUpdates = [
      'status',
      'scheduledDate',
      'scheduledTime',
      'notes',
      'callNotes',
      'duration',
      'callResult',
      'cancellationReason',
      'cancellationNotes'
    ];
    
    const updateData = {};
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('leadId');
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Cita no encontrada' },
        { status: 404 }
      );
    }
    
    // ✅ Si se marca como completada, actualizar lead
    if (updates.status === 'completed' && appointment.leadId) {
      await Lead.findByIdAndUpdate(appointment.leadId._id, {
        $push: {
          contactHistory: {
            date: new Date(),
            type: 'call',
            notes: `Llamada completada. ${updates.callNotes || ''}`
          }
        },
        $set: {
          lastContactedAt: new Date(),
          status: updates.callResult?.converted ? 'hot' : 'warm'
        }
      });
    }
    
    console.log('✅ Cita actualizada:', appointment._id);
    
    return NextResponse.json({
      success: true,
      appointment
    });
    
  } catch (error) {
    console.error('❌ Error en PATCH /api/appointments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar cita
export async function DELETE(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      );
    }
    
    const appointment = await Appointment.findByIdAndDelete(id);
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Cita no encontrada' },
        { status: 404 }
      );
    }
    
    console.log('✅ Cita eliminada:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Cita eliminada correctamente'
    });
    
  } catch (error) {
    console.error('❌ Error en DELETE /api/appointments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
