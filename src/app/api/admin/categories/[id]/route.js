// src/app/api/admin/categories/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import Category from '@/models/Category'
import Post from '@/models/Post'

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { id } = params
    const { name, description, color, icon } = await request.json()
    
    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, color, icon },
      { new: true }
    )
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: 'Category updated successfully', 
      category 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { id } = params
    
    // Verificar si hay posts usando esta categoría
    const postsCount = await Post.countDocuments({ category: { $exists: true } })
    
    if (postsCount > 0) {
      // En lugar de eliminar, desactivar
      const category = await Category.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      )
      
      return NextResponse.json({ 
        message: 'Category deactivated (has posts)', 
        category 
      })
    }
    
    // Si no hay posts, eliminar completamente
    await Category.findByIdAndDelete(id)
    
    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}