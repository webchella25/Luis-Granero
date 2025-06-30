// src/app/api/projects/route.js
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    // Construir filtros
    const filters = { isActive: true };
    if (category && category !== 'all') filters.category = category;
    if (featured) filters.isFeatured = true;
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = {};
    sortObj[sort] = sortOrder;
    
    // Obtener proyectos con paginación
    const [projects, total, categories] = await Promise.all([
      Project.find(filters)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(filters),
      Project.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);
    
    // Incrementar vistas para proyectos mostrados
    if (projects.length > 0) {
      const projectIds = projects.map(p => p._id);
      await Project.updateMany(
        { _id: { $in: projectIds } },
        { $inc: { 'stats.views': 1 } }
      );
    }
    
    return Response.json({
      projects,
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
      filters: {
        category,
        featured,
        search,
        sort,
        order
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      }
    });
    
  } catch (error) {
    console.error('Error fetching projects:', error);
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
    
    const project = await Project.create({
      ...data,
      stats: {
        views: 0,
        likes: 0,
        ...data.stats
      }
    });
    
    return Response.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return Response.json({ error: 'Error creando proyecto' }, { status: 500 });
  }
}