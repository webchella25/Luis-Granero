'use client';

import { Zap, Shield, Smartphone, AlertTriangle, CheckCircle } from 'lucide-react';

export default function LeadWebAnalysis({ analysis }) {
  const metrics = [
    {
      label: 'Velocidad',
      value: analysis.loadTime ? `${analysis.loadTime}ms` : 'N/A',
      icon: Zap,
      ok: analysis.loadTime ? analysis.loadTime < 2000 : null,
    },
    {
      label: 'SSL/HTTPS',
      value: analysis.hasSSL ? 'Sí' : 'No',
      icon: Shield,
      ok: analysis.hasSSL ?? null,
    },
    {
      label: 'Responsive',
      value: analysis.isResponsive ? 'Sí' : 'No',
      icon: Smartphone,
      ok: analysis.isResponsive ?? null,
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Análisis Web</h2>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          const color = m.ok === null ? 'text-slate-500' : m.ok ? 'text-green-400' : 'text-red-400';
          return (
            <div key={m.label} className="bg-slate-800 rounded-lg p-3 text-center">
              <Icon className={`w-4 h-4 mx-auto mb-1.5 ${color}`} />
              <div className={`text-sm font-semibold ${color}`}>{m.value}</div>
              <div className="text-xs text-slate-600 mt-0.5">{m.label}</div>
            </div>
          );
        })}
      </div>

      {/* Technologies */}
      {analysis.technologies?.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-slate-600 mb-2">Tecnologías detectadas</div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.technologies.map((tech, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {analysis.issues?.length > 0 && (
        <div>
          <div className="text-xs text-slate-600 mb-2">Problemas detectados</div>
          <div className="space-y-1.5">
            {analysis.issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-red-500/5 border border-red-500/20 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-xs text-red-300">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No issues */}
      {(!analysis.issues || analysis.issues.length === 0) && (
        <div className="flex items-center gap-2 p-2.5 bg-green-500/5 border border-green-500/20 rounded-lg">
          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs text-green-300">Sin problemas críticos detectados</span>
        </div>
      )}
    </div>
  );
}
