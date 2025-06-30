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
    
    const [projects, total] = await Promise.all([
      Project.find(filters)
        .sort({ orderIndex: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(filters)
    ]);
    
    return Response.json({
      projects,
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
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    const project = await Project.create(data);
    
    return Response.json({ success: true, project }, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Error creando proyecto' }, { status: 500 });
  }
}