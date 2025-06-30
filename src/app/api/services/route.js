// src/app/api/services/route.js
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const category = searchParams.get('category');
    
    const filters = { isActive: true };
    if (featured) filters.isFeatured = true;
    if (category) filters.category = category;
    
    const services = await Service.find(filters)
      .sort({ orderIndex: 1 })
      .lean();
    
    return Response.json({ services });
    
  } catch (error) {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    const service = await Service.create(data);
    
    return Response.json({ success: true, service }, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Error creando servicio' }, { status: 500 });
  }
}