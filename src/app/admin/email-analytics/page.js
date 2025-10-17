// src/app/admin/email-analytics/page.js - DASHBOARD DE TRACKING
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EmailAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [recentEmails, setRecentEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, all

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/email-analytics?range=${timeRange}`);
      const data = await res.json();
      
      setAnalytics(data.analytics);
      setRecentEmails(data.recentEmails);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/leads" 
          className="text-cyan-400 hover:text-cyan-300 text-sm mb-4 inline-block"
        >
          ← Volver a Leads
        </Link>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              📊 Email Analytics
            </h1>
            <p className="text-gray-400">
              Tracking de apertura y clicks en tiempo real
            </p>
          </div>
          
          {/* Selector de rango */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-cyan-500/30"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="all">Todo el tiempo</option>
          </select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total enviados */}
        <MetricCard
          title="Emails Enviados"
          value={analytics?.totalSent || 0}
          icon="📧"
          color="blue"
        />
        
        {/* Tasa de apertura */}
        <MetricCard
          title="Tasa de Apertura"
          value={`${analytics?.openRate || 0}%`}
          subtitle={`${analytics?.totalOpened || 0} abiertos`}
          icon="📬"
          color="green"
          trend={analytics?.openRate > 20 ? 'up' : 'neutral'}
        />
        
        {/* Tasa de clicks */}
        <MetricCard
          title="Tasa de Clicks"
          value={`${analytics?.clickRate || 0}%`}
          subtitle={`${analytics?.totalClicked || 0} clicks`}
          icon="🖱️"
          color="cyan"
          trend={analytics?.clickRate > 5 ? 'up' : 'neutral'}
        />
        
        {/* Engagement Score */}
        <MetricCard
          title="Engagement Score"
          value={`${analytics?.engagementScore || 0}/100`}
          icon="🎯"
          color="purple"
        />
      </div>

      {/* Gráfica de engagement */}
      <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          📈 Engagement por Día
        </h2>
        
        {analytics?.dailyStats?.length > 0 ? (
          <div className="space-y-3">
            {analytics.dailyStats.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="text-gray-400 text-sm w-24">
                  {new Date(day.date).toLocaleDateString('es-ES')}
                </div>
                
                <div className="flex-1">
                  <div className="flex gap-2">
                    {/* Barra de enviados */}
                    <div 
                      className="bg-blue-500/30 h-8 rounded flex items-center justify-center text-xs text-white"
                      style={{ width: `${(day.sent / analytics.totalSent) * 100}%` }}
                    >
                      {day.sent} enviados
                    </div>
                    
                    {/* Barra de abiertos */}
                    <div 
                      className="bg-green-500/30 h-8 rounded flex items-center justify-center text-xs text-white"
                      style={{ width: `${(day.opened / analytics.totalSent) * 100}%` }}
                    >
                      {day.opened} abiertos
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No hay datos suficientes</p>
        )}
      </div>

      {/* Emails recientes con tracking */}
      <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          🔥 Actividad Reciente
        </h2>
        
        <div className="space-y-4">
          {recentEmails.length > 0 ? (
            recentEmails.map((email) => (
              <EmailActivityCard key={email._id} email={email} />
            ))
          ) : (
            <p className="text-gray-400">No hay actividad reciente</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de métrica
function MetricCard({ title, value, subtitle, icon, color, trend }) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur border rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        {trend === 'up' && <span className="text-green-400 text-sm">📈</span>}
      </div>
      
      <div className="text-gray-400 text-sm mb-1">{title}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {subtitle && (
        <div className="text-gray-500 text-xs">{subtitle}</div>
      )}
    </div>
  );
}

// Componente de actividad de email
function EmailActivityCard({ email }) {
  const formatTime = (date) => {
    if (!date) return 'Pendiente';
    const now = new Date();
    const emailDate = new Date(date);
    const diffMinutes = Math.floor((now - emailDate) / 1000 / 60);
    
    if (diffMinutes < 60) return `Hace ${diffMinutes}m`;
    if (diffMinutes < 1440) return `Hace ${Math.floor(diffMinutes / 60)}h`;
    return `Hace ${Math.floor(diffMinutes / 1440)}d`;
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition">
      
      {/* Status icon */}
      <div className="text-3xl">
        {email.clicked && '🎯'}
        {!email.clicked && email.opened && '📬'}
        {!email.opened && '📧'}
      </div>
      
      {/* Info */}
      <div className="flex-1">
        <div className="font-semibold text-white">{email.emailTo}</div>
        <div className="text-sm text-gray-400">{email.subject}</div>
        
        <div className="flex gap-4 mt-2 text-xs">
          {email.sentAt && (
            <span className="text-gray-500">
              Enviado: {formatTime(email.sentAt)}
            </span>
          )}
          
          {email.openedAt && (
            <span className="text-green-400">
              ✓ Abierto: {formatTime(email.openedAt)}
            </span>
          )}
          
          {email.clickedAt && (
            <span className="text-cyan-400">
              ✓ Click: {formatTime(email.clickedAt)}
            </span>
          )}
        </div>
      </div>
      
      {/* Stats */}
      <div className="text-right">
        <div className="text-gray-400 text-xs">Engagement</div>
        <div className="text-white font-bold">
          {email.openCount || 0} aperturas
        </div>
        <div className="text-gray-400 text-xs">
          {email.clickCount || 0} clicks
        </div>
      </div>
    </div>
  );
}
