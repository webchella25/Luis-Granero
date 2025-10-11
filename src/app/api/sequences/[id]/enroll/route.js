// src/app/api/sequences/[id]/enroll/route.js - NUEVO ARCHIVO
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sequence from '@/models/Sequence';
import SequenceEnrollment from '@/models/SequenceEnrollment';
import EmailLog from '@/models/EmailLog';
import Lead from '@/models/Lead';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { leadId } = await request.json();
    
    // Verificar que el lead existe
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar que la secuencia existe
    const sequence = await Sequence.findById(params.id);
    if (!sequence) {
      return NextResponse.json(
        { success: false, error: 'Secuencia no encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar si el lead ya está en una secuencia activa
    const existingEnrollment = await SequenceEnrollment.findOne({
      leadId,
      status: 'active'
    });
    
    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'El lead ya está en una secuencia activa' },
        { status: 400 }
      );
    }
    
    // Crear enrollment
    const enrollment = await SequenceEnrollment.create({
      leadId,
      sequenceId: params.id,
      currentStep: 0,
      status: 'active',
      startedAt: new Date()
    });
    
    // Programar todos los emails de la secuencia
    const now = new Date();
    
    for (let i = 0; i < sequence.steps.length; i++) {
      const step = sequence.steps[i];
      const scheduledDate = new Date(now);
      scheduledDate.setDate(scheduledDate.getDate() + step.day);
      
      await EmailLog.create({
        leadId,
        sequenceId: params.id,
        enrollmentId: enrollment._id,
        step: i,
        templateId: step.templateId,
        emailTo: lead.possibleEmails?.[0] || '',
        status: 'scheduled',
        scheduledFor: scheduledDate
      });
    }
    
    // Actualizar stats de la secuencia
    sequence.stats.totalStarted += 1;
    sequence.stats.totalActive += 1;
    await sequence.save();
    
    // Actualizar estado del lead
    await Lead.findByIdAndUpdate(leadId, {
      status: 'contacted',
      $push: {
        contactHistory: {
          date: new Date(),
          type: 'note',
          notes: `Inscrito en secuencia: ${sequence.name}`
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      enrollment,
      message: `Lead inscrito en secuencia. ${sequence.steps.length} emails programados.`
    });
  } catch (error) {
    console.error('Error enrolling lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}