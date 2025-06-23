// src/app/api/public/blog/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Post from '@/models/Post'

export async function GET(request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit')) || 10
    const page = parseInt(searchParams.get('page')) || 1
    const skip = (page - 1) * limit

    // Filtros
    let filter = { isPublished: true }
    if (category && category !== 'all') {
      filter.category = category
    }

    // Obtener posts publicados
    const posts = await Post.find(filter)
      .select('title excerpt content category tags readTime publishDate views difficulty featured slug createdAt')
      .sort({ publishDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Contar total para paginación
    const total = await Post.countDocuments(filter)

    // Obtener categorías disponibles
    const categories = await Post.distinct('category', { isPublished: true })

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