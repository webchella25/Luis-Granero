// src/app/api/admin/pages/homepage/route.js (NUEVO)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';

export async function POST(request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const data = await request.json();
    
    // Guardar servicios seleccionados
    if (data.selectedServices) {
      const serviceIds = data.selectedServices.map(s => s._id);
      
      await SiteConfig.findOneAndUpdate(
        { key: 'homepage_selected_services' },
        {
          key: 'homepage_selected_services',
          value: serviceIds,
          category: 'homepage',
          type: 'array'
        },
        { upsert: true }
      );
    }

    // Guardar configuración de la sección
    if (data.servicesConfig) {
      const configs = [
        { key: 'services_title', value: data.servicesConfig.title },
        { key: 'services_subtitle', value: data.servicesConfig.subtitle },
        { key: 'services_show_button', value: data.servicesConfig.showViewAllButton }
      ];

      for (const config of configs) {
        await SiteConfig.findOneAndUpdate(
          { key: config.key },
          {
            ...config,
            category: 'homepage'
          },
          { upsert: true }
        );
      }
    }

    return NextResponse.json({ 
      message: 'Homepage settings updated successfully'
    });

  } catch (error) {
    console.error('Error saving homepage:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}