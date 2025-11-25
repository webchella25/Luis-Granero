// src/app/admin/leads/[id]/components/LeadEnrichment.js
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LeadEnrichment({ lead, onRefresh }) {
  const [enriching, setEnriching] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState(lead.enrichment || null);
  const [error, setError] = useState(null);

  const handleEnrich = async () => {
    setEnriching(true);
    setError(null);

    try {
      const res = await fetch(`/api/leads/${lead._id}/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          includeWebAnalysis: true,
          includeEmailFinding: true,
          includeReviews: true,
          includeCompetition: false, // Opcional, más lento
          includeSocialMedia: true,
          includeHiringActivity: false // Opcional, muy lento
        })
      });

      const data = await res.json();

      if (data.success) {
        setEnrichmentData(data.enrichment);
        if (onRefresh) onRefresh();
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error enriching lead:', err);
      setError(err.message);
    } finally {
      setEnriching(false);
    }
  };

  if (!enrichmentData && !enriching) {
    return (
      <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-bold text-white mb-2">
            Lead Enrichment Avanzado
          </h3>
          <p className="text-gray-400 mb-6">
            Analiza este lead con 10 sistemas de intelligence:
          </p>
          <ul className="text-gray-400 text-sm space-y-2 mb-6 text-left max-w-md mx-auto">
            <li>✅ Análisis completo de website (tech stack, inactividad)</li>
            <li>✅ Búsqueda y verificación de emails</li>
            <li>✅ Análisis de Google Reviews</li>
            <li>✅ Análisis de redes sociales (Facebook, LinkedIn)</li>
            <li>✅ Score de oportunidad calculado</li>
            <li>✅ Pitch personalizado generado</li>
          </ul>
          <button
            onClick={handleEnrich}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition"
          >
            🚀 Ejecutar Enrichment
          </button>
          <p className="text-gray-500 text-xs mt-3">
            ⚠️ Puede tardar 30-60 segundos
          </p>
        </div>
      </div>
    );
  }

  if (enriching) {
    return (
      <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-white mb-2">
            Analizando Lead...
          </h3>
          <p className="text-gray-400 mb-4">
            Ejecutando 10 sistemas de intelligence
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="animate-pulse">🔍 Analizando website...</div>
            <div className="animate-pulse delay-100">📧 Buscando emails...</div>
            <div className="animate-pulse delay-200">⭐ Analizando reviews...</div>
            <div className="animate-pulse delay-300">📱 Chequeando redes sociales...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur border border-red-500/20 rounded-lg p-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-white mb-2">Error en Enrichment</h3>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={handleEnrich}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">🎯 Lead Intelligence Report</h3>
            <p className="text-gray-400 text-sm mt-1">
              Generado: {new Date(enrichmentData.enrichedAt).toLocaleString('es-ES')}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(enrichmentData.finalScore)}`}>
              {enrichmentData.finalScore}
            </div>
            <div className="text-gray-400 text-xs">Score Final</div>
          </div>
        </div>
      </div>

      {/* Pitch Personalizado */}
      {enrichmentData.pitch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur border border-purple-500/30 rounded-lg p-6"
        >
          <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            💬 Pitch Personalizado
            {enrichmentData.pitch.urgency === 'high' && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                🔥 Alta Urgencia
              </span>
            )}
          </h4>
          <div className="space-y-3">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-white text-lg font-semibold">
                "{enrichmentData.pitch.mainMessage}"
              </p>
            </div>
            {enrichmentData.pitch.additionalPoints?.length > 0 && (
              <ul className="space-y-2">
                {enrichmentData.pitch.additionalPoints.map((point, idx) => (
                  <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            )}
            <div className="pt-3 border-t border-slate-700">
              <p className="text-cyan-400 font-semibold">
                💡 {enrichmentData.pitch.callToAction}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Opportunities */}
      {enrichmentData.opportunities?.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
          <h4 className="text-lg font-bold text-white mb-4">
            🔍 Oportunidades Detectadas ({enrichmentData.opportunities.length})
          </h4>
          <div className="space-y-3">
            {enrichmentData.opportunities.map((opp, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${getOpportunityBgColor(opp.type)}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-2xl ${getOpportunityIcon(opp.type)}`}>
                    {getOpportunityEmoji(opp.type)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getOpportunityBadge(opp.type)}`}>
                        {opp.type}
                      </span>
                      <span className="text-gray-400 text-xs">{opp.source}</span>
                    </div>
                    <p className="text-white">{opp.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {enrichmentData.recommendations?.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
          <h4 className="text-lg font-bold text-white mb-4">
            ✅ Recomendaciones ({enrichmentData.recommendations.length})
          </h4>
          <div className="space-y-2">
            {enrichmentData.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition"
              >
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(rec.priority)}`}>
                    {rec.priority}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm">{rec.message}</p>
                    {rec.action && (
                      <p className="text-cyan-400 text-xs mt-1">→ {rec.action}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Website Analysis */}
        {enrichmentData.website && (
          <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-3">🌐 Website Analysis</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Score</span>
                <span className={`font-bold ${getScoreColor(enrichmentData.website.finalScore)}`}>
                  {enrichmentData.website.finalScore}/100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Nivel</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getOpportunityBadge(enrichmentData.website.opportunityLevel)}`}>
                  {enrichmentData.website.opportunityLevel}
                </span>
              </div>
              {enrichmentData.website.issues?.length > 0 && (
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-gray-400 text-sm mb-2">Issues encontrados:</p>
                  <p className="text-red-400 text-sm">{enrichmentData.website.issues.length} problemas</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emails */}
        {enrichmentData.emails && (
          <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-3">📧 Emails</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Encontrados</span>
                <span className="text-white font-bold">{enrichmentData.emails.found?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Verificados</span>
                <span className="text-green-400 font-bold">{enrichmentData.emails.verified?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Personales</span>
                <span className="text-cyan-400 font-bold">{enrichmentData.emails.personal?.length || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        {enrichmentData.reviews && (
          <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-3">⭐ Google Reviews</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Rating</span>
                <span className="text-yellow-400 font-bold">
                  {enrichmentData.reviews.analysis?.overall?.avgRating || 0}/5
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Reviews</span>
                <span className="text-white font-bold">{enrichmentData.reviews.totalReviews || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Score Oportunidad</span>
                <span className={`font-bold ${getScoreColor(enrichmentData.reviews.opportunityScore)}`}>
                  {enrichmentData.reviews.opportunityScore || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Social Media */}
        {(enrichmentData.socialMedia?.facebook || enrichmentData.socialMedia?.linkedin) && (
          <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-3">📱 Redes Sociales</h4>
            <div className="space-y-2">
              {enrichmentData.socialMedia.facebook?.hasPresence && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Facebook</span>
                  <span className="text-blue-400">✅ Presente</span>
                </div>
              )}
              {enrichmentData.socialMedia.linkedin?.hasPresence && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">LinkedIn</span>
                  <span className="text-cyan-400">✅ Presente</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Re-enrich Button */}
      <div className="flex justify-center">
        <button
          onClick={handleEnrich}
          disabled={enriching}
          className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-semibold transition border border-cyan-500/30"
        >
          🔄 Re-ejecutar Enrichment
        </button>
      </div>
    </div>
  );
}

// Helper functions
function getScoreColor(score) {
  if (score >= 70) return 'text-red-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-cyan-400';
}

function getOpportunityBgColor(type) {
  const colors = {
    CRITICAL: 'bg-red-500/10 border border-red-500/30',
    HIGH: 'bg-orange-500/10 border border-orange-500/30',
    MEDIUM: 'bg-yellow-500/10 border border-yellow-500/30',
    LOW: 'bg-blue-500/10 border border-blue-500/30'
  };
  return colors[type] || 'bg-slate-700/30';
}

function getOpportunityEmoji(type) {
  const emojis = {
    CRITICAL: '🚨',
    HIGH: '🔥',
    MEDIUM: '⚠️',
    LOW: 'ℹ️'
  };
  return emojis[type] || '📌';
}

function getOpportunityIcon(type) {
  return '';
}

function getOpportunityBadge(type) {
  const badges = {
    CRITICAL: 'bg-red-500/20 text-red-400',
    HIGH: 'bg-orange-500/20 text-orange-400',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400',
    LOW: 'bg-blue-500/20 text-blue-400'
  };
  return badges[type] || 'bg-gray-500/20 text-gray-400';
}

function getPriorityColor(priority) {
  const colors = {
    critical: 'bg-red-500/20 text-red-400',
    high: 'bg-orange-500/20 text-orange-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-blue-500/20 text-blue-400'
  };
  return colors[priority] || 'bg-gray-500/20 text-gray-400';
}
