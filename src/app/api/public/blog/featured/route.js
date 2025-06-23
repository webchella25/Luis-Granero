// src/app/api/public/blog/featured/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Post from '@/models/Post'

export async function GET() {
  try {
    await dbConnect()
    
    // Obtener post destacado más reciente
    const featuredPost = await Post.findOne({ 
      isPublished: true,
      featured: true 
    })
    .select('title excerpt content category tags readTime publishDate views difficulty slug')
    .sort({ publishDate: -1, createdAt: -1 })
    .lean()

    if (!featuredPost) {
      // Si no hay destacado, obtener el más reciente
      const latestPost = await Post.findOne({ isPublished: true })
        .select('title excerpt content category tags readTime publishDate views difficulty slug')
        .sort({ publishDate: -1, createdAt: -1 })
        .lean()

      return NextResponse.json(latestPost || null)
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