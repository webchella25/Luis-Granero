// src/app/api/admin/learning-paths/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import LearningPath from '@/models/LearningPath'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const path = await LearningPath.findById(id)
      .populate('articles.postId', 'title slug publishDate excerpt')
      .lean()
    
    if (!path) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 })
    }
    
    return NextResponse.json({ path })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { id } = params
    const data = await request.json()
    
    const path = await LearningPath.findByIdAndUpdate(id, data, { new: true })
    
    if (!path) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: 'Learning path updated successfully', 
      path 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { id } = params
    
    await LearningPath.findByIdAndDelete(id)
    
    return NextResponse.json({ message: 'Learning path deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { id } = params
    const updates = await request.json()
    
    const path = await LearningPath.findByIdAndUpdate(id, updates, { new: true })
    
    if (!path) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: 'Learning path updated successfully', 
      path 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}