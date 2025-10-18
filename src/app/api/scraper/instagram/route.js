import { NextResponse } from 'next/server';
import { scrapeInstagramHashtag, getInstagramResults } from '@/lib/scraper/instagramScraper';

export async function POST(request) {
  try {
    const body = await request.json();
    const { hashtag, maxResults = 20, action = 'start', runId } = body;
    
    if (action === 'start') {
      // Iniciar scraping
      if (!hashtag) {
        return NextResponse.json({ error: 'Hashtag requerido' }, { status: 400 });
      }
      
      console.log(`🔍 Iniciando scraping de Instagram: #${hashtag}`);
      
      const result = await scrapeInstagramHashtag(hashtag, maxResults);
      
      return NextResponse.json({
        success: true,
        runId: result.runId,
        message: 'Scraping iniciado. Usa action=check para verificar el status.'
      });
    } 
    else if (action === 'check') {
      // Verificar status
      if (!runId) {
        return NextResponse.json({ error: 'runId requerido' }, { status: 400 });
      }
      
      console.log(`📊 Verificando status de run: ${runId}`);
      
      const result = await getInstagramResults(runId);
      
      if (result.status === 'SUCCEEDED') {
        return NextResponse.json({
          success: true,
          status: 'completed',
          leads: result.leads,
          total: result.leads.length
        });
      } else if (result.status === 'FAILED') {
        return NextResponse.json({
          success: false,
          status: 'failed',
          error: result.error || 'Unknown error'
        });
      } else {
        return NextResponse.json({
          success: true,
          status: 'running',
          message: 'Scraping en progreso...'
        });
      }
    } else {
      return NextResponse.json({ error: 'Action inválido' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Error en Instagram scraper:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}