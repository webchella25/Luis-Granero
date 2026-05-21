// src/app/api/admin/leads/[id]/generate-demo/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import DemoSite from '@/models/DemoSite';
import { generateDemoHtml, generateDemoToken, categorizeSector } from '@/lib/demo-generator/index';

export async function POST(request, { params }) {
  try {
    await dbConnect();

    const lead = await Lead.findById(params.id);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead no encontrado' }, { status: 404 });
    }

    // Si ya tiene una demo activa y no ha expirado, la reutilizamos
    const existingDemo = await DemoSite.findOne({
      leadId: lead._id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (existingDemo) {
      const demoUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.luisgranero.com'}/demo/${existingDemo.token}`;
      return NextResponse.json({
        success: true,
        demo: { token: existingDemo.token, url: demoUrl, sector: existingDemo.sector, isExisting: true }
      });
    }

    // Generar nueva demo
    const { html, sector, primaryColor, secondaryColor } = generateDemoHtml(lead);
    const token = generateDemoToken();

    // Determinar sector si el lead no lo tiene
    const computedSector = lead.sector || categorizeSector(lead.category);

    const demo = await DemoSite.create({
      leadId: lead._id,
      token,
      businessName: lead.name,
      sector: computedSector,
      category: lead.category,
      address: lead.address,
      phone: lead.phone || (lead.phoneNumbers && lead.phoneNumbers[0]),
      email: lead.email || (lead.possibleEmails && lead.possibleEmails[0]),
      description: lead.description || lead.bio,
      rating: lead.rating,
      reviewCount: lead.reviewCount,
      profilePicUrl: lead.profilePicUrl,
      socialMedia: lead.socialMedia,
      primaryColor,
      secondaryColor
    });

    // Guardar sector en el lead si no lo tenía
    if (!lead.sector) {
      await Lead.findByIdAndUpdate(lead._id, { $set: { sector: computedSector } });
    }

    const demoUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.luisgranero.com'}/demo/${token}`;

    return NextResponse.json({
      success: true,
      demo: {
        token,
        url: demoUrl,
        sector: computedSector,
        primaryColor,
        isExisting: false
      }
    });

  } catch (error) {
    console.error('Error generando demo:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const demo = await DemoSite.findOne({
      leadId: params.id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!demo) {
      return NextResponse.json({ success: true, demo: null });
    }

    const demoUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.luisgranero.com'}/demo/${demo.token}`;

    return NextResponse.json({
      success: true,
      demo: {
        token: demo.token,
        url: demoUrl,
        sector: demo.sector,
        visitCount: demo.visitCount,
        lastVisitedAt: demo.lastVisitedAt,
        createdAt: demo.createdAt,
        expiresAt: demo.expiresAt
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
