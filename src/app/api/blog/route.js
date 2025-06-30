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
    const tag = searchParams.get('tag');
    const difficulty = searchParams.get('difficulty');
    const sort = searchParams.get('sort') || 'publishedAt';
    const order = searchParams.get('order') || 'desc';
    
    // Construir filtros
    const filters = { status: 'published' };
    
    if (category && category !== 'all') filters.category = category;
    if (featured) filters.isFeatured = true;
    if (difficulty && difficulty !== 'all') filters.difficulty = difficulty;
    if (tag) filters.tags = { $in: [tag] };
    if (search) {
      filters.$text = { $search: search };
    }
    
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = {};
    sortObj[sort] = sortOrder;
    
    // Obtener posts con paginación
    const [posts, total, categories, tags, popularPosts] = await Promise.all([
      BlogPost.find(filters)
        .select('title slug excerpt category tags readingTime publishedAt stats.views isFeatured author.name difficulty featuredImage')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(filters),
      BlogPost.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      BlogPost.aggregate([
        { $match: { status: 'published' } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]),
      BlogPost.find({ status: 'published' })
        .select('title slug stats.views')
        .sort({ 'stats.views': -1 })
        .limit(5)
        .lean()
    ]);
    
    // Incrementar vistas para posts mostrados
    if (posts.length > 0) {
      const postIds = posts.map(p => p._id);
      await BlogPost.updateMany(
        { _id: { $in: postIds } },
        { $inc: { 'stats.views': 1 } }
      );
    }
    
    return Response.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      categories: categories.reduce((acc, cat) => {
        acc[cat._id] = cat.count;
        return acc;
      }, {}),
      tags: tags.map(tag => ({ name: tag._id, count: tag.count })),
      popularPosts,
      filters: {
        category,
        featured,
        search,
        tag,
        difficulty,
        sort,
        order
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
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
    
    // Generar slug automáticamente si no existe
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
    
    // Calcular tiempo de lectura aproximado
    const wordsPerMinute = 200;
    const wordCount = data.content ? data.content.split(' ').length : 0;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    const post = await BlogPost.create({
      ...data,
      readingTime,
      publishedAt: data.status === 'published' ? new Date() : null,
      stats: {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0
      }
    });
    
    return Response.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return Response.json({ error: 'Error creando post' }, { status: 500 });
  }
}