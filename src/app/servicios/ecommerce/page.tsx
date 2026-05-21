// src/app/servicios/ecommerce/page.tsx
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SchemaOrg from '@/components/seo/SchemaOrg';
import { getBreadcrumbSchema, getServiceSchema } from '@/lib/seo/schemas';
import {
  ShoppingCart, CreditCard, TrendingUp, Shield,
  ArrowRight, Globe, Zap, Layers, BarChart3, Rocket
} from 'lucide-react';

export const metadata = {
  title: 'Desarrollo de Tienda Online a Medida en España — E-commerce Profesional | Luis Granero',
  description: 'Desarrollo de tiendas online a medida en España con React y Next.js. E-commerce rápido, seguro y optimizado para ventas. Sin comisiones de plataforma. Freelance senior con +10 años de experiencia.',
  keywords: [
    'tienda online a medida España',
    'desarrollo e-commerce profesional',
    'tienda online personalizada presupuesto',
    'e-commerce Next.js React',
    'desarrollo tienda online freelance',
    'e-commerce a medida vs Shopify',
    'tienda online sin comisiones',
    'headless commerce Next.js',
  ],
  openGraph: {
    title: 'Tienda Online a Medida — E-commerce Profesional España | Luis Granero',
    description: 'E-commerce personalizado con React y Next.js. Sin plantillas, sin comisiones, con rendimiento máximo. Freelance senior en España.',
    type: 'website',
    url: 'https://www.luisgranero.com/servicios/ecommerce',
  },
  alternates: {
    canonical: 'https://www.luisgranero.com/servicios/ecommerce',
  },
};

const advantages = [
  {
    icon: TrendingUp,
    title: '0% de comisión por venta',
    description: 'A diferencia de Shopify o WooCommerce, una tienda a medida no te cobra por cada transacción. A largo plazo el ahorro es enorme.',
  },
  {
    icon: Zap,
    title: 'Velocidad que convierte',
    description: 'Cada 100ms de mejora en velocidad aumenta las conversiones un 1%. Con Next.js y SSR conseguimos tiempos de carga mínimos.',
  },
  {
    icon: Shield,
    title: 'Propiedad total del código',
    description: 'El código es tuyo. No dependes de una plataforma que puede cambiar precios, cerrar servicios o limitar funcionalidades.',
  },
  {
    icon: Layers,
    title: 'Integración con cualquier sistema',
    description: 'ERP, CRM, PIM, contabilidad, mensajería. Una tienda a medida se conecta con las herramientas que ya tienes o necesitas.',
  },
  {
    icon: Globe,
    title: 'SEO técnico optimizado',
    description: 'URL limpias, schema markup de producto, sitemap dinámico y carga instantánea. Google indexará y posicionará tu catálogo correctamente.',
  },
  {
    icon: BarChart3,
    title: 'Analytics profundo',
    description: 'Embudo de ventas, comportamiento de usuario, A/B testing y métricas de negocio que las plataformas genéricas no te dan.',
  },
];

const shopifyComparison = [
  { feature: 'Comisión por venta', custom: '0%', shopify: 'Hasta 2%' },
  { feature: 'Mensualidad de plataforma', custom: 'Sin coste recurrente', shopify: '€29–€299/mes' },
  { feature: 'Personalización visual', custom: 'Total, sin límites', shopify: 'Limitada por tema' },
  { feature: 'Integraciones propias', custom: 'Cualquier API', shopify: 'Solo apps del store' },
  { feature: 'Velocidad de carga', custom: '< 0.8s (Next.js SSR)', shopify: '1.5–3s promedio' },
  { feature: 'Propiedad del código', custom: 'Completa', shopify: 'Nunca es tuya' },
  { feature: 'SEO técnico', custom: 'Control total', shopify: 'Limitado por plataforma' },
];

const features = [
  'Catálogo ilimitado de productos y variantes',
  'Pasarelas de pago: Stripe, Redsys, Bizum, PayPal',
  'Gestión de stock y alertas automáticas',
  'Sistema de cupones y descuentos',
  'Panel de administración personalizado',
  'Emails transaccionales automáticos',
  'Facturación automática integrada',
  'Multi-idioma y multi-divisa',
  'Cálculo de envíos en tiempo real',
  'Área de cliente con historial de pedidos',
  'Recuperación de carritos abandonados',
  'Reviews y valoraciones de productos',
];

const process = [
  {
    step: '01',
    title: 'Análisis de negocio',
    desc: 'Entiendo tu catálogo, flujos de venta, integraciones necesarias y objetivos de crecimiento antes de diseñar la arquitectura.',
  },
  {
    step: '02',
    title: 'Diseño del catálogo y UX',
    desc: 'Definimos la estructura del catálogo, filtros, búsqueda y el flujo de compra optimizado para conversión.',
  },
  {
    step: '03',
    title: 'Desarrollo e integraciones',
    desc: 'Implementación iterativa con demos frecuentes. Integro pasarelas de pago, ERP/CRM y herramientas externas.',
  },
  {
    step: '04',
    title: 'Migración y lanzamiento',
    desc: 'Si vienes de otra plataforma, migro productos, clientes e historial. Lanzamiento con cero downtime.',
  },
];

const faqs = [
  {
    q: '¿Cuánto cuesta una tienda online a medida?',
    a: 'Depende de la complejidad del catálogo y las integraciones. Un e-commerce funcional parte desde 4.000€. Proyectos con integraciones ERP, multi-idioma o catálogos complejos tienen precios personalizados. Siempre ofrezco presupuesto detallado sin compromiso.',
  },
  {
    q: '¿Cuánto tarda en estar lista?',
    a: 'Un e-commerce básico con pasarela de pago y gestión de pedidos puede estar en producción en 6-10 semanas. Los plazos dependen del alcance y la agilidad en las revisiones.',
  },
  {
    q: '¿Puedes migrar mi tienda de Shopify o WooCommerce?',
    a: 'Sí. Migro productos, variantes, imágenes, precios, clientes e historial de pedidos. El proceso es incremental para no interrumpir las ventas durante la transición.',
  },
  {
    q: '¿Qué pasarelas de pago integras?',
    a: 'Stripe, Redsys (para bancos españoles), Bizum, PayPal y cualquier otra que tu banco o necesidad requiera. También integro financiación en cuotas (Aplazame, Sequra).',
  },
  {
    q: '¿Qué pasa después del lanzamiento?',
    a: 'Ofrezco mantenimiento mensual opcional: actualizaciones de seguridad, backups, monitorización y soporte. También puedes gestionar la tienda de forma completamente autónoma.',
  },
];

export default function EcommercePage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Servicios', url: '/servicios' },
    { name: 'E-commerce a medida', url: '/servicios/ecommerce' },
  ]);
  const serviceSchema = getServiceSchema({
    name: 'Desarrollo de tienda online a medida',
    description: 'E-commerce personalizado con React y Next.js. Sin comisiones por venta, integrado con tu ERP, optimizado para conversión y rendimiento máximo. Freelance senior en España.',
    areaServed: 'España',
  });

  return (
    <main className="min-h-screen bg-[#0F172A]">
      <SchemaOrg schema={[breadcrumb, serviceSchema]} />
      <Header />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="bg-grid absolute inset-0 opacity-30" />
        <div className="bg-grid-fade absolute inset-0" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/servicios" className="hover:text-slate-300 transition-colors">Servicios</Link>
            <span>/</span>
            <span className="text-slate-300">E-commerce a medida</span>
          </nav>

          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="badge badge-cyan">Servicio</span>
              <span className="text-sm text-slate-500">Tiendas online · España</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50 leading-tight tracking-tight mb-6">
              Tu tienda online,{' '}
              <span className="gradient-text">construida para vender</span>
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl">
              E-commerce a medida con React y Next.js. Sin comisiones de plataforma,
              sin limitaciones de diseño y con el rendimiento que necesitas para convertir visitas en ventas.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/contacto" className="btn-primary">
                Solicitar presupuesto
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/portfolio" className="btn-secondary">
                Ver tiendas desarrolladas
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-slate-800">
              {[
                { value: '0%', label: 'comisión por venta' },
                { value: '< 1s', label: 'tiempo de carga' },
                { value: 'SEO', label: 'optimizado al máximo' },
                { value: 'Tuyo', label: 'el código siempre' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl font-bold text-cyan-400">{s.value}</div>
                  <div className="text-sm text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VENTAJAS ── */}
      <section className="py-20 bg-[#0B1120]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-50 mb-4">
              Por qué elegir desarrollo a medida sobre Shopify
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Las plataformas genéricas son cómodas al principio. El problema llega cuando creces.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {advantages.map((a) => (
              <div key={a.title} className="card p-6 hover:border-cyan-500/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <a.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{a.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARATIVA ── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-50 mb-3">A medida vs Shopify</h2>
            <p className="text-slate-400 mb-10">Comparativa honesta para que tomes la mejor decisión para tu negocio.</p>
            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-5 py-4 text-slate-400 font-medium bg-[#1E293B]">Característica</th>
                    <th className="px-5 py-4 text-cyan-400 font-semibold bg-[#1E293B] text-center">A medida</th>
                    <th className="px-5 py-4 text-slate-400 font-medium bg-[#1E293B] text-center">Shopify</th>
                  </tr>
                </thead>
                <tbody>
                  {shopifyComparison.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-slate-800 ${i % 2 === 0 ? 'bg-[#0F172A]' : 'bg-[#0B1120]'}`}>
                      <td className="px-5 py-4 text-slate-300">{row.feature}</td>
                      <td className="px-5 py-4 text-center text-cyan-400 font-medium">{row.custom}</td>
                      <td className="px-5 py-4 text-center text-slate-400">{row.shopify}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section className="py-20 bg-[#0B1120]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-50 mb-3">Todo lo que incluye</h2>
            <p className="text-slate-400 mb-10">Sin extras ocultos. Esto es lo que obtienes en una tienda desarrollada a medida.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-50 mb-3">Proceso de desarrollo</h2>
            <p className="text-slate-400 mb-12">De la idea a las primeras ventas, paso a paso.</p>
            <div className="space-y-6">
              {process.map((p) => (
                <div key={p.step} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold text-sm">{p.step}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-semibold text-slate-100 mb-1">{p.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CASO DE ÉXITO ── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className="badge badge-cyan">Caso de éxito real</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-50 mb-3">LenceriaStore.es · En producción</h2>
            <p className="text-slate-400 mb-10 max-w-2xl">
              E-commerce de moda íntima construido desde cero con Next.js 15. Sin Shopify, sin comisiones, con control total del negocio y datos propios.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left: info */}
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-semibold text-slate-100 mb-4 text-sm uppercase tracking-wider text-cyan-400">Stack tecnológico</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Next.js 15', 'React 19', 'TypeScript', 'Prisma', 'PostgreSQL', 'Tailwind CSS 4', 'Stripe', 'Brevo', 'PM2 + Nginx'].map(t => (
                      <span key={t} className="px-2 py-1 text-xs font-mono bg-slate-800 text-cyan-400 rounded border border-cyan-500/20">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-slate-100 mb-4 text-sm uppercase tracking-wider text-cyan-400">Funcionalidades desarrolladas</h3>
                  <ul className="space-y-2">
                    {[
                      'Catálogo completo con variantes, tallas y colores',
                      'Sistema VIP de puntos y recompensas por compra',
                      'Programa de afiliados con comisiones y pagos',
                      'Recuperación automática de carritos abandonados',
                      'Sincronización con Pinterest, TikTok Shop y Miravia',
                      'Facturación automática en PDF por pedido',
                      'Newsletter segmentado con Brevo',
                      'Sistema completo de devoluciones y postventa',
                      'Analytics propio de conversión y sesiones',
                    ].map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                        <ShoppingCart className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: metrics + link */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '0%', label: 'Comisión por venta', sub: 'vs Shopify 0.5–2%' },
                    { value: '< 1s', label: 'Tiempo de carga', sub: 'SSR optimizado' },
                    { value: '4', label: 'Canales de venta', sub: 'Web, Pinterest, TikTok, Miravia' },
                    { value: '4 meses', label: 'De 0 a producción', sub: 'Entrega completa' },
                  ].map(m => (
                    <div key={m.label} className="card p-5">
                      <div className="text-2xl font-bold text-cyan-400 mb-1">{m.value}</div>
                      <div className="text-sm font-medium text-slate-200">{m.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{m.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="card p-6 border-cyan-500/30">
                  <p className="text-slate-300 text-sm leading-relaxed italic mb-4">
                    "Necesitaba una tienda real, no una plantilla. Luis construyó todo el ecosistema: tienda, afiliados, puntos VIP, emails automatizados y sincronización con marketplaces. En producción desde el primer día sin problemas."
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">— Cliente · LenceriaStore.es</div>
                    <a
                      href="https://lenceriastore.es"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                    >
                      Ver tienda <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <Link href="/portfolio/lenceriastore" className="btn-secondary w-full justify-center">
                  Ver caso de estudio completo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-[#0B1120]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-50 mb-12">Preguntas frecuentes</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="border-b border-slate-800 pb-6">
                  <h3 className="font-semibold text-slate-100 mb-3">{faq.q}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-7 h-7 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-50 mb-4">¿Listo para vender sin limitaciones?</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Cuéntame tu proyecto. Analizaré tu situación actual y te daré un presupuesto detallado con enfoque técnico y de negocio.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contacto" className="btn-primary">
                Pedir presupuesto de tienda
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/blog/shopify-vs-desarrollo-a-medida" className="btn-secondary">
                Leer la guía comparativa
              </Link>
            </div>
            <p className="text-sm text-slate-600 mt-6">Sin compromiso · Presupuesto en 24–48h</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
