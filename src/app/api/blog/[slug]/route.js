// src/app/api/blog/[slug]/route.js
import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const post = await BlogPost.findOne({ 
      slug: params.slug, 
      status: 'published' 
    }).populate('relatedPosts', 'title slug excerpt category readingTime publishedAt');
    
    if (!post) {
      return Response.json({ error: 'Post no encontrado' }, { status: 404 });
    }
    
    // Incrementar vistas
    await BlogPost.findByIdAndUpdate(post._id, { 
      $inc: { 'stats.views': 1 } 
    });
    
    return Response.json({ post });
    
  } catch (error) {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const data = await request.json();
    
    const post = await BlogPost.findOneAndUpdate(
      { slug: params.slug },
      { 
        ...data, 
        lastModified: new Date(),
        publishedAt: data.status === 'published' && !data.publishedAt ? new Date() : data.publishedAt
      },
      { new: true }
    );
    
    if (!post) {
      return Response.json({ error: 'Post no encontrado' }, { status: 404 });
    }
    
    return Response.json({ success: true, post });
  } catch (error) {
    return Response.json({ error: 'Error actualizando post' }, { status: 500 });
  }
}