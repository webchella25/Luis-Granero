// src/app/api/cron/update-lead-stats/route.js - ACTUALIZADO
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import SequenceEnrollment from '@/models/SequenceEnrollment';

// ✅ Función compartida para GET y POST
async function handleRequest(request) {
  try {
    await dbConnect();
    
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (authHeader !== expectedAuth) {
      console.error('❌ Unauthorized attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('📊 Actualizando stats de leads...');
    
    // Actualizar leads inactivos (sin contacto en 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const inactiveLeads = await Lead.updateMany(
      {
        status: 'contacted',
        'contactHistory.0.date': { $lt: thirtyDaysAgo }
      },
      {
        $set: { status: 'lost' },
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
      inactiveLeadsUpdated: inactiveLeads.modifiedCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error actualizando stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ Exportar GET y POST
export async function GET(request) {
  return handleRequest(request);
}

export async function POST(request) {
  return handleRequest(request);
}