// src/app/api/admin/projects/route.js - ACTUALIZADO
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

// GET - Listar todos los proyectos (admin)
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    
    const filter = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    
    const projects = await Project.find(filter)
      .sort({ orderIndex: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({ 
      success: true, 
      projects,
      count: projects.length 
    });
    
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

// POST - Crear nuevo proyecto
export async function POST(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    console.log('📝 Datos recibidos para crear proyecto:', {
      title: data.title,
      slug: data.slug,
      imagesCount: data.images?.length || 0,
      images: data.images
    });
    
    // Validar campos requeridos
    if (!data.title || !data.slug || !data.description) {
      return NextResponse.json(
        { error: 'Campos requeridos: title, slug, description' }, 
        { status: 400 }
      );
    }
    
    // Verificar que el slug no exista
    const existingProject = await Project.findOne({ slug: data.slug });
    if (existingProject) {
      return NextResponse.json(
        { error: 'Ya existe un proyecto con ese slug' }, 
        { status: 400 }
      );
    }
    
    // 🔥 PREPARAR DATOS CON IMÁGENES
    const projectData = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      content: data.content || '',
      images: data.images || [], // 🔥 Array de URLs de Cloudinary
      image: data.images?.[0] || '', // Primera imagen para compatibilidad
      category: data.category || 'webapp',
      technologies: data.technologies || [],
      features: data.features || [],
      metrics: data.metrics || {},
      urls: data.urls || {},
      status: data.status || 'En producción',
      year: data.year || new Date().getFullYear(),
      isFeatured: data.isFeatured || false,
      isPublished: data.isPublished !== false, // Por defecto true
      isActive: data.isActive !== false, // Por defecto true
      client: data.client || {}
    };
    
    console.log('💾 Guardando proyecto en MongoDB:', {
      slug: projectData.slug,
      imagesCount: projectData.images.length,
      firstImage: projectData.images[0]
    });
    
    const project = await Project.create(projectData);
    
    console.log('✅ Proyecto creado exitosamente:', {
      _id: project._id,
      slug: project.slug,
      imagesInDB: project.images.length
    });
    
    return NextResponse.json({ 
      success: true, 
      project,
      message: 'Proyecto creado exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating project:', error);
    
    // Error de duplicado
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Ya existe un proyecto con ese slug' }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error creando proyecto',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}