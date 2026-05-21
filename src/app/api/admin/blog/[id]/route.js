// src/app/api/admin/blog/[id]/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'

export async function GET(request, context) {
  try {
    const { id } = await context.params
    await dbConnect()

    const post = await BlogPost.findById(id)

    if (!post) {
      return NextResponse.json({ error: 'BlogPost not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, context) {
  try {
    const { id } = await context.params
    await dbConnect()

    const updates = await request.json()

    const post = await BlogPost.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    )

    if (!post) {
      return NextResponse.json({ error: 'BlogPost not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'BlogPost updated successfully', post })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, context) {
  try {
    const { id } = await context.params
    await dbConnect()

    const updates = await request.json()

    const post = await BlogPost.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    )

    if (!post) {
      return NextResponse.json({ error: 'BlogPost not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'BlogPost updated successfully', post })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params
    await dbConnect()

    const post = await BlogPost.findByIdAndDelete(id)

    if (!post) {
      return NextResponse.json({ error: 'BlogPost not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'BlogPost deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}