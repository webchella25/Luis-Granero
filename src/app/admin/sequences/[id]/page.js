// src/app/admin/sequences/[id]/page.js - NUEVO ARCHIVO
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SequenceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [sequence, setSequence] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSequenceDetail();
  }, [params.id]);

  const fetchSequenceDetail = async () => {
    try {
      const res = await fetch(`/api/sequences/${params.id}`);
      const data = await res.json();
      
      if (data.success) {
        setSequence(data.sequence);
        setEnrollments(data.enrollments);
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching sequence detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const pauseEnrollment = async (enrollmentId) => {
    try {
      const res = await fetch(`/api/sequences/enrollments/${enrollmentId}/pause`, {
        method: 'POST'
      });
      
      if (res.ok) {
        fetchSequenceDetail();
      }
    } catch (error) {
      console.error('Error pausing enrollment:', error);
    }
  };

  const resumeEnrollment = async (enrollmentId) => {
    try {
      const res = await fetch(`/api/sequences/enrollments/${enrollmentId}/resume`, {
        method: 'POST'
      });
      
      if (res.ok) {
        fetchSequenceDetail();
      }
    } catch (error) {
      console.error('Error resuming enrollment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Cargando detalles...</div>
      </div>
    );
  }

  if (!sequence) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Secuencia no encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              href="/admin/sequences"
              className="text-cyan-400 hover:text-cyan-300 mb-2 inline-block"
            >
              ← Volver a secuencias
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">
              {sequence.name}
            </h1>
            {sequence.description && (
              <p className="text-gray-400">{sequence.description}</p>
            )}
          </div>
          
          <Link
            href={`/admin/sequences/${sequence._id}/edit`}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            ✏️ Editar Secuencia
          </Link>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Emails Enviados</div>
            <div className="text-3xl font-bold text-white">
              {metrics?.emailsSent || 0}
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-green-500/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Tasa Apertura</div>
            <div className="text-3xl font-bold text-green-400">
              {metrics?.openRate || 0}%
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Tasa Clicks</div>
            <div className="text-3xl font-bold text-blue-400">
              {metrics?.clickRate || 0}%
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-yellow-500/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Activos</div>
            <div className="text-3xl font-bold text-yellow-400">
              {sequence.stats?.totalActive || 0}
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Completados</div>
            <div className="text-3xl font-bold text-purple-400">
              {sequence.stats?.totalCompleted || 0}
            </div>
          </div>
        </div>

        {/* Pasos de la secuencia */}
        <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            📋 Pasos de la Secuencia
          </h2>
          
          <div className="space-y-4">
            {sequence.steps?.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/50">
                  <span className="text-cyan-400 font-bold">{index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-semibold">
                      Día {step.day}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-cyan-400 text-sm">
                      {step.templateId}
                    </span>
                  </div>
                  {step.description && (
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  )}
                </div>
                
                <div className="text-gray-500 text-sm">
                  {step.day === 0 ? 'Inmediato' : `+${step.day} días`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de enrollments */}
        <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            👥 Leads en esta Secuencia ({enrollments.length})
          </h2>
          
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-400">
                Ningún lead inscrito en esta secuencia todavía
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment) => (
                <motion.div
                  key={enrollment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-cyan-500/30 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {enrollment.status === 'active' && (
                        <span className="inline-block w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                      )}
                      {enrollment.status === 'paused' && (
                        <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full"></span>
                      )}
                      {enrollment.status === 'completed' && (
                        <span className="inline-block w-3 h-3 bg-blue-400 rounded-full"></span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <Link
                        href={`/admin/leads/${enrollment.leadId?._id}`}
                        className="text-white font-semibold hover:text-cyan-400 transition"
                      >
                        {enrollment.leadId?.name || 'Lead eliminado'}
                      </Link>
                      <div className="text-sm text-gray-400 mt-1">
                        <span>Paso {enrollment.currentStep + 1} de {sequence.steps.length}</span>
                        <span className="mx-2">•</span>
                        <span>Iniciado: {new Date(enrollment.startedAt).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        enrollment.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                        enrollment.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                        enrollment.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                      }`}>
                        {enrollment.status === 'active' ? '🟢 Activo' :
                         enrollment.status === 'paused' ? '⏸️ Pausado' :
                         enrollment.status === 'completed' ? '✅ Completado' :
                         '❌ Fallido'}
                      </div>
                      
                      {enrollment.pauseReason && (
                        <div className="text-xs text-gray-500 mt-1">
                          {enrollment.pauseReason}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {enrollment.status === 'active' && (
                      <button
                        onClick={() => pauseEnrollment(enrollment._id)}
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm transition"
                        title="Pausar secuencia"
                      >
                        ⏸️
                      </button>
                    )}
                    
                    {enrollment.status === 'paused' && (
                      <button
                        onClick={() => resumeEnrollment(enrollment._id)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition"
                        title="Reanudar secuencia"
                      >
                        ▶️
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}