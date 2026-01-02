import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import logger from '@/lib/logger';

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

    // SEGURIDAD: Webhook secret es obligatorio
    if (!webhookSecret) {
      logger.error('APIFY_WEBHOOK_SECRET not configured - rejecting webhook');
      return NextResponse.json({ error: 'Webhook authentication not configured' }, { status: 500 });
    }

    // Validar token
    if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
      logger.warn('Apify webhook unauthorized attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();

    logger.info('Apify webhook received', {
      eventType: payload.eventType,
      runId: payload.resource?.id
    });
    
    await dbConnect();
    
    const runId = payload.resource?.id;
    const status = payload.resource?.status;

    if (!runId) {
      logger.error('Webhook missing runId');
      return NextResponse.json({ error: 'No runId' }, { status: 400 });
    }

    // Si el run fue exitoso, obtener resultados
    if (status === 'SUCCEEDED') {
      logger.info('Apify run succeeded, fetching results', { runId });

      const API_TOKEN = process.env.APIFY_API_TOKEN;
      const dataResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items`,
        {
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`
          }
        }
      );

      const results = await dataResponse.json();
      logger.info(`Apify results received: ${results.length} items`, { runId });

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

      logger.db('Apify results saved', { runId, count: results.length });

    } else if (status === 'FAILED') {
      logger.error('Apify run failed', { runId });
      
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
    logger.error('Webhook error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}