// src/app/api/public/blog/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit')) || 10
    const page = parseInt(searchParams.get('page')) || 1
    const skip = (page - 1) * limit

    // Filtros
    let filter = { status: 'published' }
    if (category && category !== 'all') {
      filter.category = category
    }

    // Obtener posts publicados
    const posts = await BlogPost.find(filter)
      .select('title excerpt content category tags readTime views featured slug createdAt featuredImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Contar total para paginación
    const total = await BlogPost.countDocuments(filter)

    // Obtener categorías disponibles
    const categories = await BlogPost.distinct('category', { status: 'published' })

    return NextResponse.json({
      posts,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      },
      categories,
      total
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    })
    
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    
    // Fallback con posts de ejemplo
    return NextResponse.json({
      posts: [],
      pagination: { current: 1, total: 1, hasNext: false, hasPrev: false },
      categories: ['React', 'Next.js', 'Performance', 'SEO'],
      total: 0
    })
  }
}