'use client';
// src/app/admin/sales-stats/page.js — Dashboard de métricas de ventas
import { useState, useEffect } from 'react';

const SECTOR_LABELS = {
  restaurant: '🍽️ Restaurantes',
  beauty: '💇 Belleza',
  health: '🏥 Salud',
  shop: '🛍️ Tiendas',
  service: '🔧 Servicios',
  generic: '🏢 Otros'
};

const SOURCE_LABELS = {
  google_maps: '🗺️ Google Maps',
  google_search: '🔍 Google Search',
  instagram: '📸 Instagram',
  linkedin: '💼 LinkedIn',
  manual: '✋ Manual',
  referral: '🤝 Referido',
  other: '📌 Otro'
};

const STATUS_LABELS = {
  new: 'Nuevos',
  contacted: 'Contactados',
  qualified: 'Cualificados',
  proposal: 'Propuesta enviada',
  negotiation: 'Negociación',
  won: 'Ganados',
  lost: 'Perdidos'
};

function StatCard({ icon, label, value, sub, color = 'cyan' }) {
  const colors = {
    cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
    green: 'from-green-500/10 to-green-500/5 border-green-500/20 text-green-400',
    orange: 'from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-400',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400',
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400'
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-3xl font-bold ${colors[color].split(' ')[3]} mb-1`}>{value}</div>
      <div className="text-slate-300 text-sm font-medium">{label}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}

function ProgressBar({ label, value, max, color = 'cyan' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barColors = {
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };
  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-slate-300 w-32 truncate flex-shrink-0">{label}</div>
      <div className="flex-1 bg-slate-700 rounded-full h-2">
        <div className={`${barColors[color]} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-sm text-slate-400 w-8 text-right">{value}</div>
    </div>
  );
}

export default function SalesStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/sales-stats')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Cargando métricas...</div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-red-400">Error cargando estadísticas</div>;
  }

  const maxPipeline = Math.max(...Object.values(stats.pipeline));
  const maxSource = Math.max(...(stats.sources?.map(s => s.count) || [1]));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">📊 Métricas de Ventas</h1>
        <p className="text-slate-400 mt-1">Rendimiento del CRM — últimos 30 días</p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Leads totales" value={stats.totalLeads} color="blue" />
        <StatCard icon="🏆" label="Leads ganados" value={stats.wonLeads} sub="clientes cerrados" color="emerald" />
        <StatCard icon="📈" label="Tasa de conversión" value={`${stats.conversionRate}%`} sub="total → ganado" color="cyan" />
        <StatCard icon="📅" label="Citas realizadas" value={stats.appointments.completed || 0} sub={`${stats.appointments.closeRate}% se cierran`} color="purple" />
      </div>

      {/* Email + Demo stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">📧 Rendimiento de Email (30 días)</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-2xl font-bold text-cyan-400">{stats.email.total}</div>
              <div className="text-slate-400 text-sm">Emails enviados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{stats.email.openRate}%</div>
              <div className="text-slate-400 text-sm">Tasa de apertura</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{stats.email.opened}</div>
              <div className="text-slate-400 text-sm">Emails abiertos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{stats.email.clickRate}%</div>
              <div className="text-slate-400 text-sm">Click rate</div>
            </div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-sm">
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Progreso del funnel de email</span>
            </div>
            <div className="space-y-2 mt-2">
              <ProgressBar label="Enviados" value={stats.email.sent} max={stats.email.total} color="blue" />
              <ProgressBar label="Abiertos" value={stats.email.opened} max={stats.email.sent} color="green" />
              <ProgressBar label="Clicks" value={stats.email.clicked} max={stats.email.opened} color="orange" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">🌐 Demo Sites generadas</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-2xl font-bold text-orange-400">{stats.demos.total}</div>
              <div className="text-slate-400 text-sm">Demos generadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{stats.demos.conversionRate}%</div>
              <div className="text-slate-400 text-sm">Visitadas por el lead</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400">{stats.demos.withVisits}</div>
              <div className="text-slate-400 text-sm">Con al menos 1 visita</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{stats.demos.totalVisits}</div>
              <div className="text-slate-400 text-sm">Visitas totales</div>
            </div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
            <div className="text-orange-400 text-sm font-medium">💡 Insight</div>
            <div className="text-slate-400 text-xs mt-1">
              Los leads que visitan su demo tienen un 3x más de probabilidad de cerrar. Úsalas en todos tus mensajes.
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline y fuentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">🎯 Estado del pipeline</h2>
          <div className="space-y-3">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <ProgressBar
                key={status}
                label={label}
                value={stats.pipeline[status] || 0}
                max={maxPipeline}
                color={status === 'won' ? 'emerald' : status === 'lost' ? 'red' : status === 'proposal' ? 'orange' : 'blue'}
              />
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">📡 Fuentes de leads</h2>
          <div className="space-y-3">
            {stats.sources?.map(source => (
              <ProgressBar
                key={source._id}
                label={SOURCE_LABELS[source._id] || source._id}
                value={source.count}
                max={maxSource}
                color="purple"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sectores */}
      {stats.sectors?.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">🏭 Rendimiento por sector</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left pb-3">Sector</th>
                  <th className="text-right pb-3">Leads</th>
                  <th className="text-right pb-3">Ganados</th>
                  <th className="text-right pb-3">Conversión</th>
                  <th className="text-right pb-3">Score medio</th>
                </tr>
              </thead>
              <tbody>
                {stats.sectors.map(sector => {
                  const conv = sector.total > 0 ? ((sector.won / sector.total) * 100).toFixed(0) : 0;
                  return (
                    <tr key={sector._id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-3 text-white">{SECTOR_LABELS[sector._id] || sector._id}</td>
                      <td className="py-3 text-right text-slate-300">{sector.total}</td>
                      <td className="py-3 text-right text-emerald-400 font-bold">{sector.won}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${conv >= 20 ? 'bg-green-500/20 text-green-400' : conv >= 10 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>
                          {conv}%
                        </span>
                      </td>
                      <td className="py-3 text-right text-cyan-400">{Math.round(sector.avgScore || 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard
          icon="🆕"
          label="Leads nuevos (30d)"
          value={stats.activity.recentLeads}
          sub="capturados este mes"
          color="blue"
        />
        <StatCard
          icon="📞"
          label="Leads contactados (30d)"
          value={stats.activity.recentContacted}
          sub="activados este mes"
          color="orange"
        />
        <StatCard
          icon="🔄"
          label="Ciclo promedio"
          value="~14 días"
          sub="new → won (estimado)"
          color="purple"
        />
      </div>
    </div>
  );
}
