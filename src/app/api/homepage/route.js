// src/app/api/homepage/route.js
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';
import Service from '@/models/Service';
import TechStack from '@/models/TechStack';
import Project from '@/models/Project';
import Testimonial from '@/models/Testimonial';

export async function GET() {
  try {
    await connectDB();

    // Obtener configuración
    const configs = await SiteConfig.find({ 
      category: { $in: ['homepage', 'general', 'contact'] } 
    }).lean();
    
    const configObj = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {});

    // Obtener servicios activos
    const services = await Service.find({ isActive: true })
      .sort({ orderIndex: 1 })
      .lean();

    // Obtener tech stack
    const techStack = await TechStack.find({ isActive: true })
      .sort({ orderIndex: 1 })
      .lean();

    // Obtener proyectos destacados
    const projects = await Project.find({ 
      isFeatured: true, 
      isActive: true 
    })
    .sort({ orderIndex: 1 })
    .limit(3)
    .lean();

    // Obtener testimonios
    const testimonials = await Testimonial.find({ 
      isActive: true,
      isFeatured: true 
    })
    .sort({ orderIndex: 1 })
    .limit(4)
    .lean();

    return Response.json({
      config: configObj,
      services,
      techStack,
      projects,
      testimonials
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });

  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT para actualizar configuración
export async function PUT(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Actualizar múltiples configuraciones
    const updatePromises = Object.entries(data).map(([key, value]) => 
      SiteConfig.findOneAndUpdate(
        { key },
        { key, value, updatedAt: new Date() },
        { upsert: true, new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    return Response.json({ success: true, message: 'Configuración actualizada' });
  } catch (error) {
    return Response.json({ error: 'Error actualizando configuración' }, { status: 500 });
  }
}