// src/app/api/sequences/pause-for-lead/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SequenceEnrollment from '@/models/SequenceEnrollment';
import EmailLog from '@/models/EmailLog';
import Lead from '@/models/Lead';
import Sequence from '@/models/Sequence';

export async function POST(request: Request) {
  try {
    const { leadId, reason } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'leadId requerido' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Buscar enrollments activos del lead
    const activeEnrollments = await SequenceEnrollment.find({
      leadId,
      status: 'active'
    });

    if (activeEnrollments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay secuencias activas para pausar',
        pausedCount: 0
      });
    }

    let pausedCount = 0;

    // Pausar cada enrollment
    for (const enrollment of activeEnrollments) {
      // Pausar enrollment
      enrollment.status = 'paused';
      enrollment.pausedAt = new Date();
      enrollment.pauseReason = reason || 'Lead contactado';
      await enrollment.save();

      // Cancelar emails pendientes
      await EmailLog.updateMany(
        {
          enrollmentId: enrollment._id,
          status: 'scheduled'
        },
        {
          status: 'cancelled',
          error: reason || 'Secuencia pausada - lead contactado'
        }
      );

      // Actualizar stats de la secuencia
      await Sequence.findByIdAndUpdate(enrollment.sequenceId, {
        $inc: {
          'stats.totalActive': -1,
          'stats.totalPaused': 1
        }
      });

      pausedCount++;
    }

    // Actualizar el lead
    await Lead.findByIdAndUpdate(leadId, {
      $push: {
        contactHistory: {
          date: new Date(),
          type: 'note',
          notes: `${pausedCount} secuencia(s) pausada(s): ${reason || 'Lead contactado'}`
        }
      }
    });

    console.log(`✅ ${pausedCount} secuencias pausadas para lead ${leadId}`);

    return NextResponse.json({
      success: true,
      pausedCount,
      message: `${pausedCount} secuencia(s) pausada(s) correctamente`
    });

  } catch (error: any) {
    console.error('Error pausando secuencias:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}