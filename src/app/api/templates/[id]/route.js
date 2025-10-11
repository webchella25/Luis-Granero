// src/app/api/templates/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Template from '@/models/Template';

// GET - Obtener template específico
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const template = await Template.findOne({ id: params.id });
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar template
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    
    const updates = await request.json();
    updates.updatedAt = new Date();
    
    const template = await Template.findOneAndUpdate(
      { id: params.id },
      updates,
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar template (soft delete)
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    await Template.findOneAndUpdate(
      { id: params.id },
      { isActive: false }
    );
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}