'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Check, TrendingUp, Clock, Gift } from 'lucide-react';

export default function BudgetCalculator() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [showResult, setShowResult] = useState(false);
  
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/contact-page');
      const data = await res.json();
      setConfig(data.budgetCalculator);
      
      const normalTimeline = data.budgetCalculator.timelines.find(t => t.id === 'normal');
      if (normalTimeline) {
        setSelectedTimeline(normalTimeline);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBudget = () => {
    if (!selectedProject || !selectedTimeline) return { subtotal: 0, timelineAdjustment: 0, discount: null, total: 0 };

    let subtotal = selectedProject.basePrice;
    
    selectedFeatures.forEach(feature => {
      subtotal += feature.price;
    });

    const timelineAdjustment = subtotal * (selectedTimeline.multiplier - 1);
    let total = subtotal + timelineAdjustment;

    let appliedDiscount = null;
    if (config?.discounts) {
      const validDiscounts = config.discounts.filter(d => 
        d.enabled && total >= d.minAmount
      ).sort((a, b) => b.percentage - a.percentage);
      
      if (validDiscounts.length > 0) {
        appliedDiscount = validDiscounts[0];
        total = total - (total * appliedDiscount.percentage / 100);
      }
    }

    return {
      subtotal,
      timelineAdjustment,
      discount: appliedDiscount,
      total: Math.round(total)
    };
  };

  const budget = calculateBudget();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProject || !selectedTimeline) {
      alert('Por favor selecciona un tipo de proyecto y plazo');
      return;
    }

    setSending(true);

    try {
      const res = await fetch('/api/budget-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientInfo,
          budget: {
            projectType: selectedProject,
            selectedFeatures,
            timeline: selectedTimeline,
            appliedDiscount: budget.discount,
            subtotal: budget.subtotal,
            discount: budget.discount ? budget.subtotal * budget.discount.percentage / 100 : 0,
            timelineAdjustment: budget.timelineAdjustment,
            total: budget.total
          },
          message: clientInfo.message
        })
      });

      if (res.ok) {
        setSent(true);
        setTimeout(() => {
          setSent(false);
          setSelectedProject(null);
          setSelectedFeatures([]);
          setClientInfo({ name: '', email: '', phone: '', company: '', message: '' });
          setShowResult(false);
        }, 5000);
      } else {
        alert('Error al enviar. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (!config?.enabled) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-950" id="calculadora">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-8 h-8 text-cyan-400" />
              <div>
                <h3 className="text-2xl font-bold text-white">{config.title}</h3>
                <p className="text-gray-400">{config.subtitle}</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-12"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">¡Presupuesto Enviado!</h4>
                  <p className="text-gray-400">Te contactaré en 24-48 horas</p>
                </motion.div>
              ) : (
                <>
                  {/* Paso 1: Tipo de Proyecto */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      1. Tipo de Proyecto
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {config.projectTypes?.sort((a, b) => a.order - b.order).map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedProject(type)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            selectedProject?.id === type.id
                              ? 'border-cyan-400 bg-cyan-500/10'
                              : 'border-gray-700 hover:border-cyan-500/50'
                          }`}
                        >
                          <div className="font-semibold text-white mb-1">{type.name}</div>
                          <div className="text-sm text-gray-400 mb-2">{type.description}</div>
                          <div className="text-cyan-400 font-bold">{type.basePrice}€</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Paso 2: Características */}
                  {selectedProject && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8"
                    >
                      <h4 className="text-lg font-semibold text-white mb-4">
                        2. Características Adicionales
                      </h4>
                      
                      {['frontend', 'backend', 'seo', 'extra'].map(category => {
                        const categoryFeatures = config.features?.filter(f => f.category === category).sort((a, b) => a.order - b.order);
                        if (!categoryFeatures || categoryFeatures.length === 0) return null;
                        
                        return (
                          <div key={category} className="mb-6">
                            <h5 className="text-md font-medium text-cyan-400 mb-3 capitalize">
                              {category === 'frontend' ? 'Frontend' : 
                               category === 'backend' ? 'Backend' :
                               category === 'seo' ? 'SEO' : 'Extras'}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {categoryFeatures.map((feature) => {
                                const isSelected = selectedFeatures.some(f => f.id === feature.id);
                                return (
                                  <button
                                    key={feature.id}
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedFeatures(selectedFeatures.filter(f => f.id !== feature.id));
                                      } else {
                                        setSelectedFeatures([...selectedFeatures, feature]);
                                      }
                                    }}
                                    className={`p-3 rounded-lg border transition-all text-left flex items-start gap-3 ${
                                      isSelected
                                        ? 'border-cyan-400 bg-cyan-500/10'
                                        : 'border-gray-700 hover:border-cyan-500/50'
                                    }`}
                                  >
                                    <div className={`mt-1 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                                      isSelected ? 'bg-cyan-400' : 'border-2 border-gray-600'
                                    }`}>
                                      {isSelected && <Check className="w-3 h-3 text-gray-900" />}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-white">{feature.name}</span>
                                        <span className="text-cyan-400 font-semibold">
                                          {feature.price > 0 ? `+${feature.price}€` : 'Incluido'}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-400">{feature.description}</div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Paso 3: Plazo */}
                  {selectedProject && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8"
                    >
                      <h4 className="text-lg font-semibold text-white mb-4">
                        3. Plazo de Entrega
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {config.timelines?.sort((a, b) => a.order - b.order).map((timeline) => (
                          <button
                            key={timeline.id}
                            onClick={() => setSelectedTimeline(timeline)}
                            className={`p-4 rounded-xl border-2 transition-all text-center ${
                              selectedTimeline?.id === timeline.id
                                ? 'border-cyan-400 bg-cyan-500/10'
                                : 'border-gray-700 hover:border-cyan-500/50'
                            }`}
                          >
                            <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                            <div className="font-semibold text-white mb-1">{timeline.name}</div>
                            <div className="text-xs text-gray-400 mb-2">{timeline.description}</div>
                            {timeline.multiplier !== 1 && (
                              <div className={`text-sm font-bold ${
                                timeline.multiplier > 1 ? 'text-orange-400' : 'text-green-400'
                              }`}>
                                {timeline.multiplier > 1 ? '+' : ''}{((timeline.multiplier - 1) * 100).toFixed(0)}%
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Resumen */}
                  {selectedProject && selectedTimeline && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 rounded-xl p-6 mb-8"
                    >
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                        Resumen del Presupuesto
                      </h4>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-gray-300">
                          <span>Base ({selectedProject.name})</span>
                          <span>{selectedProject.basePrice}€</span>
                        </div>
                        
                        {selectedFeatures.map(feature => (
                          <div key={feature.id} className="flex justify-between text-gray-400 text-sm">
                            <span>+ {feature.name}</span>
                            <span>{feature.price}€</span>
                          </div>
                        ))}
                        
                        {budget.timelineAdjustment !== 0 && (
                          <div className={`flex justify-between text-sm ${
                            budget.timelineAdjustment > 0 ? 'text-orange-400' : 'text-green-400'
                          }`}>
                            <span>Ajuste plazo ({selectedTimeline.name})</span>
                            <span>{budget.timelineAdjustment > 0 ? '+' : ''}{Math.round(budget.timelineAdjustment)}€</span>
                          </div>
                        )}
                        
                        {budget.discount && (
                          <div className="flex justify-between text-green-400 text-sm">
                            <span className="flex items-center gap-1">
                              <Gift className="w-4 h-4" />
                              {budget.discount.name} (-{budget.discount.percentage}%)
                            </span>
                            <span>-{Math.round(budget.subtotal * budget.discount.percentage / 100)}€</span>
                          </div>
                        )}
                        
                        <div className="border-t border-gray-700 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-white">Total Estimado</span>
                            <span className="text-3xl font-bold text-cyan-400">{budget.total}€</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowResult(true)}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                      >
                        Solicitar Presupuesto Detallado
                      </button>
                    </motion.div>
                  )}

                  {/* Formulario */}
                  {showResult && (
                    <motion.form
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <h4 className="text-lg font-semibold text-white mb-4">
                        4. Tus Datos de Contacto
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Nombre *"
                          required
                          value={clientInfo.name}
                          onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
                        />
                        <input
                          type="email"
                          placeholder="Email *"
                          required
                          value={clientInfo.email}
                          onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
                        />
                        <input
                          type="tel"
                          placeholder="Teléfono"
                          value={clientInfo.phone}
                          onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Empresa"
                          value={clientInfo.company}
                          onChange={(e) => setClientInfo({...clientInfo, company: e.target.value})}
                          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      
                      <textarea
                        placeholder="Cuéntame más sobre tu proyecto..."
                        rows={4}
                        value={clientInfo.message}
                        onChange={(e) => setClientInfo({...clientInfo, message: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none resize-none"
                      />
                      
                      <button
                        type="submit"
                        disabled={sending}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? 'Enviando...' : `Enviar Solicitud (${budget.total}€)`}
                      </button>
                    </motion.form>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}