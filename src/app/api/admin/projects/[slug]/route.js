// src/app/api/admin/projects/[slug]/route.js - ACTUALIZADO
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

// GET - Obtener proyecto por slug (admin)
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const project = await Project.findOne({ slug: params.slug }).lean();
    
    if (!project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' }, 
        { status: 404 }
      );
    }
    
    console.log('📖 Proyecto cargado:', {
      slug: project.slug,
      imagesCount: project.images?.length || 0,
      images: project.images
    });
    
    return NextResponse.json({ 
      success: true, 
      project 
    });
    
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

// PUT - Actualizar proyecto
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    console.log('📝 Actualizando proyecto:', {
      slug: params.slug,
      imagesCount: data.images?.length || 0,
      images: data.images
    });
    
    // 🔥 PREPARAR DATOS ACTUALIZADOS
    const updateData = {
      title: data.title,
      description: data.description,
      content: data.content || '',
      images: data.images || [], // 🔥 Array de URLs
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
    };
    
    // Si se cambió el slug
    if (data.slug && data.slug !== params.slug) {
      // Verificar que el nuevo slug no exista
      const existingProject = await Project.findOne({ slug: data.slug });
      if (existingProject) {
        return NextResponse.json(
          { error: 'Ya existe un proyecto con ese slug' }, 
          { status: 400 }
        );
      }
      updateData.slug = data.slug;
    }
    
    const project = await Project.findOneAndUpdate(
      { slug: params.slug },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' }, 
        { status: 404 }
      );
    }
    
    console.log('✅ Proyecto actualizado:', {
      _id: project._id,
      slug: project.slug,
      imagesInDB: project.images?.length || 0
    });
    
    return NextResponse.json({ 
      success: true, 
      project,
      message: 'Proyecto actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error updating project:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Ya existe un proyecto con ese slug' }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error actualizando proyecto',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

// DELETE - Eliminar proyecto (soft delete)
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const project = await Project.findOneAndUpdate(
      { slug: params.slug },
      { 
        isActive: false,
        isPublished: false,
        deletedAt: new Date() 
      },
      { new: true }
    );
    
    if (!project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' }, 
        { status: 404 }
      );
    }
    
    console.log('🗑️ Proyecto eliminado (soft delete):', project.slug);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Proyecto eliminado correctamente' 
    });
    
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Error eliminando proyecto' }, 
      { status: 500 }
    );
  }
}