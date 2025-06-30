// src/app/api/contact/route.js
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Extraer metadata de la request
    const metadata = {
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer')
    };
    
    const contact = await Contact.create({
      personal: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        website: data.website
      },
      project: {
        type: data.projectType,
        budget: data.budget,
        timeline: data.timeline,
        description: data.message,
        technologies: data.technologies || [],
        features: data.features || []
      },
      source: data.source || 'Website',
      metadata
    });
    
    // Aquí puedes añadir lógica para:
    // - Enviar email de notificación
    // - Integrar con CRM
    // - Triggers de automatización
    
    return Response.json({ 
      success: true, 
      message: 'Mensaje enviado correctamente',
      id: contact._id 
    });
    
  } catch (error) {
    console.error('Error saving contact:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    
    const skip = (page - 1) * limit;
    
    const [contacts, total] = await Promise.all([
      Contact.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Contact.countDocuments(filters)
    ]);
    
    return Response.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}