// src/app/api/admin/blog/categories/route.js - VERSIÓN CORREGIDA
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'

// Definir el schema de Category directamente aquí
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  color: {
    type: String,
    default: '#3B82F6'
  },
  icon: String,
  isActive: {
    type: Boolean,
    default: true
  },
  postCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Crear o reutilizar el modelo
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    // Obtener categorías existentes
    let categories = await Category.find({ isActive: true }).sort({ name: 1 })
    
    // Si no hay categorías, crear las por defecto
    if (categories.length === 0) {
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

      categories = await Category.insertMany(defaultCategories)
      console.log('✅ Categorías por defecto creadas')
    }
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { name, description, color, icon } = await request.json()
    
    // Crear slug a partir del nombre
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    const category = await Category.create({
      name,
      slug,
      description,
      color: color || '#3B82F6',
      icon: icon || '📁'
    })
    
    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}