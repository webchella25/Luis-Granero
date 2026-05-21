import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { scrapeGoogleSearch, calculateSearchScore } from '@/lib/scraper/googleSearchScraper';
import { analyzeWebsite } from '@/lib/scrapers/websiteAnalyzer';
import { findAllEmails } from '@/lib/scraper/emailFinder';
import { clampPaginationLimit, requireAdmin } from '@/lib/adminAuth';

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { query } = body;
    const numResults = clampPaginationLimit(body.numResults, 20, 50);
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query es requerido' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Iniciando búsqueda: "${query}"`);
    
    const searchResults = await scrapeGoogleSearch(query, numResults);
    
    if (searchResults.length === 0) {
      return NextResponse.json({
        success: true,
        leads: [],
        message: 'No se encontraron resultados'
      });
    }
    
    const processedLeads = [];
    
    for (const result of searchResults) {
      try {
        console.log(`\n📊 Procesando: ${result.name}`);
        
        let webAnalysis = null;
        if (result.website) {
          try {
            webAnalysis = await analyzeWebsite(result.website);
            console.log(`  ✅ Web analizada`);
          } catch (err) {
            console.log(`  ⚠️ Error analizando web:`, err.message);
          }
        }
        
        let emails = [];
        if (result.website && result.domain) {
          try {
            emails = await findAllEmails(result.website, result.domain);
            console.log(`  📧 ${emails.length} emails encontrados`);
          } catch (err) {
            console.log(`  ⚠️ Error buscando emails:`, err.message);
          }
        }
        
        const leadData = {
          ...result,
          possibleEmails: emails,
          webAnalysis: webAnalysis
        };
        
        const score = calculateSearchScore(leadData);
        leadData.opportunityScore = score;
        
        console.log(`  🎯 Score: ${score}/100`);
        
        processedLeads.push(leadData);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error procesando ${result.name}:`, error);
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
