// src/app/api/sequences/stats/route.js - VERSIÓN CORREGIDA
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sequence from '@/models/Sequence';
import SequenceEnrollment from '@/models/SequenceEnrollment';
import EmailLog from '@/models/EmailLog';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();

    // Contar secuencias y enrollments activos
    const [totalSequences, activeEnrollments, emailsSent, emailsOpened] = await Promise.all([
      Sequence.countDocuments({ isActive: true }),
      SequenceEnrollment.countDocuments({ status: 'active' }),
      EmailLog.countDocuments({ status: 'sent' }),
      EmailLog.countDocuments({ opened: true }) // ✅ Esto está bien
    ]);

    const openRate = emailsSent > 0 
      ? Math.round((emailsOpened / emailsSent) * 100) 
      : 0;

    return NextResponse.json({
      success: true,
      stats: {
        total: totalSequences,
        active: activeEnrollments, // ✅ Número de enrollments activos, no secuencias
        emailsSent,
        openRate
      }
    });

  } catch (error) {
    console.error('Error fetching sequence stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
