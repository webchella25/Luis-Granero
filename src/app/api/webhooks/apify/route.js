import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// Modelo temporal para guardar resultados
const ApifyResultSchema = new mongoose.Schema({
  runId: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  results: { type: Array, default: [] },
  error: String,
  createdAt: { type: Date, default: Date.now, expires: 3600 } // Se borra en 1 hora
});

const ApifyResult = mongoose.models.ApifyResult || mongoose.model('ApifyResult', ApifyResultSchema);

export async function POST(request) {
  try {
    // Verificar autenticación del webhook
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.APIFY_WEBHOOK_SECRET;

    // Si hay webhook secret configurado, validarlo
    if (webhookSecret) {
      if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
        console.error('❌ Webhook no autorizado');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      console.warn('⚠️ APIFY_WEBHOOK_SECRET no está configurado - el webhook no está protegido');
    }

    const payload = await request.json();

    console.log('📥 Webhook recibido de Apify');
    console.log('Event type:', payload.eventType);
    console.log('Run ID:', payload.resource?.id);
    
    await dbConnect();
    
    const runId = payload.resource?.id;
    const status = payload.resource?.status;
    
    if (!runId) {
      console.error('❌ No runId en webhook');
      return NextResponse.json({ error: 'No runId' }, { status: 400 });
    }
    
    // Si el run fue exitoso, obtener resultados
    if (status === 'SUCCEEDED') {
      console.log('✅ Run exitoso, obteniendo resultados...');
      
      const API_TOKEN = process.env.APIFY_API_TOKEN;
      const dataResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${API_TOKEN}`
      );
      
      const results = await dataResponse.json();
      console.log(`📊 ${results.length} items recibidos`);
      
      // Guardar en DB temporal
      await ApifyResult.findOneAndUpdate(
        { runId },
        {
          runId,
          status: 'SUCCEEDED',
          results: results
        },
        { upsert: true, new: true }
      );
      
      console.log('💾 Resultados guardados en DB temporal');
      
    } else if (status === 'FAILED') {
      console.log('❌ Run falló');
      
      await ApifyResult.findOneAndUpdate(
        { runId },
        {
          runId,
          status: 'FAILED',
          error: payload.resource?.error || 'Unknown error'
        },
        { upsert: true, new: true }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}