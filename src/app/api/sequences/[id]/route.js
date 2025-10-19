// src/app/api/sequences/[id]/route.js - CORREGIDO ✅
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sequence from '@/models/Sequence';
import SequenceEnrollment from '@/models/SequenceEnrollment';
import EmailLog from '@/models/EmailLog';
import Lead from '@/models/Lead'; // ← AÑADE ESTA LÍNEA

// GET - Obtener secuencia con stats detalladas
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const sequence = await Sequence.findById(id);
    
    if (!sequence) {
      return NextResponse.json(
        { success: false, error: 'Secuencia no encontrada' },
        { status: 404 }
      );
    }
    
    // Obtener enrollments
    const enrollments = await SequenceEnrollment.find({ sequenceId: id })
      .populate('leadId') // ← Aquí usa Lead, por eso necesita el import
      .sort({ createdAt: -1 });
    
    // Obtener logs de emails
    const emailLogs = await EmailLog.find({ sequenceId: id });
    
    // Calcular métricas
    const metrics = {
      totalEmails: emailLogs.length,
      emailsSent: emailLogs.filter(e => e.status === 'sent').length,
      emailsOpened: emailLogs.filter(e => e.opened).length,
      emailsClicked: emailLogs.filter(e => e.clicked).length,
      openRate: 0,
      clickRate: 0
    };
    
    if (metrics.emailsSent > 0) {
      metrics.openRate = ((metrics.emailsOpened / metrics.emailsSent) * 100).toFixed(1);
      metrics.clickRate = ((metrics.emailsClicked / metrics.emailsSent) * 100).toFixed(1);
    }
    
    return NextResponse.json({
      success: true,
      sequence,
      enrollments,
      metrics
    });
  } catch (error) {
    console.error('Error fetching sequence:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar secuencia
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const updates = await request.json();
    updates.updatedAt = new Date();
    
    const sequence = await Sequence.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
    
    if (!sequence) {
      return NextResponse.json(
        { success: false, error: 'Secuencia no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      sequence
    });
  } catch (error) {
    console.error('Error updating sequence:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar secuencia
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    // Pausar todos los enrollments activos
    await SequenceEnrollment.updateMany(
      { sequenceId: id, status: 'active' },
      { status: 'paused', pauseReason: 'Secuencia eliminada' }
    );
    
    // Marcar como inactiva
    const sequence = await Sequence.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting sequence:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}