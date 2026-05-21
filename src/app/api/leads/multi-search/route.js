// src/app/api/leads/multi-search/route.js
import { NextResponse } from 'next/server';
import { multiSourceEnrichment } from '@/lib/scraper/multiSourceEnrichment';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { clampPaginationLimit, requireAdmin } from '@/lib/adminAuth';

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { query, location, saveToDb = false } = body;
    const maxResults = clampPaginationLimit(body.maxResults, 20, 50);

    if (!query || !location) {
      return NextResponse.json(
        { error: 'Query y location son requeridos' },
        { status: 400 }
      );
    }

    console.log('\n🚀 Iniciando búsqueda multi-source...');
    console.log(`📍 "${query}" en "${location}"`);

    // Ejecutar multi-source enrichment
    const result = await multiSourceEnrichment(query, location, {
      maxResults,
      includeInstagram: true,
      includeFacebook: true,
      analyzeWebsites: true
    });

    // Guardar en DB si se solicita
    if (saveToDb) {
      console.log('\n💾 Guardando leads en base de datos...');

      await connectDB();

      const savedLeads = [];
      const skippedLeads = [];

      for (const lead of result.leads) {
        try {
          // Verificar si ya existe
          const existingLead = await Lead.findOne({
            $or: [
              { placeId: lead.placeId },
              { website: lead.website },
              { name: lead.name, address: lead.address }
            ].filter(condition => {
              const values = Object.values(condition);
              return values.length > 0 && values.every(v => v);
            })
          });

          if (existingLead) {
            console.log(`⚠️ Lead ya existe: ${lead.name}`);
            skippedLeads.push({ name: lead.name, reason: 'Duplicado' });
            continue;
          }

          // Crear nuevo lead
          const newLead = await Lead.create({
            ...lead,
            source: 'google_maps',
            searchQuery: `${query} ${location}`,
            status: 'new',
            createdAt: new Date()
          });

          savedLeads.push(newLead);
          console.log(`✅ Lead guardado: ${newLead.name}`);

        } catch (error) {
          console.error(`❌ Error guardando ${lead.name}:`, error.message);
          skippedLeads.push({ name: lead.name, reason: error.message });
        }
      }

      console.log(`\n📊 Guardados: ${savedLeads.length}/${result.leads.length}`);

      return NextResponse.json({
        success: true,
        leads: savedLeads,
        stats: {
          ...result.stats,
          saved: savedLeads.length,
          skipped: skippedLeads.length
        },
        skippedLeads
      });
    }

    // Retornar sin guardar (preview mode)
    return NextResponse.json({
      success: true,
      leads: result.leads,
      stats: result.stats
    });

  } catch (error) {
    console.error('❌ Error en multi-search:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
