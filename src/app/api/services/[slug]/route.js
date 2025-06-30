// src/app/api/services/[slug]/route.js
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const service = await Service.findOne({ 
      slug: params.slug, 
      isActive: true 
    }).lean();
    
    if (!service) {
      return Response.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }
    
    // Incrementar vistas
    await Service.findByIdAndUpdate(service._id, { 
      $inc: { 'stats.views': 1 } 
    });
    
    return Response.json({ service });
    
  } catch (error) {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const data = await request.json();
    
    const service = await Service.findOneAndUpdate(
      { slug: params.slug },
      { ...data, updatedAt: new Date() },
      { new: true }
    );
    
    if (!service) {
      return Response.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }
    
    return Response.json({ success: true, service });
  } catch (error) {
    return Response.json({ error: 'Error actualizando servicio' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const service = await Service.findOneAndUpdate(
      { slug: params.slug },
      { isActive: false, deletedAt: new Date() },
      { new: true }
    );
    
    if (!service) {
      return Response.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }
    
    return Response.json({ success: true, message: 'Servicio eliminado' });
  } catch (error) {
    return Response.json({ error: 'Error eliminando servicio' }, { status: 500 });
  }
}