// src/app/api/admin/scraper/route.ts - ARCHIVO COMPLETO
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/checkAuth'
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { searchGoogleMaps, analyzeWebsite } from '@/lib/scraper';

export async function POST(request: Request) {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { query, location } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query es requerido' },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando: ${query} en ${location || 'España'}`);

    await connectDB();

    const businesses = await searchGoogleMaps(query, location);
    const savedLeads = [];

    for (const business of businesses) {
      try {
        // Verificar si ya existe
        const existingLead = await Lead.findOne({ placeId: business.placeId });
        
        if (existingLead) {
          console.log(`⚠️ Lead ya existe: ${business.name}`);
          continue;
        }

        let webAnalysis = null;
        let possibleEmails = [];
        let socialMedia = {};

        // Analizar website si existe
        if (business.website) {
          console.log(`🌐 Analizando web: ${business.website}`);
          webAnalysis = await analyzeWebsite(business.website);
          
          // Guardar emails encontrados
          if (webAnalysis.emails && webAnalysis.emails.length > 0) {
            possibleEmails = webAnalysis.emails;
          }
          
          // Guardar redes sociales
          if (webAnalysis.socialMedia) {
            socialMedia = webAnalysis.socialMedia;
          }
        }

        // Calcular opportunity score
        let opportunityScore = 50;
        
        // Sin web = gran oportunidad
        if (!business.website) opportunityScore += 30;
        
        // Web con problemas = oportunidad
        if (webAnalysis && webAnalysis.score < 60) opportunityScore += 20;
        if (webAnalysis && webAnalysis.loadTime > 5000) opportunityScore += 15;
        if (webAnalysis && !webAnalysis.hasSSL) opportunityScore += 10;
        if (webAnalysis && !webAnalysis.hasMobile) opportunityScore += 15;
        
        // Buenas reseñas = más interesante
        if (business.rating && business.rating > 4) opportunityScore += 10;
        
        // Sin email = menos prioritario
        if (possibleEmails.length === 0) opportunityScore -= 10;

        opportunityScore = Math.min(Math.max(opportunityScore, 0), 100);

        // Crear lead
        const lead = new Lead({
          name: business.name,
          address: business.address,
          phone: business.phone,
          website: business.website,
          rating: business.rating,
          reviewCount: business.reviewCount,
          category: query,
          placeId: business.placeId,
          webAnalysis,
          possibleEmails,
          socialMedia,
          opportunityScore,
          status: 'new',
          source: 'google_maps',
          searchQuery: query
        });

        await lead.save();
        savedLeads.push(lead);
        
        console.log(`✅ Lead guardado: ${business.name} (Score: ${opportunityScore})`);

      } catch (error: any) {
        console.error(`❌ Error procesando ${business.name}:`, error.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${savedLeads.length} leads nuevos guardados de ${businesses.length} encontrados`,
      leads: savedLeads,
      stats: {
        total: businesses.length,
        saved: savedLeads.length,
        skipped: businesses.length - savedLeads.length
      }
    });

  } catch (error: any) {
    console.error('Error en scraper:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}