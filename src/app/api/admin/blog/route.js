// src/app/api/admin/blog/route.js
import { NextResponse } from 'next/server'
import { checkAuth } from '@/lib/checkAuth'
import dbConnect from '@/lib/mongodb'
import Post from '@/models/Post'

export async function GET() {
  try {
    await dbConnect()
    
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .lean()
    
    return NextResponse.json({ posts })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await checkAuth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const data = await request.json()
    
    const post = new Post(data)
    await post.save()
    
    return NextResponse.json({ message: 'Post created successfully', post })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}