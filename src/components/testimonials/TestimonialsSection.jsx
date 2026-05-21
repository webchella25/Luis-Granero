import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
import { Star } from 'lucide-react';

async function getTestimonials() {
  try {
    await dbConnect();
    const docs = await Testimonial.find({ verificationStatus: 'verified', isActive: true })
      .sort({ isFeatured: -1, orderIndex: 1, createdAt: -1 })
      .lean();
    return docs.map(t => ({ ...t, _id: t._id.toString() }));
  } catch {
    return [];
  }
}

async function TestimonialsSection() {
  const testimonials = await getTestimonials();

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-[#0B1120] border-y border-slate-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="badge badge-cyan mx-auto mb-3">
            <Star className="w-3.5 h-3.5" />
            Testimonios
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-3">
            Lo que dicen mis clientes
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Opiniones reales de clientes con los que he trabajado.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <div key={t._id} className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-colors">
              {/* Estrellas */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Texto */}
              <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">
                "{t.content}"
              </p>

              {/* Métricas */}
              {t.metrics?.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-5">
                  {t.metrics.map((m, i) => (
                    <div key={i} className="text-center">
                      <div className="text-cyan-400 font-bold text-base">{m.value}</div>
                      <div className="text-slate-500 text-xs uppercase tracking-wider">{m.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cliente */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">{t.client?.name?.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-slate-200 font-medium text-sm">
                    {t.client?.linkedin
                      ? <a href={t.client.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">{t.client.name}</a>
                      : t.client?.name
                    }
                  </div>
                  <div className="text-slate-500 text-xs">
                    {[t.client?.role, t.client?.company].filter(Boolean).join(' · ')}
                  </div>
                  {t.project?.name && (
                    <div className="text-cyan-400 text-xs mt-0.5">Proyecto: {t.project.name}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
