// src/app/api/admin/stats/route.js
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import BlogPost from '@/models/BlogPost';
import Project from '@/models/Project';
import Analytics from '@/models/Analytics';

export async function GET() {
  try {
    await connectDB();
    
    // Estadísticas generales
    const [
      totalContacts,
      newContacts,
      totalPosts,
      publishedPosts,
      totalProjects,
      featuredProjects,
      recentAnalytics
    ] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      }),
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ status: 'published' }),
      Project.countDocuments({ isActive: true }),
      Project.countDocuments({ isFeatured: true, isActive: true }),
      Analytics.findOne().sort({ date: -1 }).lean()
    ]);
    
    // Estadísticas de contactos por estado
    const contactsByStatus = await Contact.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Posts más populares
    const popularPosts = await BlogPost.find({ status: 'published' })
      .sort({ 'stats.views': -1 })
      .limit(5)
      .select('title slug stats.views')
      .lean();
    
    // Proyectos más visitados
    const popularProjects = await Project.find({ isActive: true })
      .sort({ 'stats.views': -1 })
      .limit(5)
      .select('title slug stats.views stats.likes')
      .lean();
    
    return Response.json({
      overview: {
        totalContacts,
        newContacts,
        totalPosts,
        publishedPosts,
        totalProjects,
        featuredProjects
      },
      contactsByStatus,
      popularPosts,
      popularProjects,
      traffic: recentAnalytics?.traffic || {}
    });
    
  } catch (error) {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}