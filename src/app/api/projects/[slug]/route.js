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
    .select('title slug description image category technologies')
    .lean();
    
    return Response.json({ 
      project,
      relatedProjects 
    });
    
  } catch (error) {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}