// src/app/demo/[token]/page.js — Página pública de demo (SSR)
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import DemoSite from '@/models/DemoSite';
import Lead from '@/models/Lead';
import { generateDemoHtml } from '@/lib/demo-generator/index';
import DemoTracker from './DemoTracker';

export async function generateMetadata({ params }) {
  try {
    await dbConnect();
    const demo = await DemoSite.findOne({ token: params.token, isActive: true });
    if (!demo) return { title: 'Demo no encontrada' };
    return {
      title: `${demo.businessName} — Demo web creada por Luis Granero`,
      description: `Web de demostración profesional para ${demo.businessName}. Creada por luisgranero.com`,
      robots: 'noindex,nofollow'
    };
  } catch {
    return { title: 'Demo' };
  }
}

export default async function DemoPage({ params }) {
  await dbConnect();

  const demo = await DemoSite.findOne({
    token: params.token,
    isActive: true
  });

  if (!demo) notFound();

  // Obtener datos actualizados del lead para regenerar HTML
  const lead = await Lead.findById(demo.leadId).lean();

  if (!lead) notFound();

  const { html } = generateDemoHtml(lead);

  return (
    <>
      {/* Tracker oculto — llama a /api/demo/[token]/track al cargar la página */}
      <DemoTracker token={params.token} />

      {/* Renderizar el HTML de la demo como contenido completo */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
