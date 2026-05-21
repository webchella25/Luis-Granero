// src/app/api/public/blog/categories/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Category from '@/models/Category'
import BlogPost from '@/models/BlogPost'

export async function GET() {
  try {
    await dbConnect()

    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean()

    // Contar posts por categoría
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await BlogPost.countDocuments({
          category: category.slug,
          status: 'published'
        })

        return {
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          color: category.color,
          posts: count,
          trending: false, // Puedes agregar lógica para detectar trending
          topics: [] // Puedes agregar topics si los tienes
        }
      })
    )

    return NextResponse.json(categoriesWithCount)

  } catch (error) {
    console.error('❌ Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
