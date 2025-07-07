// src/app/api/public/packages/route.js (VERSIÓN CORREGIDA)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Package from '@/models/Package';
import Addon from '@/models/Addon';

export async function GET() {
  try {
    console.log('📡 API /api/public/packages llamada');
    await dbConnect();
    console.log('✅ Conectado a DB');
    
    const packages = await Package.find({ isActive: true })
      .sort({ orderIndex: 1, createdAt: 1 })
      .lean();
    
    const addons = await Addon.find({ isActive: true })
      .sort({ category: 1, orderIndex: 1 })
      .lean();
    
    console.log(`📦 Encontrados ${packages.length} paquetes y ${addons.length} addons`);
    console.log('Paquetes:', packages.map(p => ({ name: p.name, price: p.price })));
    
    return NextResponse.json({
      packages,
      addons
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    console.error('❌ Error fetching public packages:', error);
    
    return NextResponse.json({
      error: error.message,
      packages: [],
      addons: []
    }, { status: 500 });
  }
}