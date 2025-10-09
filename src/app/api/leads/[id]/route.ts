// src/app/api/leads/[id]/route.ts - CORREGIDO PARA NEXT.JS 15
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const updates = await request.json();
    
    await connectDB();
    
    const lead = await Lead.findByIdAndUpdate(
      id,
      { 
        ...updates,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!lead) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, lead });
    
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    
    await connectDB();
    
    const lead = await Lead.findByIdAndDelete(id);
    
    if (!lead) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Lead eliminado' });
    
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}