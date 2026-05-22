'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Award, BookOpen, Briefcase, Calendar, FileText,
  GraduationCap, Mail, MessageSquare, RefreshCw, Settings, Wrench
} from 'lucide-react';

const emptyStats = {
  web: { posts: 0, projects: 0, messages: 0 },
  appointments: { pending: 0, confirmed: 0, completed: 0, total: 0 },
  students: { totalStudents: 0, activeStudents: 0, totalEnrollments: 0, totalCertificates: 0 }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(emptyStats);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchJson = async (url, fallback) => {
    const response = await fetch(url);
    if (!response.ok) return fallback;
    return response.json();
  };

  const fetchDashboardData = async () => {
    try {
      const [webData, appointmentsData, studentsData, activityData] = await Promise.all([
        fetchJson('/api/admin/stats', {}),
        fetchJson('/api/appointments/stats', {}),
        fetchJson('/api/admin/students/analytics', {}),
        fetchJson('/api/admin/recent-activity', [])
      ]);

      setStats({
        web: {
          posts: webData.posts || 0,
          projects: webData.projects || 0,
          messages: webData.messages || 0
        },
        appointments: appointmentsData.success ? appointmentsData.stats : emptyStats.appointments,
        students: studentsData.success ? studentsData.overview : emptyStats.students
      });

      const appointmentActivity = appointmentsData.recentAppointments?.map((appointment) => ({
        type: 'appointment',
        title: `Cita agendada: ${appointment.name}`,
        time: appointment.createdAt,
        icon: Calendar,
        color: 'text-green-400',
        bg: 'bg-green-500/10'
      })) || [];

      const contentActivity = Array.isArray(activityData)
        ? activityData.map((item) => ({
            type: item.type,
            title: item.description,
            timeLabel: item.time,
            icon: Briefcase,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10'
          }))
        : [];

      setRecentActivity([...appointmentActivity, ...contentActivity].slice(0, 10));
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
          <p className="text-slate-500 text-sm">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Artículos',
      value: stats.web.posts,
      sub: 'Blog público',
      icon: FileText,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      href: '/admin/blog'
    },
    {
      label: 'Proyectos',
      value: stats.web.projects,
      sub: 'Portfolio',
      icon: Briefcase,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/10 border-violet-500/20',
      href: '/admin/portfolio'
    },
    {
      label: 'Citas confirmadas',
      value: stats.appointments.confirmed,
      sub: `${stats.appointments.pending} pendientes`,
      icon: Calendar,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/10 border-green-500/20',
      href: '/admin/appointments'
    },
    {
      label: 'Estudiantes',
      value: stats.students.totalStudents,
      sub: `${stats.students.activeStudents} activos`,
      icon: GraduationCap,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      href: '/admin/estudiantes'
    }
  ];

  const navCards = [
    { title: 'Blog', desc: 'Publica artículos y tutoriales', href: '/admin/blog', icon: FileText },
    { title: 'Portfolio', desc: 'Gestiona proyectos públicos', href: '/admin/portfolio', icon: Briefcase },
    { title: 'Servicios', desc: 'Mantén la oferta pública', href: '/admin/services', icon: Wrench },
    { title: 'Citas Agendadas', desc: 'Gestiona llamadas de la web', href: '/admin/appointments', icon: Calendar, stat: `${stats.appointments.total} citas` },
    { title: 'Mensajes', desc: 'Revisa formularios de contacto', href: '/admin/messages', icon: MessageSquare },
    { title: 'Estudiantes', desc: 'Dashboard de alumnos', href: '/admin/estudiantes', icon: GraduationCap, stat: `${stats.students.totalEnrollments} inscripciones` },
    { title: 'Rutas de Aprendizaje', desc: 'Organiza contenidos educativos', href: '/admin/learning-paths', icon: BookOpen },
    { title: 'Cursos Email', desc: 'Gestiona cursos por email', href: '/admin/email-courses', icon: Mail },
    { title: 'Configuración', desc: 'Ajustes del sitio público', href: '/admin/settings', icon: Settings }
  ];

  const summary = [
    { label: 'Citas totales', value: stats.appointments.total },
    { label: 'Citas completadas', value: stats.appointments.completed },
    { label: 'Inscripciones', value: stats.students.totalEnrollments },
    { label: 'Certificados', value: stats.students.totalCertificates }
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Contenido web, cursos, estudiantes y citas publicas
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
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
                  <span className="text-xs font-medium text-slate-500">{kpi.sub}</span>
                </div>
                <div className="text-3xl font-bold text-slate-50 mb-1">{kpi.value}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{kpi.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0B1120] border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-slate-200">Actividad reciente</h2>
          </div>
          <div className="p-4 space-y-2">
            {recentActivity.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">No hay actividad reciente</p>
            ) : (
              recentActivity.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={`${item.type}-${i}`}
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
                        {item.time ? new Date(item.time).toLocaleString('es-ES') : item.timeLabel}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl">
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="font-semibold text-slate-200 text-sm">Acciones rapidas</h3>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href="/admin/blog/new"
                className="flex items-center gap-3 w-full px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 rounded-lg text-sm font-medium transition-all"
              >
                <FileText className="w-4 h-4" />
                Nuevo articulo
              </Link>
              <Link
                href="/admin/portfolio/new"
                className="flex items-center gap-3 w-full px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-all"
              >
                <Briefcase className="w-4 h-4" />
                Nuevo proyecto
              </Link>
              <Link
                href="/admin/certificados"
                className="flex items-center gap-3 w-full px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-all"
              >
                <Award className="w-4 h-4" />
                Certificados
              </Link>
            </div>
          </div>

          <div className="bg-[#0B1120] border border-slate-800 rounded-xl">
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="font-semibold text-slate-200 text-sm">Resumen</h3>
            </div>
            <div className="p-5 space-y-3">
              {summary.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-300">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Acceso rapido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {navCards.map((card, i) => {
            const Icon = card.icon;
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
                    <p className="font-medium text-slate-300 text-sm group-hover:text-slate-200 transition-colors">{card.title}</p>
                    <p className="text-xs text-slate-600 truncate">{card.stat || card.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
