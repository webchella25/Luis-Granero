// src/app/api/templates/route.js - VERSIÓN ACTUALIZADA
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Template from '@/models/Template';
import MessageTemplate from '@/models/MessageTemplate';
import { requireAdmin } from '@/lib/adminAuth';

// ✅ GET - Obtener templates
export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const targetSource = searchParams.get('targetSource');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    // Determinar si es para templates normales o MessageTemplates (Instagram)
    const isMessageTemplate = searchParams.get('forMessages') === 'true' || 
                             category || 
                             targetSource;
    
    if (isMessageTemplate) {
      // ✅ NUEVA LÓGICA: Templates de mensajes para Instagram
      const filter = {};
      if (category) filter.category = category;
      if (targetSource && targetSource !== 'all') {
        filter.targetSource = { $in: [targetSource, 'all'] };
      }
      if (activeOnly) filter.isActive = true;
      
      const templates = await MessageTemplate.find(filter)
        .sort({ category: 1, name: 1 });
      
      return NextResponse.json({
        success: true,
        templates,
        total: templates.length
      });
    } else {
      // ✅ LÓGICA ORIGINAL: Templates normales (emails, etc.)
      const filter = type ? { type, isActive: true } : { isActive: true };
      const templates = await Template.find(filter).sort({ type: 1, name: 1 });
      
      return NextResponse.json({
        success: true,
        templates
      });
    }
  } catch (error) {
    console.error('❌ Error obteniendo templates:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ POST - Crear template
export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();
    
    const data = await request.json();
    
    // Determinar si es MessageTemplate (Instagram) o Template normal
    const isMessageTemplate = data.category || data.targetSource || data.message;
    
    if (isMessageTemplate) {
      // ✅ NUEVA LÓGICA: Crear MessageTemplate para Instagram
      
      // Validaciones
      if (!data.name || !data.message) {
        return NextResponse.json({ 
          success: false,
          error: 'Nombre y mensaje son requeridos' 
        }, { status: 400 });
      }
      
      // Verificar si ya existe
      const existing = await MessageTemplate.findOne({ name: data.name });
      if (existing) {
        return NextResponse.json({ 
          success: false,
          error: 'Ya existe una plantilla con ese nombre' 
        }, { status: 400 });
      }
      
      // Extraer variables del mensaje
      const variableRegex = /\{([^}]+)\}/g;
      const matches = data.message.match(variableRegex) || [];
      const availableVariables = [...new Set(
        matches.map(match => match.replace(/[{}]/g, ''))
      )];
      
      const template = await MessageTemplate.create({
        name: data.name,
        description: data.description || '',
        subject: data.subject || '',
        message: data.message,
        category: data.category || 'presentacion',
        targetSource: data.targetSource || 'all',
        isActive: data.isActive !== undefined ? data.isActive : true,
        availableVariables
      });
      
      return NextResponse.json({
        success: true,
        template,
        message: 'Plantilla de mensaje creada exitosamente'
      }, { status: 201 });
      
    } else {
      // ✅ LÓGICA ORIGINAL: Crear Template normal
      const template = await Template.create(data);
      
      return NextResponse.json({
        success: true,
        template
      });
    }
  } catch (error) {
    console.error('❌ Error creando template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
