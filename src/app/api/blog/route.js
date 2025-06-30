// src/app/api/blog/route.js
import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 6;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search');
    
    // Construir filtros
    const filters = { status: 'published' };
    
    if (category) filters.category = category;
    if (featured) filters.isFeatured = true;
    if (search) {
      filters.$text = { $search: search };
    }
    
    const skip = (page - 1) * limit;
    
    // Obtener posts con paginación
    const [posts, total] = await Promise.all([
      BlogPost.find(filters)
        .select('title slug excerpt category tags readingTime publishedAt stats.views isFeatured author.name')
        .sort({ publishedAt: -1, isPinned: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(filters)
    ]);
    
    return Response.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Calcular tiempo de lectura aproximado
    const wordsPerMinute = 200;
    const wordCount = data.content.split(' ').length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    const post = await BlogPost.create({
      ...data,
      readingTime,
      publishedAt: data.status === 'published' ? new Date() : null
    });
    
    return Response.json({ success: true, post }, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Error creando post' }, { status: 500 });
  }
}