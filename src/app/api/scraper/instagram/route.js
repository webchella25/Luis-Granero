import { NextResponse } from 'next/server';
import { scrapeInstagramHashtag } from '@/lib/scraper/instagramScraper';
import { clampPaginationLimit, requireAdmin } from '@/lib/adminAuth';

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { hashtag } = body;
    const maxResults = clampPaginationLimit(body.maxResults, 20, 50);
    
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
