'use client';

import { useState, useEffect } from 'react';

function BudgetCalculator() {
  const [selections, setSelections] = useState({
    projectType: '',
    complexity: '',
    design: '',
    features: [],
    timeline: '',
    support: ''
  });
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

  const projectTypes = [
    { id: 'landing', label: 'Landing Page', basePrice: 1500, icon: '📄' },
    { id: 'corporate', label: 'Web Corporativa', basePrice: 3500, icon: '🏢' },
    { id: 'ecommerce', label: 'E-commerce', basePrice: 5000, icon: '🛒' },
    { id: 'webapp', label: 'Aplicación Web', basePrice: 8000, icon: '💻' },
    { id: 'dashboard', label: 'Dashboard', basePrice: 6000, icon: '📊' }
  ];

  const complexityLevels = [
    { id: 'basic', label: 'Básico', multiplier: 1, desc: 'Funcionalidades estándar' },
    { id: 'medium', label: 'Intermedio', multiplier: 1.5, desc: 'Funcionalidades personalizadas' },
    { id: 'advanced', label: 'Avanzado', multiplier: 2.2, desc: 'Lógica compleja y integraciones' }
  ];

  const designOptions = [
    { id: 'template', label: 'Basado en template', multiplier: 1, desc: 'Adaptación de diseño existente' },
    { id: 'custom', label: 'Diseño personalizado', multiplier: 1.3, desc: 'Diseño único desde cero' },
    { id: 'premium', label: 'Diseño premium', multiplier: 1.6, desc: 'Diseño de alta gama con animaciones' }
  ];

  const additionalFeatures = [
    { id: 'cms', label: 'Panel de administración', price: 800 },
    { id: 'blog', label: 'Blog integrado', price: 600 },
    { id: 'multilang', label: 'Multi-idioma', price: 900 },
    { id: 'seo', label: 'SEO avanzado', price: 500 },
    { id: 'analytics', label: 'Analytics personalizado', price: 400 },
    { id: 'integrations', label: 'Integraciones API', price: 700 },
    { id: 'payment', label: 'Pasarelas de pago', price: 1000 },
    { id: 'membership', label: 'Sistema de usuarios', price: 1200 }
  ];

  const timelineOptions = [
    { id: 'rush', label: 'Express (1-2 semanas)', multiplier: 1.5, desc: 'Entrega urgente' },
    { id: 'normal', label: 'Normal (3-4 semanas)', multiplier: 1, desc: 'Timeline estándar' },
    { id: 'extended', label: 'Relajado (6+ semanas)', multiplier: 0.9, desc: 'Sin prisa' }
  ];

  const supportOptions = [
    { id: 'basic', label: '1 mes incluido', price: 0, desc: 'Soporte básico' },
    { id: 'extended', label: '3 meses', price: 300, desc: 'Soporte extendido' },
    { id: 'premium', label: '6 meses', price: 500, desc: 'Soporte premium' },
    { id: 'annual', label: '12 meses', price: 800, desc: 'Soporte anual' }
  ];

  useEffect(() => {
    calculatePrice();
  }, [selections]);

  const calculatePrice = () => {
    if (!selections.projectType) {
      setEstimatedPrice(0);
      setPriceRange({ min: 0, max: 0 });
      return;
    }

    const baseProject = projectTypes.find(p => p.id === selections.projectType);
    let price = baseProject.basePrice;

    // Apply complexity multiplier
    if (selections.complexity) {
      const complexity = complexityLevels.find(c => c.id === selections.complexity);
      price *= complexity.multiplier;
    }

    // Apply design multiplier
    if (selections.design) {
      const design = designOptions.find(d => d.id === selections.design);
      price *= design.multiplier;
    }

    // Add features
    selections.features.forEach(featureId => {
      const feature = additionalFeatures.find(f => f.id === featureId);
      if (feature) price += feature.price;
    });

    // Apply timeline multiplier
    if (selections.timeline) {
      const timeline = timelineOptions.find(t => t.id === selections.timeline);
      price *= timeline.multiplier;
    }

    // Add support
    if (selections.support) {
      const support = supportOptions.find(s => s.id === selections.support);
      price += support.price;
    }

    setEstimatedPrice(Math.round(price));
    setPriceRange({
      min: Math.round(price * 0.85),
      max: Math.round(price * 1.15)
    });
  };

  const handleSelectionChange = (category, value) => {
    setSelections(prev => ({ ...prev, [category]: value }));
  };

  const handleFeatureToggle = (featureId) => {
    setSelections(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(id => id !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const resetCalculator = () => {
    setSelections({
      projectType: '',
      complexity: '',
      design: '',
      features: [],
      timeline: '',
      support: ''
    });
  };

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Calculadora de Presupuesto
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Obtén una estimación instantánea del coste de tu proyecto web
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calculator form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project type */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">1. Tipo de proyecto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectTypes.map((type) => (
                    <label key={type.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="projectType"
                        value={type.id}
                        onChange={(e) => handleSelectionChange('projectType', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-lg border transition-all duration-300 ${
                        selections.projectType === type.id
                          ? 'border-cyan-400 bg-cyan-400/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <div className="font-semibold text-white">{type.label}</div>
                            <div className="text-sm text-gray-400">Desde {type.basePrice}€</div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Complexity */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">2. Complejidad</h3>
                <div className="space-y-3">
                  {complexityLevels.map((level) => (
                    <label key={level.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="complexity"
                        value={level.id}
                        onChange={(e) => handleSelectionChange('complexity', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-lg border transition-all duration-300 ${
                        selections.complexity === level.id
                          ? 'border-cyan-400 bg-cyan-400/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{level.label}</div>
                            <div className="text-sm text-gray-400">{level.desc}</div>
                          </div>
                          <div className="text-cyan-400 font-bold">×{level.multiplier}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Design */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">3. Diseño</h3>
                <div className="space-y-3">
                  {designOptions.map((design) => (
                    <label key={design.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="design"
                        value={design.id}
                        onChange={(e) => handleSelectionChange('design', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-lg border transition-all duration-300 ${
                        selections.design === design.id
                          ? 'border-cyan-400 bg-cyan-400/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{design.label}</div>
                            <div className="text-sm text-gray-400">{design.desc}</div>
                          </div>
                          <div className="text-cyan-400 font-bold">×{design.multiplier}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">4. Funcionalidades adicionales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {additionalFeatures.map((feature) => (
                    <label key={feature.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={selections.features.includes(feature.id)}
                        onChange={() => handleFeatureToggle(feature.id)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-colors ${
                        selections.features.includes(feature.id)
                          ? 'bg-cyan-400 border-cyan-400'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}>
                        {selections.features.includes(feature.id) && (
                          <svg className="w-3 h-3 text-black mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-white">{feature.label}</span>
                        <span className="text-cyan-400 ml-2">+{feature.price}€</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">5. Timeline</h3>
                <div className="space-y-3">
                  {timelineOptions.map((timeline) => (
                    <label key={timeline.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="timeline"
                        value={timeline.id}
                        onChange={(e) => handleSelectionChange('timeline', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-lg border transition-all duration-300 ${
                        selections.timeline === timeline.id
                          ? 'border-cyan-400 bg-cyan-400/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{timeline.label}</div>
                            <div className="text-sm text-gray-400">{timeline.desc}</div>
                          </div>
                          <div className="text-cyan-400 font-bold">×{timeline.multiplier}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Support */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">6. Soporte técnico</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supportOptions.map((support) => (
                    <label key={support.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="support"
                        value={support.id}
                        onChange={(e) => handleSelectionChange('support', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-lg border transition-all duration-300 ${
                        selections.support === support.id
                          ? 'border-cyan-400 bg-cyan-400/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}>
                        <div className="text-center">
                          <div className="font-semibold text-white">{support.label}</div>
                          <div className="text-sm text-gray-400">{support.desc}</div>
                          <div className="text-cyan-400 font-bold">
                            {support.price === 0 ? 'Incluido' : `+${support.price}€`}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Price estimate */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Price display */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 text-center">
                  <h3 className="text-xl font-bold text-white mb-6">Estimación del proyecto</h3>
                  
                  {estimatedPrice > 0 ? (
                    <>
                      <div className="mb-6">
                        <div className="text-4xl font-bold gradient-text mb-2">
                          {estimatedPrice.toLocaleString()}€
                        </div>
                        <div className="text-sm text-gray-400">
                          Rango: {priceRange.min.toLocaleString()}€ - {priceRange.max.toLocaleString()}€
                        </div>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="text-left">
                          <h4 className="font-semibold text-white mb-3">Incluye:</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400">✓</span>
                              <span className="text-gray-300">Desarrollo completo</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400">✓</span>
                              <span className="text-gray-300">Diseño responsive</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400">✓</span>
                              <span className="text-gray-300">SEO básico</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400">✓</span>
                              <span className="text-gray-300">Testing completo</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400">✓</span>
                              <span className="text-gray-300">Documentación</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <button className="w-full py-3 px-6 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300">
                          Solicitar presupuesto detallado
                        </button>
                        <button 
                          onClick={resetCalculator}
                          className="w-full py-2 px-6 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Reiniciar calculadora
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400">
                      <div className="text-6xl mb-4">💻</div>
                      <p>Selecciona las opciones para ver la estimación</p>
                    </div>
                  )}
                </div>

                {/* Info box */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h4 className="font-bold text-white mb-3">ℹ️ Información importante</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>• Esta es una estimación orientativa</p>
                    <p>• El precio final puede variar según requisitos específicos</p>
                    <p>• Incluye consulta gratuita de 30 minutos</p>
                    <p>• Sin compromiso hasta firma de contrato</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BudgetCalculator;