// src/app/api/leads/search/route.ts
import { NextResponse } from 'next/server';
import { scrapeGoogleMaps } from '@/lib/scrapers/googleMapsScraper';
import { analyzeWebsite, guessBusinessEmails } from '@/lib/scrapers/websiteAnalyzer';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';

export async function POST(request: Request) {
  try {
    const { query, location, maxResults = 20, saveToDb = true } = await request.json();
    
    if (!query || !location) {
      return NextResponse.json(
        { error: 'Query y location son requeridos' },
        { status: 400 }
      );
    }

    if (!process.env.SERPAPI_KEY) {
      return NextResponse.json(
        { error: 'SERPAPI_KEY no configurada' },
        { status: 500 }
      );
    }
    
    console.log(`\n🚀 Iniciando búsqueda de leads...`);
    console.log(`📍 Búsqueda: "${query}" en "${location}"`);
    
    // 1. Scraping de Google Maps
    const rawBusinesses = await scrapeGoogleMaps(query, location, maxResults);
    
    if (rawBusinesses.length === 0) {
      return NextResponse.json({ 
        success: true,
        leads: [], 
        message: 'No se encontraron resultados',
        stats: { total: 0, withWebsite: 0, withoutWebsite: 0, highOpportunity: 0 }
      });
    }
    
    console.log(`\n📊 Analizando ${rawBusinesses.length} negocios...`);
    
    // 2. Analizar y enriquecer
    const enrichedLeads = await Promise.all(
      rawBusinesses.map(async (business, index) => {
        console.log(`\n[${index + 1}/${rawBusinesses.length}] Procesando: ${business.name}`);
        
        let webAnalysis = null;
        if (business.website) {
          try {
            webAnalysis = await analyzeWebsite(business.website);
          } catch (error) {
            console.log(`  ⚠️ Error analizando web: ${error}`);
          }
        }
        
        const emails = webAnalysis?.emails && webAnalysis.emails.length > 0
          ? webAnalysis.emails
          : business.website 
            ? guessBusinessEmails(business.name, business.website)
            : [];
        
        const opportunityScore = calculateOpportunityScore(business, webAnalysis);
        
        return {
          ...business,
          webAnalysis,
          possibleEmails: emails,
          opportunityScore,
          searchQuery: `${query} ${location}`,
          createdAt: new Date().toISOString()
        };
      })
    );
    
    const sortedLeads = enrichedLeads.sort((a, b) => b.opportunityScore - a.opportunityScore);
    
    // 3. 💾 Guardar en base de datos
    let savedCount = 0;
    if (saveToDb) {
      console.log(`\n💾 Guardando leads en base de datos...`);
      await connectDB();
      
      for (const lead of sortedLeads) {
        try {
          // Usar upsert para evitar duplicados por placeId
          await Lead.findOneAndUpdate(
            { placeId: lead.placeId },
            { 
              $set: lead,
              $setOnInsert: { createdAt: new Date() }
            },
            { 
              upsert: true, 
              new: true,
              setDefaultsOnInsert: true 
            }
          );
          savedCount++;
        } catch (error) {
          console.error(`  ⚠️ Error guardando ${lead.name}:`, error);
        }
      }
      
      console.log(`✅ ${savedCount}/${sortedLeads.length} leads guardados`);
    }
    
    console.log(`\n✅ Proceso completado!`);
    console.log(`📈 Total leads: ${sortedLeads.length}`);
    console.log(`🎯 Leads alta oportunidad (>70): ${sortedLeads.filter(l => l.opportunityScore > 70).length}`);
    
    return NextResponse.json({ 
      success: true,
      leads: sortedLeads,
      stats: {
        total: sortedLeads.length,
        withWebsite: sortedLeads.filter(l => l.website).length,
        withoutWebsite: sortedLeads.filter(l => !l.website).length,
        highOpportunity: sortedLeads.filter(l => l.opportunityScore > 70).length,
        saved: savedCount
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error en búsqueda de leads:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error en el servidor'
      },
      { status: 500 }
    );
  }
}

function calculateOpportunityScore(business: any, webAnalysis: any): number {
  let score = 50;
  
  if (!business.website) return 100;
  
  if (webAnalysis) {
    const webScore = webAnalysis.score;
    score += (100 - webScore) * 0.5;
    
    if (!webAnalysis.hasMobile) score += 15;
    if (!webAnalysis.hasSSL) score += 10;
    if (webAnalysis.loadTime > 5000) score += 10;
    if (webAnalysis.technology === 'Joomla') score += 15;
  }
  
  if (business.rating && business.rating >= 4.5) score += 10;
  if (business.reviewCount && business.reviewCount > 50) score += 10;
  
  return Math.min(100, Math.max(0, Math.round(score)));
}