// src/app/api/leads/[id]/route.js - VERSIÓN COMPLETA
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';

// GET - Obtener un lead específico
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const lead = await Lead.findById(params.id);
    
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar un lead
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    
    const updates = await request.json();
    
    // Actualizar fecha de modificación
    updates.updatedAt = new Date();
    
    // Si viene $push (para historial), manejarlo separado
    const pushOperations = updates.$push;
    delete updates.$push;
    
    // Construir el objeto de actualización
    const updateOperation = { $set: updates };
    
    if (pushOperations) {
      updateOperation.$push = pushOperations;
    }
    
    const lead = await Lead.findByIdAndUpdate(
      params.id,
      updateOperation,
      { new: true, runValidators: true }
    );
    
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un lead
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const lead = await Lead.findByIdAndDelete(params.id);
    
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Lead eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}