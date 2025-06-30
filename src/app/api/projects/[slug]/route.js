// src/app/api/projects/[slug]/route.js
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const project = await Project.findOne({ 
      slug: params.slug, 
      isActive: true 
    }).lean();
    
    if (!project) {
      return Response.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }
    
    // Incrementar vistas
    await Project.findByIdAndUpdate(project._id, { 
      $inc: { 'stats.views': 1 } 
    });
    
    // Obtener proyectos relacionados
    const relatedProjects = await Project.find({
      _id: { $ne: project._id },
      category: project.category,
      isActive: true
    })
    .limit(3)
    .select('title slug description image category technologies metrics status')
    .lean();
    
    return Response.json({ 
      project: {
        ...project,
        stats: {
          ...project.stats,
          views: (project.stats?.views || 0) + 1
        }
      },
      relatedProjects 
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
    
  } catch (error) {
    console.error('Error fetching project:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const data = await request.json();
    
    const project = await Project.findOneAndUpdate(
      { slug: params.slug },
      { ...data, updatedAt: new Date() },
      { new: true }
    );
    
    if (!project) {
      return Response.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }
    
    return Response.json({ success: true, project });
  } catch (error) {
    return Response.json({ error: 'Error actualizando proyecto' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    // Soft delete - marcar como inactivo
    const project = await Project.findOneAndUpdate(
      { slug: params.slug },
      { isActive: false, deletedAt: new Date() },
      { new: true }
    );
    
    if (!project) {
      return Response.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }
    
    return Response.json({ success: true, message: 'Proyecto eliminado' });
  } catch (error) {
    return Response.json({ error: 'Error eliminando proyecto' }, { status: 500 });
  }
}