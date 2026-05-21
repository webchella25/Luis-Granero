// src/app/api/admin/blog/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'

export async function GET() {
  try {
    await dbConnect()

    const posts = await BlogPost.find()
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('❌ Admin Blog GET error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {

    await dbConnect()

    const data = await request.json()

    const post = new BlogPost(data)
    await post.save()

    return NextResponse.json({ message: 'Post created successfully', post })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}