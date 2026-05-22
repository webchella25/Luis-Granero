import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/seo/metadata';

export const metadata = {
  title: 'Agendar cita | Luis Granero',
  description: 'Para agendar una cita necesitas un enlace de invitación válido. También puedes contactar desde la página de contacto.',
  openGraph: {
    title: 'Agendar cita | Luis Granero',
    description: 'Agenda una cita con un enlace de invitación válido o contacta para solicitar información.',
    type: 'website',
    url: `${SITE_URL}/agendar`,
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: `${SITE_URL}/agendar`,
  },
};

export default function AgendarFallbackPage() {
  return (
    <main className="min-h-screen bg-[#0F172A]">
      <Header />

      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_75%_10%,rgba(59,130,246,0.10),transparent_30%)]" />
        <div className="relative container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-400">
              Citas privadas
            </p>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-50 md:text-6xl">
              Agendar cita
            </h1>
            <p className="mb-8 text-lg leading-8 text-slate-300 md:text-xl">
              Para agendar una cita necesitas un enlace de invitación válido.
              Si quieres contactar, puedes hacerlo desde la página de contacto.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contacto"
                className="rounded-lg bg-cyan-500 px-7 py-3 font-semibold text-slate-950 transition-colors duration-200 hover:bg-cyan-400"
              >
                Ir a contacto
              </Link>
              <Link
                href="/servicios"
                className="rounded-lg border border-slate-600 px-7 py-3 font-semibold text-slate-300 transition-colors duration-200 hover:border-slate-400 hover:text-white"
              >
                Ver servicios
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
