// src/app/api/templates/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Template from '@/models/Template';

// GET - Listar todos los templates
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    const filter = type ? { type, isActive: true } : { isActive: true };
    const templates = await Template.find(filter).sort({ type: 1, name: 1 });
    
    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo template
export async function POST(request) {
  try {
    await dbConnect();
    
    const data = await request.json();
    const template = await Template.create(data);
    
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