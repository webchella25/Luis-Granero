import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { leads } = await request.json();
    
    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: 'No hay leads para importar' },
        { status: 400 }
      );
    }

    if (leads.length > 100) {
      return NextResponse.json(
        { error: 'Máximo 100 leads por importación' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    console.log(`📥 Importando ${leads.length} leads...`);
    
    const imported = [];
    const skipped = [];
    
    for (const leadData of leads) {
      try {
        // ✅ VERIFICACIÓN MEJORADA: por username (Instagram) o placeId/website
        const queryConditions = [];
        
        if (leadData.placeId) {
          queryConditions.push({ placeId: leadData.placeId });
        }
        
        if (leadData.website) {
          queryConditions.push({ website: leadData.website });
        }
        
        // ✅ NUEVO: Verificar por username (Instagram)
        if (leadData.username && leadData.source === 'instagram') {
          queryConditions.push({ 
            username: leadData.username,
            source: 'instagram' 
          });
        }
        
        let existingLead = null;
        if (queryConditions.length > 0) {
          existingLead = await Lead.findOne({ $or: queryConditions });
        }
        
        if (existingLead) {
          console.log(`⚠️ Lead ya existe: ${leadData.name}`);
          skipped.push({
            name: leadData.name,
            reason: 'Ya existe en la base de datos'
          });
          continue;
        }
        
        // ✅ CREAR LEAD CON TODOS LOS CAMPOS (incluyendo Instagram)
        const newLead = await Lead.create({
          // Información básica
          name: leadData.name,
          address: leadData.address || null,
          phone: leadData.phone || null,
          website: leadData.website || null,
          
          // ✅ CAMPOS DE INSTAGRAM (NUEVOS)
          username: leadData.username || null,
          bio: leadData.bio || null,
          followers: leadData.followers || null,
          posts: leadData.posts || null,
          isVerified: leadData.isVerified || false,
          profilePicUrl: leadData.profilePicUrl || null,
          
          // Google Maps/Search
          rating: leadData.rating || null,
          reviewCount: leadData.reviewCount || null,
          category: leadData.category || leadData.searchQuery,
          placeId: leadData.placeId || null,
          
          // Web analysis
          webAnalysis: leadData.webAnalysis || null,
          
          // Emails
          possibleEmails: leadData.possibleEmails || [],
          
          // Social media
          socialMedia: leadData.socialMedia || {},
          
          // Scoring
          opportunityScore: leadData.opportunityScore || 50,
          
          // SEO position (solo para Google Search)
          seoPosition: leadData.seoPosition || null,
          domain: leadData.domain || null,
          description: leadData.description || null,
          
          // Metadata
          status: 'new',
          source: leadData.source || 'manual',
          searchQuery: leadData.searchQuery || '',
          
          // Timestamps
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        imported.push(newLead);
        console.log(`✅ Lead importado: ${newLead.name} (${newLead.source})`);
        
      } catch (error) {
        console.error(`❌ Error importando ${leadData.name}:`, error);
        skipped.push({
          name: leadData.name,
          reason: error.message
        });
      }
    }
    
    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Importados: ${imported.length}`);
    console.log(`   ⚠️ Omitidos: ${skipped.length}`);
    
    return NextResponse.json({
      success: true,
      imported: imported.length,
      skipped: skipped.length,
      leads: imported,
      skippedDetails: skipped
    });
    
  } catch (error) {
    console.error('❌ Error en importación:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
