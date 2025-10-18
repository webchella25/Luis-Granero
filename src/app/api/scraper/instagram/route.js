import { NextResponse } from 'next/server';
import { scrapeInstagramHashtag, getInstagramResults } from '@/lib/scraper/instagramScraper';

export async function POST(request) {
  try {
    const { hashtag, maxResults = 20, action = 'start' } = await request.json();
    
    if (action === 'start') {
      // Iniciar scraping
      if (!hashtag) {
        return NextResponse.json({ error: 'Hashtag requerido' }, { status: 400 });
      }
      
      const { runId } = await scrapeInstagramHashtag(hashtag, maxResults);
      
      return NextResponse.json({
        success: true,
        runId,
        message: 'Scraping iniciado'
      });
    } 
    else if (action === 'check') {
      // Verificar status
      const { runId } = await request.json();
      
      if (!runId) {
        return NextResponse.json({ error: 'runId requerido' }, { status: 400 });
      }
      
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
          error: result.error
        });
      } else {
        return NextResponse.json({
          success: true,
          status: 'running',
          message: 'Scraping en progreso...'
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}