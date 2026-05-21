import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AboutHero from '../../components/about/AboutHero';
import AboutStory from '../../components/about/AboutStory';
import ExperienceTimeline from '../../components/about/ExperienceTimeline';
import SchemaOrg from '../../components/seo/SchemaOrg';
import { getProfilePageSchema, getOrganizationSchema } from '../../lib/seo/schemas';
import dbConnect from '@/lib/mongodb';
import Page from '@/models/Page';

export const revalidate = 3600;

async function getAboutData() {
  try {
    await dbConnect();
    const aboutPage = await Page.findOne({ slug: 'about', isPublished: true })
      .select('content seo updatedAt')
      .lean() as any;
    return aboutPage || null;
  } catch (error) {
    console.error('Error fetching about data:', error);
    return null;
  }
}

export async function generateMetadata() {
  const aboutData = await getAboutData();
  
  return {
    title: aboutData?.seo?.metaTitle || 'Sobre mí — Luis Granero | Freelance Senior React & Next.js España',
    description: aboutData?.seo?.metaDescription || 'Luis Granero: desarrollador web freelance senior en España con +10 años de experiencia. Especializado en React, Next.js y arquitecturas escalables. Conoce mi historia, proceso de trabajo y valores.',
    keywords: [
      'luis granero desarrollador web',
      'programador freelance senior España',
      'desarrollador React Next.js España',
      'full stack developer freelance España',
      'consultor técnico desarrollo web',
      'portfolio desarrollador web',
    ],
    openGraph: {
      title: 'Sobre Luis Granero — Freelance Senior React & Next.js | España',
      description: 'Desarrollador web freelance senior en España con +10 años de experiencia. React, Next.js y arquitecturas modernas para empresas y startups.',
      type: 'profile',
      url: 'https://www.luisgranero.com/sobre-mi',
    },
    alternates: {
      canonical: 'https://www.luisgranero.com/sobre-mi',
    },
  };
}

export default async function AboutPage() {
  const aboutData = await getAboutData();
  const content = aboutData?.content;

  return (
    <main className="min-h-screen bg-[#0F172A]">
      {/* Schema.org JSON-LD */}
      <SchemaOrg schema={[getProfilePageSchema(), getOrganizationSchema()]} />

      <Header />
      <AboutHero data={content?.hero} />
      <AboutStory data={content?.story} />
      <ExperienceTimeline data={content?.experience} />

      {/* CTA — enlace interno SEO hacia /servicios */}
      <section className="py-20 bg-[#0B1120] border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-3">
              ¿Listo para empezar?
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">
              Trabajemos juntos en tu próximo proyecto
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Si lo que has leído encaja con lo que buscas, da el siguiente paso.
              Sin rodeos, sin presión — solo una conversación sobre tu proyecto.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/servicios"
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg transition-colors duration-200"
              >
                Contratar mis servicios
              </Link>
              <Link
                href="/contacto"
                className="px-8 py-3 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Enviarme un mensaje
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}