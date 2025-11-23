// src/app/api/admin/blog/categories/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Category from '@/models/Category'

const defaultCategories = [
  {
    name: 'Desarrollo Web',
    slug: 'desarrollo-web',
    description: 'Artículos sobre desarrollo web moderno',
    color: '#3B82F6',
    icon: '💻'
  },
  {
    name: 'React & Next.js',
    slug: 'react-nextjs',
    description: 'Tutoriales de React y Next.js',
    color: '#06B6D4',
    icon: '⚛️'
  },
  {
    name: 'JavaScript',
    slug: 'javascript',
    description: 'Conceptos y técnicas de JavaScript',
    color: '#F59E0B',
    icon: '🟨'
  },
  {
    name: 'TypeScript',
    slug: 'typescript',
    description: 'Guías de TypeScript',
    color: '#3178C6',
    icon: '🔷'
  },
  {
    name: 'Performance',
    slug: 'performance',
    description: 'Optimización y rendimiento web',
    color: '#10B981',
    icon: '⚡'
  },
  {
    name: 'SEO',
    slug: 'seo',
    description: 'SEO técnico y optimización',
    color: '#8B5CF6',
    icon: '🔍'
  },
  {
    name: 'Tutoriales',
    slug: 'tutoriales',
    description: 'Guías paso a paso',
    color: '#EF4444',
    icon: '📚'
  }
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      )
    }

    await dbConnect()
    
    let categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean()
    
    if (categories.length === 0) {
      categories = await Category.insertMany(defaultCategories)
      console.log('✅ Categorías por defecto creadas')
    }
    
    return NextResponse.json(categories)
    
  } catch (error) {
    console.error('❌ Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      )
    }

    await dbConnect()
    
    const data = await request.json()
    const { name, description, color, icon } = data
    
    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' }, 
        { status: 400 }
      )
    }
    
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    const existing = await Category.findOne({ slug })
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' }, 
        { status: 400 }
      )
    }
    
    const category = await Category.create({
      name,
      slug,
      description: description || '',
      color: color || '#3B82F6',
      icon: icon || '📁'
    })
    
    return NextResponse.json({ 
      success: true, 
      category 
    })
    
  } catch (error) {
    console.error('❌ Error creating category:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}