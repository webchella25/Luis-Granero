// src/app/api/admin/legal/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import LegalPage from '@/models/LegalPage';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    const page = await LegalPage.findById(params.id);
    
    if (!page) {
      return NextResponse.json(
        { error: 'Página no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      page
    });
  } catch (error) {
    console.error('Error fetching legal page:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    const data = await request.json();
    
    const page = await LegalPage.findByIdAndUpdate(
      params.id,
      { ...data, version: data.version + 1 },
      { new: true }
    );
    
    if (!page) {
      return NextResponse.json(
        { error: 'Página no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      page,
      message: 'Página actualizada correctamente'
    });
  } catch (error) {
    console.error('Error updating legal page:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    await LegalPage.findByIdAndDelete(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Página eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting legal page:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}