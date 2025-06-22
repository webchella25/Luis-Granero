// src/app/api/admin/pages/homepage/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import Page from '@/models/Page'

export async function GET() {
  try {
    await dbConnect()
    
    const homepage = await Page.findOne({ slug: 'homepage' })
    
    if (!homepage) {
      // Return default data if not found
      return NextResponse.json({ content: {} })
    }
    
    return NextResponse.json(homepage)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const data = await request.json()
    
    const homepage = await Page.findOneAndUpdate(
      { slug: 'homepage' },
      {
        slug: 'homepage',
        title: 'Homepage',
        content: data,
        seo: {
          metaTitle: data.hero?.title || 'Luis Granero - Desarrollador Web',
          metaDescription: data.hero?.description || 'Desarrollador web freelance especializado en React y Next.js'
        },
        isPublished: true
      },
      { upsert: true, new: true }
    )
    
    return NextResponse.json({ message: 'Homepage updated successfully', data: homepage })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}