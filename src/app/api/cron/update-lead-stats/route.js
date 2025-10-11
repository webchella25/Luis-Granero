// src/app/api/cron/update-lead-stats/route.js - NUEVO ARCHIVO (OPCIONAL)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import SequenceEnrollment from '@/models/SequenceEnrollment';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Actualizar leads inactivos (sin contacto en 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const inactiveLeads = await Lead.updateMany(
      {
        status: 'contacted',
        'contactHistory.0.date': { $lt: thirtyDaysAgo }
      },
      {
        status: 'lost',
        $push: {
          contactHistory: {
            date: new Date(),
            type: 'note',
            notes: 'Lead marcado como perdido por inactividad (30+ días sin contacto)'
          }
        }
      }
    );
    
    console.log(`📊 Actualizados ${inactiveLeads.modifiedCount} leads inactivos`);
    
    return NextResponse.json({
      success: true,
      inactiveLeadsUpdated: inactiveLeads.modifiedCount
    });
    
  } catch (error) {
    console.error('Error actualizando stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}