// src/app/api/admin/projects/[slug]/route.js - ACTUALIZADO CON IMÁGENES
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await connectDB()
    
    const project = await Project.findOne({ slug: params.slug }).lean()
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    // 🔥 LOG PARA DEBUG
    console.log('📖 Proyecto cargado:', {
      slug: project.slug,
      imagesCount: project.images?.length || 0,
      hasImages: !!project.images
    })
    
    // Convertir _id a string
    return NextResponse.json({
      ...project,
      _id: project._id.toString()
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await connectDB()
    
    const data = await request.json()
    
    // 🔥 LOG PARA DEBUG
    console.log('📝 Actualizando proyecto:', {
      slug: params.slug,
      imagesCount: data.images?.length || 0,
      hasImages: !!data.images
    })
    
    // 🔥 PREPARAR DATOS CON IMÁGENES
    const updateData = {
      title: data.title,
      description: data.description,
      content: data.content || '',
      images: data.images || [], // 🔥 Array de URLs de Cloudinary
      image: data.images?.[0] || data.image || '', // Primera imagen para compatibilidad
      category: data.category,
      technologies: data.technologies || [],
      features: data.features || [],
      metrics: data.metrics || {},
      urls: data.urls || {},
      status: data.status,
      year: data.year,
      isFeatured: data.isFeatured || false,
      isPublished: data.isPublished !== false,
      isActive: data.isActive !== false,
      client: data.client || {},
      updatedAt: new Date()
    }
    
    // 🔥 Si se cambió el slug, verificar que no exista
    if (data.slug && data.slug !== params.slug) {
      const existingProject = await Project.findOne({ slug: data.slug })
      if (existingProject) {
        return NextResponse.json(
          { error: 'Ya existe un proyecto con ese slug' }, 
          { status: 400 }
        )
      }
      updateData.slug = data.slug
    }
    
    const project = await Project.findOneAndUpdate(
      { slug: params.slug },
      updateData,
      { new: true, runValidators: true }
    ).lean()
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    // 🔥 LOG SUCCESS
    console.log('✅ Proyecto actualizado:', {
      _id: project._id.toString(),
      slug: project.slug,
      imagesInDB: project.images?.length || 0
    })
    
    return NextResponse.json({ 
      success: true, 
      project: {
        ...project,
        _id: project._id.toString()
      },
      message: 'Proyecto actualizado exitosamente'
    })
  } catch (error) {
    console.error('❌ Error updating project:', error)
    
    // Error de slug duplicado
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Ya existe un proyecto con ese slug' }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json({ 
      error: 'Error actualizando proyecto',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await connectDB()
    
    // 🔥 OPCIÓN: Soft delete (recomendado) - Comentar la línea de abajo si prefieres hard delete
    // const project = await Project.findOneAndUpdate(
    //   { slug: params.slug },
    //   { 
    //     isActive: false,
    //     isPublished: false,
    //     deletedAt: new Date() 
    //   },
    //   { new: true }
    // )
    
    // 🔥 Hard delete (eliminar permanentemente)
    const project = await Project.findOneAndDelete({ slug: params.slug })
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    console.log('🗑️ Proyecto eliminado:', params.slug)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}