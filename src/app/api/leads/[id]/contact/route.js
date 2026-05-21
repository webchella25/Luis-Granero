// src/app/api/leads/[id]/contact/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import MessageTemplate from '@/models/MessageTemplate';
import { requireAdmin } from '@/lib/adminAuth';

// ✅ POST - Registrar contacto con un lead
export async function POST(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();
    
    const { id } = await params; // ⚠️ AÑADIR await
    const data = await request.json();
    
    console.log('📞 Registrando contacto con lead:', id);
    
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return NextResponse.json({ 
        success: false,
        error: 'Lead no encontrado' 
      }, { status: 404 });
    }
    
    // Crear registro de contacto
    const contactRecord = {
      date: new Date(),
      type: data.type || 'instagram_dm',
      channel: data.channel || 'instagram',
      subject: data.subject || 'Mensaje Instagram',
      notes: data.notes || '',
      outcome: data.outcome || 'follow_up',
      messageContent: data.messageContent || '',
      responded: false
    };
    
    // Si se usó una plantilla, registrarla
    if (data.templateId) {
      contactRecord.templateUsed = data.templateId;
      contactRecord.templateName = data.templateName;
      
      // Incrementar contador de uso de la plantilla
      await MessageTemplate.findByIdAndUpdate(
        data.templateId,
        { $inc: { usageCount: 1 } }
      );
      
      console.log('✅ Plantilla actualizada:', data.templateName);
    }
    
    // Añadir contacto al historial
    lead.contactHistory.push(contactRecord);
    
    // Actualizar estado del lead
    if (lead.status === 'new') {
      lead.status = 'contacted';
    }
    
    lead.lastContactedAt = new Date();
    
    await lead.save();
    
    console.log('✅ Contacto registrado para:', lead.name);
    
    return NextResponse.json({
      success: true,
      lead,
      message: 'Contacto registrado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error registrando contacto:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}

// ✅ GET - Obtener historial de contacto de un lead
export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();
    
    const { id } = await params; // ⚠️ AÑADIR await
    
    const lead = await Lead.findById(id)
      .populate('contactHistory.templateUsed', 'name category');
    
    if (!lead) {
      return NextResponse.json({ 
        success: false,
        error: 'Lead no encontrado' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      contactHistory: lead.contactHistory,
      total: lead.contactHistory.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}

// ✅ PATCH - Actualizar un contacto existente (marcar como respondido, etc.)
export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();
    
    const { id } = await params; // ⚠️ AÑADIR await
    const { contactId, updates } = await request.json();
    
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return NextResponse.json({ 
        success: false,
        error: 'Lead no encontrado' 
      }, { status: 404 });
    }
    
    const contact = lead.contactHistory.id(contactId);
    
    if (!contact) {
      return NextResponse.json({ 
        success: false,
        error: 'Contacto no encontrado' 
      }, { status: 404 });
    }
    
    // Actualizar campos del contacto
    Object.keys(updates).forEach(key => {
      contact[key] = updates[key];
    });
    
    await lead.save();
    
    return NextResponse.json({
      success: true,
      lead,
      message: 'Contacto actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error actualizando contacto:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}
