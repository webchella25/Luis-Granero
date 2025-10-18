import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { scrapeInstagramHashtag } from '@/lib/scraper/instagramScraper';

export async function POST(request) {
  try {
    const { hashtag, maxResults = 20, saveToDb = false } = await request.json();
    
    if (!hashtag) {
      return NextResponse.json(
        { error: 'Hashtag es requerido' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Iniciando scraping de Instagram: #${hashtag}`);
    
    const leads = await scrapeInstagramHashtag(hashtag, maxResults);
    
    if (saveToDb) {
      await dbConnect();
      
      const savedLeads = [];
      
      for (const lead of leads) {
        try {
          // Verificar si ya existe por username
          const existingLead = await Lead.findOne({ 
            username: lead.username,
            source: 'instagram'
          });
          
          if (existingLead) {
            console.log(`⚠️ Lead ya existe: @${lead.username}`);
            continue;
          }
          
          const newLead = await Lead.create(lead);
          savedLeads.push(newLead);
          console.log(`✅ Lead guardado: @${newLead.username}`);
          
        } catch (error) {
          console.error(`❌ Error guardando @${lead.username}:`, error);
        }
      }
      
      return NextResponse.json({
        success: true,
        leads: savedLeads,
        total: savedLeads.length
      });
    }
    
    // Retornar sin guardar (preview)
    return NextResponse.json({
      success: true,
      leads,
      total: leads.length
    });
    
  } catch (error) {
    console.error('❌ Error en Instagram scraper:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}