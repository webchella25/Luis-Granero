// src/app/api/admin/legal/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LegalPage from '@/models/LegalPage';

export async function GET() {
  try {
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