// src/app/api/admin/categories/route.js - Versión con debug
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import Category from '@/models/Category'
import Post from '@/models/Post'

export async function POST(request) {
  try {
    console.log('=== CREATING CATEGORY ===')
    
    const session = await getServerSession()
    console.log('Session:', !!session)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    console.log('DB connected')
    
    const { name, description, color, icon } = await request.json()
    console.log('Data received:', { name, description, color, icon })
    
    // Verificar si ya existe
    const existingCategory = await Category.findOne({ name })
    console.log('Existing category:', !!existingCategory)
    
    if (existingCategory) {
      return NextResponse.json({ 
        error: `La categoría "${name}" ya existe` 
      }, { status: 400 })
    }
    
    const category = new Category({
      name,
      description,
      color,
      icon
    })
    
    console.log('Category to save:', category)
    await category.save()
    console.log('Category saved successfully')
    
    return NextResponse.json({ 
      message: 'Category created successfully', 
      category 
    })
  } catch (error) {
    console.error('=== CATEGORY ERROR ===', error)
    return NextResponse.json({ 
      error: `Error creating category: ${error.message}` 
    }, { status: 500 })
  }
}