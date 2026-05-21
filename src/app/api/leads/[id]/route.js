import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { requireAdmin } from '@/lib/adminAuth';

// GET - Obtener un lead por ID
export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

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
    console.error('Error obteniendo lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar un lead
export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();
    
    const updates = await request.json();
    
    console.log(`📝 Actualizando lead ${params.id}:`, updates);
    
    // ✅ NORMALIZAR TELÉFONO
    // Si viene 'phone' en el update, convertirlo a phoneNumbers array
    if (updates.phone !== undefined) {
      if (updates.phone) {
        updates.phoneNumbers = [updates.phone];
      } else {
        updates.phoneNumbers = [];
      }
      delete updates.phone; // Eliminar phone para que no haya conflicto
    }
    
    // ✅ NORMALIZAR EMAIL
    // Si viene 'email' en el update, convertirlo a possibleEmails array
    if (updates.email !== undefined) {
      if (updates.email) {
        updates.possibleEmails = [updates.email];
      } else {
        updates.possibleEmails = [];
      }
      delete updates.email; // Eliminar email para que no haya conflicto
    }
    
    // Actualizar el lead
    const lead = await Lead.findByIdAndUpdate(
      params.id,
      {
        $set: updates,
        updatedAt: new Date()
      },
      { 
        new: true, // Retornar el documento actualizado
        runValidators: true // Ejecutar validaciones del schema
      }
    );
    
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }
    
    console.log(`✅ Lead actualizado: ${lead.name}`);
    
    return NextResponse.json({
      success: true,
      lead,
      message: 'Lead actualizado correctamente'
    });
    
  } catch (error) {
    console.error('❌ Error actualizando lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un lead
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();
    
    const lead = await Lead.findByIdAndDelete(params.id);
    
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }
    
    console.log(`🗑️ Lead eliminado: ${lead.name}`);
    
    return NextResponse.json({
      success: true,
      message: 'Lead eliminado correctamente'
    });
    
  } catch (error) {
    console.error('Error eliminando lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
