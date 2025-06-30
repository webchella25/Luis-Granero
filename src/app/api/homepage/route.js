// src/app/api/homepage/route.js
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';
import Service from '@/models/Service';
import TechStack from '@/models/TechStack';
import Testimonial from '@/models/Testimonial';

export async function GET() {
  try {
    await connectDB();

    // Obtener configuración del hero
    const configs = await SiteConfig.find({ 
      category: { $in: ['homepage', 'general', 'contact'] } 
    }).lean();
    
    const configObj = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {});

    // Obtener servicios activos
    const services = await Service.find({ isActive: true })
      .sort({ orderIndex: 1 })
      .lean();

    // Obtener tech stack
    const techStack = await TechStack.find({ isActive: true })
      .sort({ orderIndex: 1 })
      .lean();

    // Obtener testimonios destacados
    const testimonials = await Testimonial.find({ 
      isActive: true,
      isFeatured: true 
    })
    .sort({ orderIndex: 1 })
    .limit(4)
    .lean();

    // Estructurar datos del hero
    const hero = {
      title: configObj.hero_title || 'Luis Granero',
      subtitle: configObj.hero_subtitle || 'Desarrollador Full Stack',
      description: configObj.hero_description || 'Transformo ideas en aplicaciones web modernas.',
      ctaText: configObj.hero_cta_text || 'Ver mis proyectos',
      ctaLink: configObj.hero_cta_link || '/portfolio',
      stats: [
        { label: "Proyectos", value: "50+" },
        { label: "Años", value: "10+" },
        { label: "Clientes", value: "35+" },
        { label: "Tecnologías", value: techStack.length + "+" }
      ]
    };

    return Response.json({
      hero,
      services,
      techStack,
      testimonials,
      config: configObj
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });

  } catch (error) {
    console.error('Error fetching homepage data:', error);
    
    // Fallback a datos por defecto si hay error
    const { homepageSchema } = await import('@/lib/pageData');
    return Response.json(homepageSchema, { status: 200 });
  }
}