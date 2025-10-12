// src/app/api/cron/cleanup-old-logs/route.js - ACTUALIZADO
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';

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
    
    console.log('🗑️ Limpiando logs antiguos...');
    
    // Borrar logs de más de 90 días
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const result = await EmailLog.deleteMany({
      createdAt: { $lt: ninetyDaysAgo }
    });
    
    console.log(`✅ Eliminados ${result.deletedCount} logs antiguos`);
    
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en cleanup:', error);
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