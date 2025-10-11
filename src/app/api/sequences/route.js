// src/app/api/sequences/route.js - NUEVO ARCHIVO
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sequence from '@/models/Sequence';
import SequenceEnrollment from '@/models/SequenceEnrollment';

// GET - Listar todas las secuencias
export async function GET(request) {
  try {
    await dbConnect();
    
    const sequences = await Sequence.find({ isActive: true })
      .sort({ createdAt: -1 });
    
    // Obtener stats actualizadas de cada secuencia
    for (let seq of sequences) {
      const enrollments = await SequenceEnrollment.find({ sequenceId: seq._id });
      
      seq.stats = {
        totalStarted: enrollments.length,
        totalActive: enrollments.filter(e => e.status === 'active').length,
        totalCompleted: enrollments.filter(e => e.status === 'completed').length,
        totalPaused: enrollments.filter(e => e.status === 'paused').length
      };
      
      await seq.save();
    }
    
    return NextResponse.json({
      success: true,
      sequences
    });
  } catch (error) {
    console.error('Error fetching sequences:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nueva secuencia
export async function POST(request) {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    const sequence = await Sequence.create(data);
    
    return NextResponse.json({
      success: true,
      sequence
    });
  } catch (error) {
    console.error('Error creating sequence:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}