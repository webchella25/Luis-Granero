// src/app/api/admin/settings/route.js
// API PARA GUARDAR CONFIGURACIÓN DEL ADMIN + DATOS LEGALES
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Obtener configuración de la DB
    const siteConfig = await SiteConfig.findOne({ key: 'site_info' });
    
    if (siteConfig && siteConfig.value) {
      return NextResponse.json(siteConfig.value);
    }
    
    // Si no existe, devolver valores por defecto
    const defaultSettings = {
      site: {
        name: 'Luis Granero',
        tagline: 'Desarrollador Web Freelance',
        email: 'contacto@luisgranero.com',
        phone: '+34 600 000 000',
        address: 'Madrid, España',
        whatsapp: '',
        timezone: 'CET (UTC+1)',
        languages: 'Español, Inglés',
        workingHours: 'Lunes a Viernes: 9:00 - 18:00',
        responseTime: '2-4 horas'
      },
      social: {
        linkedin: '',
        github: '',
        twitter: '',
        youtube: '',
        instagram: '',
        tiktok: ''
      },
      analytics: {
        googleAnalytics: '',
        gtmId: '',
        facebookPixel: ''
      },
      seo: {
        defaultMetaDescription: 'Desarrollador web freelance especializado en React, Next.js y soluciones personalizadas',
        defaultKeywords: ['desarrollador web', 'freelance', 'React', 'Next.js', 'TypeScript'],
        sitemapEnabled: true,
        robotsEnabled: true
      },
      email: {
        contactEmail: 'contacto@luisgranero.com',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: ''
      },
      maintenance: {
        enabled: false,
        message: 'Sitio en mantenimiento. Volvemos pronto.',
        allowedIPs: []
      },
      // 🔥 NUEVO: Datos legales para páginas legales
      legal: {
        companyName: 'Luis Granero',
        ownerName: 'Luis Granero',
        dni: '',
        legalAddress: '',
        city: 'Madrid',
        postalCode: '',
        country: 'España',
        registryData: '', // Ej: "Registro Mercantil de Madrid, Tomo..."
        vatNumber: '' // CIF/NIF empresarial si aplica
      }
    };
    
    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error('❌ Error en GET /api/admin/settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const settings = await request.json();
    
    console.log('💾 Guardando configuración...');
    console.log('📦 Settings recibidos:', JSON.stringify(settings, null, 2));
    
    // Guardar o actualizar en la DB
    const result = await SiteConfig.findOneAndUpdate(
      { key: 'site_info' },
      {
        key: 'site_info',
        value: settings,
        category: 'general',
        type: 'object',
        isPublic: true,
        description: 'Configuración general del sitio'
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true 
      }
    );
    
    console.log('✅ Configuración guardada exitosamente');
    console.log('📄 Documento guardado:', result);
    
    return NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully',
      data: result.value
    });
  } catch (error) {
    console.error('❌ Error guardando settings:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}