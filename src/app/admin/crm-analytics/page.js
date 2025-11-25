// src/app/admin/crm-analytics/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CRMAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [activeView, setActiveView] = useState('overview'); // overview, sources, opportunities, followups

  useEffect(() => {
    fetchDashboard();
    // Auto-refresh cada 5 minutos
    const interval = setInterval(fetchDashboard, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/analytics/dashboard?type=full');
      const data = await res.json();

      if (data.success) {
        setDashboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 text-xl">Generando analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl">❌ Error cargando analytics</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { general, trends, sources, topOpportunities, followUps, categories, contactActivity } = dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              📊 CRM Analytics Avanzado
            </h1>
            <p className="text-gray-400">
              Análisis completo de tu pipeline de leads • Generado: {new Date(dashboard.generatedAt).toLocaleString('es-ES')}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchDashboard}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg border border-cyan-500/30 transition"
            >
              🔄 Actualizar
            </button>
            <Link
              href="/admin/leads"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition"
            >
              Ver Leads →
            </Link>
          </div>
        </div>

        {/* View Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'sources', label: 'Fuentes', icon: '🎯' },
            { id: 'opportunities', label: 'Top Oportunidades', icon: '🔥' },
            { id: 'followups', label: 'Seguimientos', icon: '📞' }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                activeView === view.id
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-800 border border-cyan-500/20'
              }`}
            >
              {view.icon} {view.label}
            </button>
          ))}
        </div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <div className="space-y-6">

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Total Leads"
                value={general.totalLeads}
                subtitle={`${general.newLeads} nuevos (7 días)`}
                icon="🎯"
                color="blue"
                trend={general.newLeads > 0 ? 'up' : 'neutral'}
              />

              <KPICard
                title="Alta Oportunidad"
                value={general.highOpportunity}
                subtitle={`Score ≥ 70`}
                icon="🔥"
                color="red"
                percentage={(general.highOpportunity / general.totalLeads * 100).toFixed(1)}
              />

              <KPICard
                title="Tasa de Contacto"
                value={`${((general.contacted / general.totalLeads) * 100).toFixed(1)}%`}
                subtitle={`${general.contacted}/${general.totalLeads} contactados`}
                icon="📧"
                color="green"
              />

              <KPICard
                title="Con Email"
                value={general.withEmail}
                subtitle={`${general.withoutEmail} sin email`}
                icon="✉️"
                color="purple"
                percentage={(general.withEmail / general.totalLeads * 100).toFixed(1)}
              />
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Por Estado */}
              <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">📊 Distribución por Estado</h3>
                <div className="space-y-3">
                  {Object.entries(general.byStatus).map(([status, count]) => (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300 capitalize">{status}</span>
                        <span className="text-white font-semibold">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getStatusColor(status)}`}
                          style={{ width: `${(count / general.totalLeads) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Por Fuente */}
              <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">🎯 Distribución por Fuente</h3>
                <div className="space-y-3">
                  {Object.entries(general.bySource).map(([source, count]) => (
                    <div key={source}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{formatSource(source)}</span>
                        <span className="text-white font-semibold">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${(count / general.totalLeads) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Opportunity Scores */}
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">⭐ Distribución de Opportunity Scores</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ScoreCard
                  label="Alta (≥70)"
                  count={general.highOpportunity}
                  total={general.totalLeads}
                  color="from-red-500 to-orange-500"
                />
                <ScoreCard
                  label="Media (40-69)"
                  count={general.mediumOpportunity}
                  total={general.totalLeads}
                  color="from-yellow-500 to-orange-500"
                />
                <ScoreCard
                  label="Baja (<40)"
                  count={general.lowOpportunity}
                  total={general.totalLeads}
                  color="from-blue-500 to-cyan-500"
                />
              </div>
            </div>

            {/* Website & Email Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">🌐 Presencia Web</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Con Website</span>
                    <span className="text-white font-bold">{general.withWebsite}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Sin Website</span>
                    <span className="text-red-400 font-bold">{general.withoutWebsite}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700">
                    <div className="text-sm text-gray-400">
                      {((general.withoutWebsite / general.totalLeads) * 100).toFixed(1)}% de leads sin website
                      <span className="ml-2">= Alta oportunidad 🔥</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">📧 Emails</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Con Email</span>
                    <span className="text-white font-bold">{general.withEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Sin Email</span>
                    <span className="text-yellow-400 font-bold">{general.withoutEmail}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700">
                    <div className="text-sm text-gray-400">
                      {((general.withEmail / general.totalLeads) * 100).toFixed(1)}% con email verificable
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Sources View */}
        {activeView === 'sources' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-white mb-6">🎯 Análisis por Fuente de Leads</h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Fuente</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">Total</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">Score Promedio</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">Contactados</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">Tasa Contacto</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">Convertidos</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">Tasa Conversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((source, idx) => (
                      <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                        <td className="py-4 px-4 text-white font-medium">{formatSource(source.source)}</td>
                        <td className="py-4 px-4 text-right text-white">{source.totalLeads}</td>
                        <td className="py-4 px-4 text-right">
                          <span className={`font-semibold ${getScoreColor(source.avgOpportunityScore)}`}>
                            {source.avgOpportunityScore}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-white">{source.contacted}</td>
                        <td className="py-4 px-4 text-right text-cyan-400 font-semibold">{source.contactRate}</td>
                        <td className="py-4 px-4 text-right text-white">{source.converted}</td>
                        <td className="py-4 px-4 text-right text-green-400 font-semibold">{source.conversionRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Top Opportunities View */}
        {activeView === 'opportunities' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">🔥 Top 10 Oportunidades</h3>
                <span className="text-gray-400 text-sm">Ordenadas por opportunity score</span>
              </div>

              <div className="space-y-3">
                {topOpportunities.map((lead, idx) => (
                  <motion.div
                    key={lead._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`text-2xl font-bold ${getScoreColorText(lead.opportunityScore)}`}>
                          #{idx + 1}
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/admin/leads/${lead._id}`}
                            className="text-white font-semibold hover:text-cyan-400 transition"
                          >
                            {lead.name}
                          </Link>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-gray-400 text-sm">{lead.category || 'Sin categoría'}</span>
                            <span className="text-gray-400 text-sm">•</span>
                            <span className="text-gray-400 text-sm capitalize">{lead.status}</span>
                            {lead.website && (
                              <>
                                <span className="text-gray-400 text-sm">•</span>
                                <span className="text-cyan-400 text-sm">🌐 Website</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColorText(lead.opportunityScore)}`}>
                          {lead.opportunityScore}
                        </div>
                        <div className="text-gray-400 text-xs">Score</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Follow-ups View */}
        {activeView === 'followups' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">📞 Leads que Requieren Seguimiento</h3>
                <span className="text-red-400 text-sm font-semibold">{followUps.length} leads pendientes</span>
              </div>

              {followUps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-gray-400 text-lg">No hay leads pendientes de seguimiento</p>
                  <p className="text-gray-500 text-sm mt-2">¡Excelente trabajo!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {followUps.map((lead, idx) => (
                    <motion.div
                      key={lead._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition border-l-4 border-yellow-500"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/admin/leads/${lead._id}`}
                            className="text-white font-semibold hover:text-cyan-400 transition"
                          >
                            {lead.name}
                          </Link>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-gray-400 text-sm capitalize">{lead.status}</span>
                            <span className="text-gray-400 text-sm">•</span>
                            <span className="text-yellow-400 text-sm font-semibold">
                              ⚠️ {lead.daysSinceContact} días sin contacto
                            </span>
                            <span className="text-gray-400 text-sm">•</span>
                            <span className="text-gray-400 text-sm">
                              Score: {lead.opportunityScore}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/admin/leads/${lead._id}`}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition"
                        >
                          Contactar →
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Helper Components
function KPICard({ title, value, subtitle, icon, color, trend, percentage }) {
  const colorClasses = {
    blue: 'border-blue-500/20 hover:border-blue-500/40',
    red: 'border-red-500/20 hover:border-red-500/40',
    green: 'border-green-500/20 hover:border-green-500/40',
    purple: 'border-purple-500/20 hover:border-purple-500/40',
    yellow: 'border-yellow-500/20 hover:border-yellow-500/40'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-slate-800/50 backdrop-blur border ${colorClasses[color]} rounded-lg p-6 transition`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-3xl">{icon}</div>
        {percentage && (
          <div className="text-cyan-400 text-sm font-semibold">
            {percentage}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-gray-400 text-sm">{title}</div>
      {subtitle && (
        <div className="text-gray-500 text-xs mt-2">{subtitle}</div>
      )}
    </motion.div>
  );
}

function ScoreCard({ label, count, total, color }) {
  const percentage = ((count / total) * 100).toFixed(1);

  return (
    <div className="bg-slate-700/30 rounded-lg p-4">
      <div className="text-gray-300 text-sm mb-2">{label}</div>
      <div className="text-3xl font-bold text-white mb-2">{count}</div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full bg-gradient-to-r ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-gray-400 text-xs">{percentage}% del total</div>
    </div>
  );
}

// Helper Functions
function getStatusColor(status) {
  const colors = {
    new: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    contacted: 'bg-gradient-to-r from-green-500 to-emerald-500',
    interested: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    qualified: 'bg-gradient-to-r from-purple-500 to-pink-500',
    proposal: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    negotiation: 'bg-gradient-to-r from-orange-500 to-red-500',
    won: 'bg-gradient-to-r from-green-500 to-teal-500',
    lost: 'bg-gradient-to-r from-gray-500 to-slate-500',
    nurturing: 'bg-gradient-to-r from-blue-500 to-cyan-500'
  };
  return colors[status] || 'bg-gradient-to-r from-gray-500 to-slate-500';
}

function formatSource(source) {
  const formats = {
    google_maps: 'Google Maps',
    google_search: 'Google Search',
    instagram: 'Instagram',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    manual: 'Manual',
    referral: 'Referido',
    job_postings: 'Job Postings'
  };
  return formats[source] || source;
}

function getScoreColor(score) {
  if (score >= 70) return 'text-red-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-cyan-400';
}

function getScoreColorText(score) {
  if (score >= 70) return 'text-red-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-cyan-400';
}
