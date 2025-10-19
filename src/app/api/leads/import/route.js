import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';

export async function POST(request) {
  try {
    const { leads } = await request.json();
    
    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: 'No hay leads para importar' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    console.log(`📥 Importando ${leads.length} leads...`);
    
    const imported = [];
    const skipped = [];
    
    for (const leadData of leads) {
      try {
        // Construir condiciones de búsqueda dinámicamente
        const searchConditions = [];
        
        // Para Google Maps
        if (leadData.placeId) {
          searchConditions.push({ placeId: leadData.placeId });
        }
        
        // Para Google Search / webs generales
        if (leadData.website) {
          searchConditions.push({ website: leadData.website });
        }
        
        // Para Instagram (verificar por username + source)
        if (leadData.username && leadData.source === 'instagram') {
          searchConditions.push({ 
            username: leadData.username,
            source: 'instagram'
          });
        }
        
        // Para verificar por email o teléfono
        if (leadData.email) {
          searchConditions.push({ email: leadData.email });
        }
        
        if (leadData.phone) {
          searchConditions.push({ phone: leadData.phone });
        }
        
        // Solo buscar duplicados si hay condiciones válidas
        let existingLead = null;
        if (searchConditions.length > 0) {
          existingLead = await Lead.findOne({ $or: searchConditions });
        }
        
        if (existingLead) {
          console.log(`⚠️ Lead ya existe: ${leadData.name || leadData.username}`);
          skipped.push({
            name: leadData.name || leadData.username,
            reason: 'Ya existe en la base de datos'
          });
          continue;
        }
        
        // Crear nuevo lead
        const newLead = await Lead.create({
          // Datos básicos
          name: leadData.name,
          username: leadData.username || null,
          address: leadData.address || null,
          phone: leadData.phone || null,
          website: leadData.website || null,
          
          // Instagram específico
          bio: leadData.bio || '',
          followers: leadData.followers || 0,
          posts: leadData.posts || 0,
          isVerified: leadData.isVerified || false,
          profilePicUrl: leadData.profilePicUrl || null,
          
          // Google Maps/Search
          rating: leadData.rating || null,
          reviewCount: leadData.reviewCount || null,
          category: leadData.category || leadData.searchQuery,
          placeId: leadData.placeId || null,
          seoPosition: leadData.seoPosition || null,
          domain: leadData.domain || null,
          description: leadData.description || null,
          
          // Web analysis
          webAnalysis: leadData.webAnalysis || null,
          
          // Emails
          possibleEmails: leadData.possibleEmails || [],
          
          // Social media
          socialMedia: leadData.socialMedia || {},
          
          // Scoring
          opportunityScore: leadData.opportunityScore || 50,
          
          // Metadata
          status: 'new',
          source: leadData.source || 'manual',
          searchQuery: leadData.searchQuery || '',
          
          // Timestamps
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        imported.push(newLead);
        console.log(`✅ Lead importado: ${newLead.name || newLead.username} (@${newLead.username || 'N/A'})`);
        
      } catch (error) {
        console.error(`❌ Error importando ${leadData.name || leadData.username}:`, error);
        skipped.push({
          name: leadData.name || leadData.username,
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