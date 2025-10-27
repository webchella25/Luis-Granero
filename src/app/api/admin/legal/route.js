// src/app/api/admin/legal/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import LegalPage from '@/models/LegalPage';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    const pages = await LegalPage.find().sort({ pageType: 1 }).lean();
    
    return NextResponse.json({
      success: true,
      pages
    });
  } catch (error) {
    console.error('Error fetching legal pages:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    const data = await request.json();
    
    const page = new LegalPage(data);
    await page.save();
    
    return NextResponse.json({
      success: true,
      page,
      message: 'Página legal creada correctamente'
    });
  } catch (error) {
    console.error('Error creating legal page:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}