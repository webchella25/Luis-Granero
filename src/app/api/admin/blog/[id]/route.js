// src/app/api/admin/blog/[id]/route.js
import { NextResponse } from 'next/server'
import { checkAuth } from '@/lib/checkAuth'
import dbConnect from '@/lib/mongodb'
import Post from '@/models/Post'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const post = await Post.findById(params.id)
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ✅ Agregar PUT además de PATCH
export async function PUT(request, { params }) {
  try {
    const session = await checkAuth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const updates = await request.json()
    
    const post = await Post.findByIdAndUpdate(
      params.id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    )
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Post updated successfully', post })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await checkAuth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const updates = await request.json()
    
    const post = await Post.findByIdAndUpdate(
      params.id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    )
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Post updated successfully', post })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await checkAuth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const post = await Post.findByIdAndDelete(params.id)
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}