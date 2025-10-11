// src/app/api/cron/cleanup-old-logs/route.js - NUEVO ARCHIVO (OPCIONAL)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';

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
    
    // Borrar logs de más de 90 días
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const result = await EmailLog.deleteMany({
      createdAt: { $lt: ninetyDaysAgo }
    });
    
    console.log(`🗑️ Eliminados ${result.deletedCount} logs antiguos`);
    
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('Error en cleanup:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}