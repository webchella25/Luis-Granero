// src/app/admin/leads/[id]/components/LeadWebAnalysis.jsx
'use client';

export default function LeadWebAnalysis({ analysis }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        🔍 Análisis Web
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="text-gray-400 text-sm mb-2">Velocidad de carga</div>
          <div className={`text-2xl font-bold ${
            analysis.loadTime > 3000 ? 'text-red-400' :
            analysis.loadTime > 1500 ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {analysis.loadTime}ms
          </div>
        </div>
        
        <div>
          <div className="text-gray-400 text-sm mb-2">SSL/HTTPS</div>
          <div className={`text-2xl font-bold ${
            analysis.hasSSL ? 'text-green-400' : 'text-red-400'
          }`}>
            {analysis.hasSSL ? '✅ Sí' : '❌ No'}
          </div>
        </div>
        
        <div>
          <div className="text-gray-400 text-sm mb-2">Responsive</div>
          <div className={`text-2xl font-bold ${
            analysis.isResponsive ? 'text-green-400' : 'text-red-400'
          }`}>
            {analysis.isResponsive ? '✅ Sí' : '❌ No'}
          </div>
        </div>
      </div>
      
      {analysis.technologies?.length > 0 && (
        <div className="mt-6">
          <div className="text-gray-400 text-sm mb-3">Tecnologías detectadas</div>
          <div className="flex flex-wrap gap-2">
            {analysis.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.issues?.length > 0 && (
        <div className="mt-6">
          <div className="text-gray-400 text-sm mb-3">Problemas detectados</div>
          <div className="space-y-2">
            {analysis.issues.map((issue, index) => (
              <div
                key={index}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                ⚠️ {issue}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}