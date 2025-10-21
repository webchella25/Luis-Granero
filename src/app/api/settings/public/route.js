import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';

export async function GET() {
  try {
    await connectDB();
    
    // Intentar obtener configuración de la DB
    const siteConfig = await SiteConfig.findOne({ key: 'site_info' });
    
    // Si existe en la DB, devolverla
    if (siteConfig && siteConfig.value) {
      return NextResponse.json(siteConfig.value);
    }
    
    // Si no existe, devolver configuración por defecto
    const defaultConfig = {
      site: {
        name: 'Luis Granero',
        email: 'luis@luisgranero.com',
        phone: '+34 698 38 36 10',
        address: 'Madrid, España',
        whatsapp: '+34698383610',
        tagline: 'Desarrollador Web Freelance'
      },
      social: {
        linkedin: 'https://linkedin.com/in/luisgranero',
        github: 'https://github.com/webchella25',
        twitter: 'https://twitter.com/luisgranerodev',
        youtube: 'https://youtube.com/@luisgranerodev'
      }
    };
    
    return NextResponse.json(defaultConfig);
    
  } catch (error) {
    console.error('Error en /api/settings/public:', error);
    
    // Siempre devolver algo válido, incluso en error
    return NextResponse.json({
      site: {
        name: 'Luis Granero',
        email: 'luis@luisgranero.com',
        phone: '+34 698 38 36 10',
        address: 'Madrid, España',
        whatsapp: '+34698383610'
      },
      social: {}
    });
  }
}