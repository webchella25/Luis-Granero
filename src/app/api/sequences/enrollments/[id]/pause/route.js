// src/app/api/sequences/enrollments/[id]/pause/route.js - CORREGIDO ✅
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SequenceEnrollment from '@/models/SequenceEnrollment';
import Sequence from '@/models/Sequence';

export async function POST(request, { params }) {
  try {
    const { id } = await params; // ← FIX: await params
    await dbConnect();
    
    const enrollment = await SequenceEnrollment.findById(id);
    
    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment no encontrado' },
        { status: 404 }
      );
    }
    
    // Pausar enrollment
    enrollment.status = 'paused';
    enrollment.pausedAt = new Date();
    enrollment.pauseReason = 'Pausado manualmente';
    await enrollment.save();
    
    // Actualizar stats de la secuencia
    await Sequence.findByIdAndUpdate(enrollment.sequenceId, {
      $inc: {
        'stats.totalActive': -1,
        'stats.totalPaused': 1
      }
    });
    
    return NextResponse.json({
      success: true,
      enrollment
    });
  } catch (error) {
    console.error('Error pausing enrollment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}