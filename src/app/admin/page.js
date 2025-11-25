// src/app/admin/page.js - DASHBOARD ACTUALIZADO COMPLETO
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    // CRM Stats
    leads: {
      total: 0,
      new: 0,
      contacted: 0,
      interested: 0,
      highOpportunity: 0
    },
    sequences: {
      active: 0,
      total: 0,
      emailsSent: 0,
      openRate: 0
    },
    appointments: {
      pending: 0,
      confirmed: 0,
      completed: 0,
      total: 0
    },
    // Web Stats
    web: {
      services: 0,
      packages: 0,
      addons: 0,
      projects: 0
    }
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Actualizar cada 30 segundos
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

      setStats({
        leads: leadsData.success ? leadsData.stats : stats.leads,
        sequences: sequencesData.success ? sequencesData.stats : stats.sequences,
        appointments: appointmentsData.success ? appointmentsData.stats : stats.appointments,
        web: stats.web
      });

      // Combinar actividad reciente
      const activity = [
        ...(leadsData.recentLeads || []).map(l => ({
          type: 'lead',
          title: `Nuevo lead: ${l.name}`,
          time: l.createdAt,
          icon: '🎯',
          color: 'blue'
        })),
        ...(appointmentsData.recentAppointments || []).map(a => ({
          type: 'appointment',
          title: `Llamada agendada: ${a.name}`,
          time: a.createdAt,
          icon: '📅',
          color: 'green'
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Dashboard CRM
          </h1>
          <p className="text-gray-400">
            Vista general de tu negocio • Actualizado hace {new Date().toLocaleTimeString('es-ES')}
          </p>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Leads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🎯</div>
              <div className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-semibold">
                +{stats.leads.new} nuevos
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.leads.total}
            </div>
            <div className="text-gray-400 text-sm">Total Leads</div>
            <Link href="/admin/leads" className="text-cyan-400 text-xs hover:text-cyan-300 mt-2 inline-block">
              Ver todos →
            </Link>
          </motion.div>

          {/* Leads Alta Oportunidad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur border border-red-500/20 rounded-lg p-6 hover:border-red-500/40 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🔥</div>
              <div className="text-xs text-gray-400">Score &gt; 70</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.leads.highOpportunity}
            </div>
            <div className="text-gray-400 text-sm">Alta Oportunidad</div>
            <Link href="/admin/leads?filter=high" className="text-red-400 text-xs hover:text-red-300 mt-2 inline-block">
              Revisar →
            </Link>
          </motion.div>

          {/* Emails Enviados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur border border-green-500/20 rounded-lg p-6 hover:border-green-500/40 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📧</div>
              <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                {stats.sequences.openRate}% abiertos
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.sequences.emailsSent}
            </div>
            <div className="text-gray-400 text-sm">Emails Enviados</div>
            <Link href="/admin/sequences" className="text-green-400 text-xs hover:text-green-300 mt-2 inline-block">
              Ver secuencias →
            </Link>
          </motion.div>

          {/* Llamadas Agendadas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 backdrop-blur border border-yellow-500/20 rounded-lg p-6 hover:border-yellow-500/40 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📞</div>
              <div className="text-xs text-gray-400">{stats.appointments.pending} pendientes</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.appointments.confirmed}
            </div>
            <div className="text-gray-400 text-sm">Llamadas Confirmadas</div>
            <Link href="/admin/appointments" className="text-yellow-400 text-xs hover:text-yellow-300 mt-2 inline-block">
              Ver agenda →
            </Link>
          </motion.div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Actividad Reciente */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">📈 Actividad Reciente</h2>
                <button 
                  onClick={fetchDashboardData}
                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  🔄 Actualizar
                </button>
              </div>

              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No hay actividad reciente</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition"
                    >
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.title}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(activity.time).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            
            {/* Acciones Rápidas */}
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">⚡ Acciones Rápidas</h3>
              
              <div className="space-y-3">
                <Link
                  href="/admin/test-scraper"
                  className="block px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition text-center"
                >
                  🔍 Buscar Leads
                </Link>
                
                <Link
                  href="/admin/sequences"
                  className="block px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition text-center"
                >
                  🚀 Nueva Secuencia
                </Link>
                
                <Link
                  href="/admin/email-templates"
                  className="block px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition text-center"
                >
                  📧 Crear Template
                </Link>
              </div>
            </div>

            {/* Stats Secundarios */}
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">📊 Resumen Semanal</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Leads Contactados</span>
                  <span className="text-white font-semibold">{stats.leads.contacted}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Interesados</span>
                  <span className="text-white font-semibold">{stats.leads.interested}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Secuencias Activas</span>
                  <span className="text-white font-semibold">{stats.sequences.active}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tasa Apertura</span>
                  <span className="text-green-400 font-semibold">{stats.sequences.openRate}%</span>
                </div>
              </div>
            </div>

            {/* Pipeline Visual */}
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Pipeline</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Nuevos</span>
                    <span className="text-white">{stats.leads.new}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{ width: `${(stats.leads.new / stats.leads.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Contactados</span>
                    <span className="text-white">{stats.leads.contacted}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${(stats.leads.contacted / stats.leads.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Interesados</span>
                    <span className="text-white">{stats.leads.interested}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                      style={{ width: `${(stats.leads.interested / stats.leads.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Navegación */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <NavigationCard
            title="CRM Analytics Avanzado"
            description="Análisis completo del pipeline de leads"
            href="/admin/crm-analytics"
            icon="📈"
            color="from-cyan-400 to-blue-600"
            stats="✨ Nuevo!"
          />

          <NavigationCard
            title="Gestión de Leads"
            description="Ver, filtrar y gestionar todos tus leads"
            href="/admin/leads"
            icon="📊"
            color="from-blue-500 to-indigo-600"
            stats={`${stats.leads.total} leads`}
          />
          
          <NavigationCard
            title="Secuencias de Email"
            description="Automatiza tu outreach con secuencias"
            href="/admin/sequences"
            icon="🚀"
            color="from-green-500 to-emerald-500"
            stats={`${stats.sequences.active} activas`}
          />
          
          <NavigationCard
            title="Citas Agendadas"
            description="Gestiona tus llamadas y reuniones"
            href="/admin/appointments"
            icon="📅"
            color="from-yellow-500 to-orange-500"
            stats={`${stats.appointments.confirmed} confirmadas`}
          />
          
          <NavigationCard
            title="Templates de Email"
            description="Crea y edita plantillas de emails"
            href="/admin/email-templates"
            icon="📧"
            color="from-purple-500 to-pink-500"
            stats={`Personaliza mensajes`}
          />
          
          <NavigationCard
            title="Portfolio & Proyectos"
            description="Gestiona tu portfolio profesional"
            href="/admin/projects"
            icon="💼"
            color="from-indigo-500 to-purple-500"
            stats={`${stats.web.projects} proyectos`}
          />
          
          <NavigationCard
            title="Blog & Contenido"
            description="Publica artículos y tutoriales"
            href="/admin/blog"
            icon="📝"
            color="from-pink-500 to-rose-500"
            stats="Contenido técnico"
          />
        </div>
      </div>
    </div>
  );
}

// Componente de Tarjeta de Navegación
function NavigationCard({ title, description, href, icon, color, stats }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition cursor-pointer h-full"
      >
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center text-2xl mb-4`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-cyan-400 text-sm font-semibold">{stats}</span>
          <span className="text-cyan-400">→</span>
        </div>
      </motion.div>
    </Link>
  );
}