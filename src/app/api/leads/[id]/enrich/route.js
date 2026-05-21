// src/app/api/leads/[id]/enrich/route.js
import { NextResponse, after } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { masterEnrichLead } from '@/lib/scraper/masterLeadEnrichment';
import { requireAdmin } from '@/lib/adminAuth';

/**
 * POST /api/leads/[id]/enrich
 * Inicia enrichment en background y devuelve 202 inmediatamente.
 * El cliente debe hacer polling a GET /api/leads/[id] para ver enrichmentStatus.
 */
export async function POST(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead no encontrado' }, { status: 404 });
    }

    // Marcar como procesando
    lead.enrichmentStatus = 'processing';
    await lead.save();

    console.log(`\n🚀 Enrichment iniciado en background: ${lead.name}`);

    const leadData = {
      name: lead.name,
      website: lead.website,
      placeId: lead.placeId,
      category: lead.category,
      address: lead.address,
      phone: lead.phoneNumbers?.[0] || lead.phone || null,
      email: lead.email,
      rating: lead.rating,
      reviewCount: lead.reviewCount,
      socialMedia: lead.socialMedia,
      socialMediaBlocked: lead.socialMediaBlocked || []
    };

    const options = {
      includeWebAnalysis: body.includeWebAnalysis !== false,
      includeEmailFinding: body.includeEmailFinding !== false,
      includeReviews: body.includeReviews !== false,
      includeCompetition: body.includeCompetition === true,
      includeSocialMedia: body.includeSocialMedia !== false,
      includeHiringActivity: body.includeHiringActivity === true
    };

    // Procesar en background DESPUÉS de enviar la respuesta 202
    after(async () => {
      try {
        await connectDB();

        const enrichment = await masterEnrichLead(leadData, options);

        const updatedLead = await Lead.findById(id);
        if (!updatedLead) return;

        updatedLead.enrichment = enrichment;
        updatedLead.enrichmentStatus = 'done';
        updatedLead.opportunityScore = enrichment.finalScore;

        if (enrichment.emails?.verified?.length > 0) {
          updatedLead.possibleEmails = enrichment.emails.verified;
          if (enrichment.emails.personal?.length > 0 && !updatedLead.email) {
            updatedLead.email = enrichment.emails.personal[0];
          }
        }

        if (enrichment.website) {
          updatedLead.webAnalysis = {
            score: enrichment.website.finalScore,
            opportunityLevel: enrichment.website.opportunityLevel,
            issues: enrichment.website.issues?.slice(0, 10).map(i =>
              typeof i === 'string' ? i : i.message || JSON.stringify(i)
            ) || [],
            analyzedAt: new Date()
          };
        }

        // Persistir URLs de redes sociales descubiertas en este run via SerpApi
        const foundFacebookUrl = enrichment.socialMedia?.facebook?.foundUrl;
        const foundInstagramUrl = enrichment.socialMedia?.instagram?.foundUrl;

        if (foundFacebookUrl || foundInstagramUrl) {
          if (!updatedLead.socialMedia) updatedLead.socialMedia = {};
          if (foundFacebookUrl) {
            updatedLead.socialMedia.facebook = foundFacebookUrl;
            console.log(`💾 URL de Facebook guardada: ${foundFacebookUrl}`);
          }
          if (foundInstagramUrl) {
            updatedLead.socialMedia.instagram = foundInstagramUrl;
            console.log(`💾 URL de Instagram guardada: ${foundInstagramUrl}`);
          }
          updatedLead.markModified('socialMedia');
        }

        // Persistir teléfono encontrado en bio de Instagram si el lead no tenía
        if (enrichment.phoneFromInstagram && !updatedLead.phone) {
          updatedLead.phone = enrichment.phoneFromInstagram;
          console.log(`💾 Teléfono de Instagram guardado: ${enrichment.phoneFromInstagram}`);
        }

        updatedLead.markModified('enrichment');
        await updatedLead.save();

        console.log(`✅ Enrichment completado: ${leadData.name} — Score: ${enrichment.finalScore}`);

      } catch (err) {
        console.error('❌ Error en enrichment background:', err.message);
        try {
          await connectDB();
          await Lead.findByIdAndUpdate(id, { enrichmentStatus: 'error' });
        } catch {}
      }
    });

    return NextResponse.json({
      success: true,
      status: 'processing',
      message: 'Enrichment iniciado. Los datos se actualizarán en breve.'
    }, { status: 202 });

  } catch (error) {
    console.error('❌ Error iniciando enrichment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
