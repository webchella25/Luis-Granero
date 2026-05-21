'use client';
// Muestra el bloqueo de pago o el contenido según si el usuario ha comprado
import { useState } from 'react';
import { Lock, CheckCircle, Zap, Users, BookOpen, ArrowRight } from 'lucide-react';

export default function CoursePurchaseGate({ course, children, anchorId }) {
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckAccess(e) {
    e.preventDefault();
    if (!email) return;
    setChecking(true);
    setError('');
    try {
      const res = await fetch(`/api/checkout/verify?email=${encodeURIComponent(email)}&courseId=${course._id}`);
      const data = await res.json();
      if (data.hasPurchased) {
        setHasPurchased(true);
      } else {
        setError('No encontramos una compra con ese email. Puedes comprarlo abajo.');
      }
    } catch {
      setError('Error al verificar. Inténtalo de nuevo.');
    } finally {
      setChecking(false);
    }
  }

  async function handlePurchase() {
    if (!email) {
      setError('Introduce tu email primero');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course._id,
          courseSlug: course.slug,
          email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Error al iniciar el pago');
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Si ya verificó que tiene acceso, muestra el contenido
  if (hasPurchased) {
    return <>{children}</>;
  }

  return (
    <section id={anchorId} className="py-16 bg-[#0B1120]">
      <div className="container mx-auto px-6 max-w-2xl">

        {/* Card de compra */}
        <div className="bg-[#1E293B] border border-cyan-500/30 rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-slate-700/50 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-1">Curso de pago</h2>
            <p className="text-slate-400 text-sm">Acceso completo de por vida · Un solo pago</p>
          </div>

          {/* Lo que incluye */}
          <div className="p-6 border-b border-slate-700/50">
            <h3 className="text-slate-300 font-semibold mb-4 text-sm uppercase tracking-wider">
              Qué incluye
            </h3>
            <ul className="space-y-3">
              {[
                { icon: BookOpen, text: `${course.articles?.length || 0} lecciones escritas con código real` },
                { icon: Zap, text: 'Basado en SaaS reales en producción — no teoría' },
                { icon: CheckCircle, text: 'Acceso de por vida + actualizaciones incluidas' },
                { icon: Users, text: 'Acceso al canal de dudas por email' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Precio y formulario */}
          <div className="p-6">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-slate-100">€97</span>
              <span className="text-slate-400 text-sm">pago único</span>
            </div>

            <form onSubmit={handleCheckAccess} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-500"
              />

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <button
                type="button"
                onClick={handlePurchase}
                disabled={loading || !email}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-[#0F172A] font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {loading ? 'Redirigiendo a Stripe...' : (
                  <>Comprar por €97 <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <button
                type="submit"
                disabled={checking || !email}
                className="w-full py-2.5 border border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                {checking ? 'Verificando...' : 'Ya lo compré — verificar acceso'}
              </button>
            </form>

            <p className="text-slate-500 text-xs text-center mt-4">
              Pago seguro con Stripe · Garantía de devolución 14 días
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
