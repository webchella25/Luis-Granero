// src/app/api/templates/[id]/route.js - VERSIÓN ACTUALIZADA
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Template from '@/models/Template';
import MessageTemplate from '@/models/MessageTemplate';
import { requireAdmin } from '@/lib/adminAuth';

// Helper para determinar qué modelo usar
async function getTemplateModel(id) {
  try {
    // Intentar buscar primero en MessageTemplate (por _id de MongoDB)
    const messageTemplate = await MessageTemplate.findById(id);
    if (messageTemplate) {
      return { template: messageTemplate, model: MessageTemplate, isMessage: true };
    }
  } catch (e) {
    // Si falla, puede que no sea un ObjectId válido
  }
  
  // Buscar en Template (por campo id)
  const template = await Template.findOne({ id });
  if (template) {
    return { template, model: Template, isMessage: false };
  }
  
  return { template: null, model: null, isMessage: false };
}

// ✅ GET - Obtener template específico
export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();
    
    const { template, isMessage } = await getTemplateModel(params.id);
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      template,
      type: isMessage ? 'message' : 'normal'
    });
  } catch (error) {
    console.error('❌ Error obteniendo template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ PATCH/PUT - Actualizar template
export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();
    
    const updates = await request.json();
    updates.updatedAt = new Date();
    
    const { model, isMessage } = await getTemplateModel(params.id);
    
    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Template no encontrado' },
        { status: 404 }
      );
    }
    
    let template;
    
    if (isMessage) {
      // ✅ NUEVA LÓGICA: Actualizar MessageTemplate
      
      // Si se actualiza el mensaje, recalcular variables
      if (updates.message) {
        const variableRegex = /\{([^}]+)\}/g;
        const matches = updates.message.match(variableRegex) || [];
        updates.availableVariables = [...new Set(
          matches.map(match => match.replace(/[{}]/g, ''))
        )];
      }
      
      template = await MessageTemplate.findByIdAndUpdate(
        params.id,
        updates,
        { new: true, runValidators: true }
      );
    } else {
      // ✅ LÓGICA ORIGINAL: Actualizar Template normal
      template = await Template.findOneAndUpdate(
        { id: params.id },
        updates,
        { new: true }
      );
    }
    
    return NextResponse.json({
      success: true,
      template,
      message: 'Template actualizado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error actualizando template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Alias PUT para PATCH
export async function PUT(request, { params }) {
  return PATCH(request, { params });
}

// ✅ DELETE - Eliminar template
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';
    
    const { model, isMessage } = await getTemplateModel(params.id);
    
    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Template no encontrado' },
        { status: 404 }
      );
    }
    
    if (hardDelete) {
      // ✅ ELIMINACIÓN PERMANENTE (para MessageTemplates)
      if (isMessage) {
        await MessageTemplate.findByIdAndDelete(params.id);
      } else {
        await Template.findOneAndDelete({ id: params.id });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Template eliminado permanentemente'
      });
    } else {
      // ✅ SOFT DELETE (desactivar)
      if (isMessage) {
        await MessageTemplate.findByIdAndUpdate(
          params.id,
          { isActive: false }
        );
      } else {
        await Template.findOneAndUpdate(
          { id: params.id },
          { isActive: false }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Template desactivado'
      });
    }
  } catch (error) {
    console.error('❌ Error eliminando template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
