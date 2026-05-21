// src/app/api/admin/learning-paths/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import LearningPath from '@/models/LearningPath'

export async function GET() {
  try {
    await dbConnect()
    
    const paths = await LearningPath.find()
      .populate('articles.postId', 'title slug publishDate')
      .sort({ createdAt: -1 })
      .lean()
    
    return NextResponse.json({ paths })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {


    await dbConnect()
    
    const data = await request.json()
    
    const learningPath = new LearningPath(data)
    await learningPath.save()
    
    return NextResponse.json({ 
      message: 'Learning path created successfully', 
      path: learningPath 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}