// src/app/api/leads/search/route.ts
import { NextResponse } from 'next/server';
import { scrapeGoogleMaps } from '@/lib/scrapers/googleMapsScraper';
import { analyzeWebsite, guessBusinessEmails } from '@/lib/scrapers/websiteAnalyzer';

export async function POST(request: Request) {
  try {
    const { query, location, maxResults = 20 } = await request.json();
    
    if (!query || !location) {
      return NextResponse.json(
        { error: 'Query y location son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que existe la API key
    if (!process.env.SERPAPI_KEY) {
      return NextResponse.json(
        { error: 'SERPAPI_KEY no configurada en variables de entorno' },
        { status: 500 }
      );
    }
    
    console.log(`\n🚀 Iniciando búsqueda de leads...`);
    console.log(`📍 Búsqueda: "${query}" en "${location}"`);
    
    // 1. Scraping de Google Maps con SerpAPI
    const rawBusinesses = await scrapeGoogleMaps(query, location, maxResults);
    
    if (rawBusinesses.length === 0) {
      return NextResponse.json({ 
        success: true,
        leads: [], 
        message: 'No se encontraron resultados',
        stats: {
          total: 0,
          withWebsite: 0,
          withoutWebsite: 0,
          highOpportunity: 0
        }
      });
    }
    
    console.log(`\n📊 Analizando ${rawBusinesses.length} negocios...`);
    
    // 2. Analizar cada website y calcular score
    const enrichedLeads = await Promise.all(
      rawBusinesses.map(async (business, index) => {
        console.log(`\n[${index + 1}/${rawBusinesses.length}] Procesando: ${business.name}`);
        
        // Analizar website si existe
        let webAnalysis = null;
        if (business.website) {
          try {
            webAnalysis = await analyzeWebsite(business.website);
          } catch (error) {
            console.log(`  ⚠️ Error analizando web: ${error}`);
          }
        }
        
        // Obtener o adivinar emails
        const emails = webAnalysis?.emails && webAnalysis.emails.length > 0
          ? webAnalysis.emails
          : business.website 
            ? guessBusinessEmails(business.name, business.website)
            : [];
        
        // Calcular score de oportunidad
        const opportunityScore = calculateOpportunityScore(business, webAnalysis);
        
        return {
          ...business,
          webAnalysis,
          possibleEmails: emails,
          opportunityScore,
          createdAt: new Date().toISOString()
        };
      })
    );
    
    // Ordenar por score (mejores oportunidades primero)
    const sortedLeads = enrichedLeads.sort((a, b) => b.opportunityScore - a.opportunityScore);
    
    console.log(`\n✅ Proceso completado!`);
    console.log(`📈 Total leads: ${sortedLeads.length}`);
    console.log(`🎯 Leads con alta oportunidad (>70): ${sortedLeads.filter(l => l.opportunityScore > 70).length}`);
    
    return NextResponse.json({ 
      success: true,
      leads: sortedLeads,
      stats: {
        total: sortedLeads.length,
        withWebsite: sortedLeads.filter(l => l.website).length,
        withoutWebsite: sortedLeads.filter(l => !l.website).length,
        highOpportunity: sortedLeads.filter(l => l.opportunityScore > 70).length
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error en búsqueda de leads:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error en el servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Calcular score de oportunidad (0-100)
function calculateOpportunityScore(business: any, webAnalysis: any): number {
  let score = 50; // Base
  
  // Sin website = oportunidad máxima
  if (!business.website) {
    return 100;
  }
  
  // Con website pero problemas = buena oportunidad
  if (webAnalysis) {
    // Invertir el score de la web (web mala = oportunidad alta)
    const webScore = webAnalysis.score;
    score += (100 - webScore) * 0.5; // Peso 50%
    
    // Bonificaciones por problemas específicos
    if (!webAnalysis.hasMobile) score += 15;
    if (!webAnalysis.hasSSL) score += 10;
    if (webAnalysis.loadTime > 5000) score += 10;
    if (webAnalysis.technology === 'Joomla') score += 15;
  }
  
  // Rating alto = negocio establecido = mejor cliente potencial
  if (business.rating && business.rating >= 4.5) score += 10;
  if (business.reviewCount && business.reviewCount > 50) score += 10;
  
  return Math.min(100, Math.max(0, Math.round(score)));
}