// src/app/api/admin/projects/route.js - ACTUALIZADO CON IMÁGENES
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
export async function GET() {
  try {
    
    await connectDB()
    
    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
    
    // Convertir ObjectId a strings
    const serializedProjects = projects.map(project => ({
      ...project,
      _id: project._id.toString()
    }))
    
    return NextResponse.json(serializedProjects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {

    
    await connectDB()
    
    const data = await request.json()
    
    // 🔥 LOG PARA DEBUG
    console.log('📝 Creando proyecto:', {
      title: data.title,
      slug: data.slug,
      imagesCount: data.images?.length || 0,
      hasImages: !!data.images
    })
    
    // 🔥 VALIDAR CAMPOS REQUERIDOS
    if (!data.title || !data.slug || !data.description) {
      return NextResponse.json(
        { error: 'Campos requeridos: title, slug, description' }, 
        { status: 400 }
      )
    }
    
    // 🔥 VERIFICAR SLUG ÚNICO
    const existingProject = await Project.findOne({ slug: data.slug })
    if (existingProject) {
      return NextResponse.json(
        { error: 'Ya existe un proyecto con ese slug' }, 
        { status: 400 }
      )
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
      isPublished: data.isPublished !== false,
      isActive: data.isActive !== false,
      client: data.client || {}
    }
    
    console.log('💾 Guardando en MongoDB:', {
      slug: projectData.slug,
      images: projectData.images.length,
      firstImage: projectData.images[0]?.substring(0, 50) + '...'
    })
    
    const project = await Project.create(projectData)
    
    console.log('✅ Proyecto creado:', {
      _id: project._id.toString(),
      slug: project.slug,
      imagesInDB: project.images?.length || 0
    })
    
    return NextResponse.json({ 
      success: true,
      project: {
        ...project.toObject(),
        _id: project._id.toString()
      },
      message: 'Proyecto creado exitosamente'
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error creating project:', error)
    
    // Error de slug duplicado
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Ya existe un proyecto con ese slug' }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json({ 
      error: 'Error creando proyecto',
      details: error.message 
    }, { status: 500 })
  }
}