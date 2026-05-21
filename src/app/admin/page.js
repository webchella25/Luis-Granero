'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Target, TrendingUp, Mail, Phone, RefreshCw,
  ArrowRight, Users, Zap, Calendar, Briefcase,
  FileText, BarChart2, ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    leads: { total: 0, new: 0, contacted: 0, interested: 0, highOpportunity: 0 },
    sequences: { active: 0, total: 0, emailsSent: 0, openRate: 0 },
    appointments: { pending: 0, confirmed: 0, completed: 0, total: 0 },
    web: { services: 0, packages: 0, addons: 0, projects: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [leadsRes, sequencesRes, appointmentsRes] = await Promise.all([
        fetch('/api/leads/stats'),
        fetch('/api/sequences/stats'),
        fetch('/api/appointments/stats')
      ]);

      const leadsData = await leadsRes.json();
      const sequencesData = await sequencesRes.json();
      const appointmentsData = await appointmentsRes.json();

      setStats(prev => ({
        leads: leadsData.success ? leadsData.stats : prev.leads,
        sequences: sequencesData.success ? sequencesData.stats : prev.sequences,
        appointments: appointmentsData.success ? appointmentsData.stats : prev.appointments,
        web: prev.web
      }));

      const activity = [
        ...(leadsData.recentLeads || []).map(l => ({
          type: 'lead',
          title: `Nuevo lead: ${l.name}`,
          time: l.createdAt,
          icon: Target,
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10'
        })),
        ...(appointmentsData.recentAppointments || []).map(a => ({
          type: 'appointment',
          title: `Llamada agendada: ${a.name}`,
          time: a.createdAt,
          icon: Calendar,
          color: 'text-green-400',
          bg: 'bg-green-500/10'
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Cargando dashboard…</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Leads',
      value: stats.leads.total,
      sub: `+${stats.leads.new} nuevos`,
      subColor: 'text-cyan-400',
      icon: Target,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      href: '/admin/leads',
    },
    {
      label: 'Alta Oportunidad',
      value: stats.leads.highOpportunity,
      sub: 'Score > 70',
      subColor: 'text-slate-500',
      icon: TrendingUp,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10 border-red-500/20',
      href: '/admin/leads?filter=high',
    },
    {
      label: 'Emails Enviados',
      value: stats.sequences.emailsSent,
      sub: `${stats.sequences.openRate}% tasa apertura`,
      subColor: 'text-green-400',
      icon: Mail,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/10 border-green-500/20',
      href: '/admin/sequences',
    },
    {
      label: 'Llamadas Confirmadas',
      value: stats.appointments.confirmed,
      sub: `${stats.appointments.pending} pendientes`,
      subColor: 'text-slate-500',
      icon: Phone,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/10 border-yellow-500/20',
      href: '/admin/appointments',
    },
  ];

  const navCards = [
    { title: 'CRM Analytics', desc: 'Análisis completo del pipeline', href: '/admin/crm-analytics', icon: BarChart2, badge: 'Nuevo' },
    { title: 'Gestión de Leads', desc: 'Ver y filtrar todos tus leads', href: '/admin/leads', icon: Users, stat: `${stats.leads.total} leads` },
    { title: 'Secuencias Email', desc: 'Automatiza tu outreach', href: '/admin/sequences', icon: Zap, stat: `${stats.sequences.active} activas` },
    { title: 'Citas Agendadas', desc: 'Gestiona llamadas y reuniones', href: '/admin/appointments', icon: Calendar, stat: `${stats.appointments.confirmed} confirmadas` },
    { title: 'Portfolio', desc: 'Gestiona tus proyectos', href: '/admin/portfolio', icon: Briefcase, stat: `${stats.web.projects} proyectos` },
    { title: 'Blog & Contenido', desc: 'Publica artículos y tutoriales', href: '/admin/blog', icon: FileText },
  ];

  const pipelineItems = [
    { label: 'Nuevos', value: stats.leads.new, color: 'from-cyan-500 to-blue-500' },
    { label: 'Contactados', value: stats.leads.contacted, color: 'from-green-500 to-emerald-500' },
    { label: 'Interesados', value: stats.leads.interested, color: 'from-yellow-500 to-orange-500' },
  ];

  return (
    <div className="space-y-8 pb-8">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Vista general · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                href={kpi.href}
                className="block bg-[#0B1120] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${kpi.iconBg}`}>
                    <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
                  </div>
                  <span className={`text-xs font-medium ${kpi.subColor}`}>{kpi.sub}</span>
                </div>
                <div className="text-3xl font-bold text-slate-50 mb-1">{kpi.value}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{kpi.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent activity */}
        <div className="lg:col-span-2 bg-[#0B1120] border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-slate-200">Actividad Reciente</h2>
          </div>
          <div className="p-4 space-y-2">
            {recentActivity.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">No hay actividad reciente</p>
            ) : (
              recentActivity.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">{item.title}</p>
                      <p className="text-xs text-slate-600">
                        {new Date(item.time).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

        {/* Side panels */}
        <div className="space-y-4">

          {/* Acciones rápidas */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl">
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="font-semibold text-slate-200 text-sm">Acciones Rápidas</h3>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href="/admin/test-scraper"
                className="flex items-center gap-3 w-full px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 rounded-lg text-sm font-medium transition-all"
              >
                <Target className="w-4 h-4" />
                Buscar Leads
              </Link>
              <Link
                href="/admin/sequences"
                className="flex items-center gap-3 w-full px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-all"
              >
                <Zap className="w-4 h-4" />
                Nueva Secuencia
              </Link>
              <Link
                href="/admin/blog/new"
                className="flex items-center gap-3 w-full px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-all"
              >
                <FileText className="w-4 h-4" />
                Nuevo Artículo
              </Link>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl">
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="font-semibold text-slate-200 text-sm">Resumen</h3>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Leads contactados', value: stats.leads.contacted },
                { label: 'Interesados', value: stats.leads.interested },
                { label: 'Secuencias activas', value: stats.sequences.active },
                { label: 'Tasa apertura email', value: `${stats.sequences.openRate}%`, highlight: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.highlight ? 'text-green-400' : 'text-slate-300'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl">
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="font-semibold text-slate-200 text-sm">Pipeline</h3>
            </div>
            <div className="p-5 space-y-4">
              {pipelineItems.map(item => {
                const pct = stats.leads.total > 0
                  ? Math.round((item.value / stats.leads.total) * 100)
                  : 0
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-slate-400 font-medium">{item.value} <span className="text-slate-600">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Acceso rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {navCards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
              >
                <Link
                  href={card.href}
                  className="flex items-center gap-4 bg-[#0B1120] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/5 transition-all">
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-300 text-sm group-hover:text-slate-200 transition-colors">{card.title}</p>
                      {card.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded font-mono">{card.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 truncate">{card.stat || card.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
