// src/app/api/public/packages/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Package from '@/models/Package';
import Addon from '@/models/Addon';

export async function GET() {
  try {
    await dbConnect();
    
    const packages = await Package.find({ isActive: true })
      .sort({ orderIndex: 1, createdAt: 1 });
    
    const addons = await Addon.find({ isActive: true })
      .sort({ category: 1, orderIndex: 1 });
    
    return NextResponse.json({
      packages,
      addons
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
    
  } catch (error) {
    console.error('Error fetching public packages:', error);
    
    // Fallback a datos por defecto
    const defaultPackages = [
      {
        name: "Starter",
        description: "Perfecto para freelancers y pequeños negocios",
        price: "1,500€",
        duration: "2-3 semanas",
        color: "from-cyan-400 to-blue-500",
        popular: false,
        features: [
          "Landing page moderna",
          "Diseño responsive",
          "Formulario de contacto",
          "SEO básico",
          "Analytics integrado",
          "1 mes de soporte"
        ],
        technologies: ["Next.js", "Tailwind CSS", "Vercel"],
        ideal: "Freelancers, consultores, pequeños servicios"
      }
    ];
    
    return NextResponse.json({
      packages: defaultPackages,
      addons: []
    });
  }
}