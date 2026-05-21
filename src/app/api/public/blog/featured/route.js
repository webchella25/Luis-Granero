// src/app/api/public/blog/featured/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'

export async function GET() {
  try {
    await dbConnect()

    // Obtener post destacado más reciente (simplemente el más reciente publicado)
    const featuredPost = await BlogPost.findOne({
      status: 'published'
    })
    .select('title excerpt content category tags readTime views slug createdAt')
    .sort({ createdAt: -1 })
    .lean()

    if (!featuredPost) {
      return NextResponse.json(null)
    }
    
    return NextResponse.json(featuredPost, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    })
    
  } catch (error) {
    console.error('Error fetching featured post:', error)
    return NextResponse.json(null)
  }
}