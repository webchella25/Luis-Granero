// src/app/api/public/blog/[slug]/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'

export async function GET(request, { params }) {
  try {
    await dbConnect()

    const { slug } = params

    // Buscar post por slug
    const post = await BlogPost.findOne({
      slug,
      status: 'published'
    }).lean()

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Incrementar views (opcional)
    await BlogPost.findByIdAndUpdate(post._id, {
      $inc: { views: 1 }
    })
    
    return NextResponse.json(post, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
    
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}