import { NextResponse } from 'next/server';
import { scrapeInstagramHashtag } from '@/lib/scraper/instagramScraper';

export async function POST(request) {
  try {
    const { hashtag, maxResults = 20 } = await request.json();
    
    if (!hashtag) {
      return NextResponse.json({ error: 'Hashtag requerido' }, { status: 400 });
    }
    
    console.log(`🔍 Scraping Instagram: #${hashtag}`);
    
    const leads = await scrapeInstagramHashtag(hashtag, maxResults);
    
    return NextResponse.json({
      success: true,
      leads,
      total: leads.length
    });
    
  } catch (error) {
    console.error('❌ Error en Instagram scraper:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}