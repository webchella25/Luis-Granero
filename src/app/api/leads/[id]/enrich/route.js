// src/app/api/leads/[id]/enrich/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { masterEnrichLead } from '@/lib/scraper/masterLeadEnrichment';

/**
 * POST /api/leads/[id]/enrich
 * Ejecuta master enrichment en un lead específico
 */
export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();

    // Buscar el lead
    const lead = await Lead.findById(id);

    if (!lead) {
      return NextResponse.json({
        success: false,
        error: 'Lead no encontrado'
      }, { status: 404 });
    }

    console.log(`\n🚀 Ejecutando enrichment en lead: ${lead.name}`);

    // Preparar data para enrichment
    const leadData = {
      name: lead.name,
      website: lead.website,
      placeId: lead.placeId,
      category: lead.category,
      address: lead.address,
      phone: lead.phone,
      email: lead.email,
      rating: lead.rating,
      reviewCount: lead.reviewCount
    };

    // Ejecutar master enrichment
    const enrichment = await masterEnrichLead(leadData, {
      includeWebAnalysis: body.includeWebAnalysis !== false,
      includeEmailFinding: body.includeEmailFinding !== false,
      includeReviews: body.includeReviews !== false,
      includeCompetition: body.includeCompetition === true,
      includeSocialMedia: body.includeSocialMedia !== false,
      includeHiringActivity: body.includeHiringActivity === true
    });

    // Actualizar lead con enrichment data
    lead.enrichment = enrichment;
    lead.opportunityScore = enrichment.finalScore;

    // Si encontramos emails nuevos, actualizarlos
    if (enrichment.emails?.verified?.length > 0) {
      lead.possibleEmails = enrichment.emails.verified;

      // Si hay emails personales, usar el primero como email principal
      if (enrichment.emails.personal?.length > 0 && !lead.email) {
        lead.email = enrichment.emails.personal[0];
      }
    }

    // Actualizar webAnalysis si existe
    if (enrichment.website) {
      lead.webAnalysis = {
        score: enrichment.website.finalScore,
        opportunityLevel: enrichment.website.opportunityLevel,
        issues: enrichment.website.issues?.slice(0, 10) || [],
        analyzedAt: new Date()
      };
    }

    // Guardar
    await lead.save();

    console.log(`✅ Lead enriquecido exitosamente. Score: ${enrichment.finalScore}`);

    return NextResponse.json({
      success: true,
      enrichment,
      lead: {
        _id: lead._id,
        name: lead.name,
        opportunityScore: lead.opportunityScore
      }
    });

  } catch (error) {
    console.error('❌ Error en enrichment:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
