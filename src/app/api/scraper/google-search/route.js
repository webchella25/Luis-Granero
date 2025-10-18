import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { scrapeGoogleSearch, calculateSearchScore } from '@/lib/scraper/googleSearchScraper';
import { analyzeWebsite } from '@/lib/scraper/webAnalyzer';
import { findAllEmails } from '@/lib/scraper/emailFinder';

export async function POST(request) {
  try {
    const { query, numResults = 20 } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query es requerido' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Iniciando búsqueda: "${query}"`);
    
    // 1. Scrapear Google Search
    const searchResults = await scrapeGoogleSearch(query, numResults);
    
    if (searchResults.length === 0) {
      return NextResponse.json({
        success: true,
        leads: [],
        message: 'No se encontraron resultados'
      });
    }
    
    // 2. Procesar cada resultado
    const processedLeads = [];
    
    for (const result of searchResults) {
      try {
        console.log(`\n📊 Procesando: ${result.name}`);
        
        // 2.1 Analizar website
        let webAnalysis = null;
        if (result.website) {
          try {
            webAnalysis = await analyzeWebsite(result.website);
            console.log(`  ✅ Web analizada`);
          } catch (err) {
            console.log(`  ⚠️ Error analizando web:`, err.message);
          }
        }
        
        // 2.2 Buscar emails
        let emails = [];
        if (result.website && result.domain) {
          try {
            emails = await findAllEmails(result.website, result.domain);
            console.log(`  📧 ${emails.length} emails encontrados`);
          } catch (err) {
            console.log(`  ⚠️ Error buscando emails:`, err.message);
          }
        }
        
        // 2.3 Calcular score
        const leadData = {
          ...result,
          possibleEmails: emails,
          webAnalysis: webAnalysis
        };
        
        const score = calculateSearchScore(leadData);
        leadData.opportunityScore = score;
        
        console.log(`  🎯 Score: ${score}/100`);
        
        processedLeads.push(leadData);
        
        // Delay para no saturar APIs
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error procesando ${result.name}:`, error);
        // Continuar con el siguiente
      }
    }
    
    console.log(`\n✅ ${processedLeads.length} leads procesados correctamente`);
    
    return NextResponse.json({
      success: true,
      leads: processedLeads,
      total: processedLeads.length
    });
    
  } catch (error) {
    console.error('❌ Error en Google Search scraper:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error en el scraping',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}