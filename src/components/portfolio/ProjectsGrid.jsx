'use client';

import { useState } from 'react';

function ProjectsGrid() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos los proyectos', count: 25 },
    { id: 'ecommerce', name: 'E-commerce', count: 8 },
    { id: 'webapp', name: 'Aplicaciones Web', count: 10 },
    { id: 'dashboard', name: 'Dashboards', count: 5 },
    { id: 'landing', name: 'Landing Pages', count: 7 }
  ];

  const projects = [
    {
      id: 1,
      title: "E-commerce Fashion Store",
      category: "ecommerce",
      description: "Tienda online de moda con gestión avanzada de inventarios, múltiples métodos de pago y dashboard administrativo completo.",
      image: "🛍️",
      technologies: ["Next.js", "TypeScript", "Stripe", "MongoDB", "Tailwind"],
      metrics: {
        performance: "98/100",
        conversions: "+45%",
        loadTime: "1.1s",
        revenue: "+180%"
      },
      features: [
        "Catálogo de productos con filtros avanzados",
        "Carrito de compras persistente",
        "Integración con Stripe y PayPal",
        "Panel administrativo completo",
        "Sistema de inventarios en tiempo real",
        "SEO optimizado para productos"
      ],
      results: "Incremento del 180% en ventas online durante los primeros 6 meses.",
      codeSnippet: `// Optimización de carrito con persistencia
const useCart = () => {
  const [items, setItems] = useLocalStorage('cart', []);
  
  const addItem = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, [setItems]);
  
  return { items, addItem, removeItem, clearCart };
};`,
      liveUrl: "#",
      status: "En producción"
    },
    {
      id: 2,
      title: "Corporate Dashboard",
      category: "dashboard",
      description: "Dashboard empresarial con análisis en tiempo real, gestión de usuarios y reportes automatizados para empresa fintech.",
      image: "📊",
      technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Chart.js"],
      metrics: {
        performance: "96/100",
        users: "500+",
        dataPoints: "10M+",
        efficiency: "+65%"
      },
      features: [
        "Dashboard con métricas en tiempo real",
        "Sistema de roles y permisos",
        "Generación automática de reportes",
        "Integración con APIs externas",
        "Visualización de datos avanzada",
        "Notificaciones push personalizadas"
      ],
      results: "Reducción del 65% en tiempo de generación de reportes y mejora significativa en toma de decisiones.",
      codeSnippet: `// Hook para datos en tiempo real
const useRealTimeData = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const socket = io();
    socket.on(endpoint, (newData) => {
      setData(newData);
      setLoading(false);
    });
    
    return () => socket.disconnect();
  }, [endpoint]);
  
  return { data, loading };
};`,
      liveUrl: "#",
      status: "En producción"
    },
    {
      id: 3,
      title: "Booking Platform",
      category: "webapp",
      description: "Plataforma de reservas para servicios de wellness con calendario dinámico, pagos online y gestión de profesionales.",
      image: "📅",
      technologies: ["Next.js", "Tailwind", "Firebase", "PayPal", "Calendar API"],
      metrics: {
        performance: "99/100",
        bookings: "1000+",
        satisfaction: "4.9/5",
        revenue: "+220%"
      },
      features: [
        "Calendario interactivo con disponibilidad",
        "Sistema de reservas en tiempo real",
        "Perfiles de profesionales",
        "Pagos seguros integrados",
        "Notificaciones automáticas",
        "Panel de gestión completo"
      ],
      results: "Automatización completa del proceso de reservas con aumento del 220% en facturación.",
      codeSnippet: `// Componente de calendario optimizado
const BookingCalendar = ({ professionalId }) => {
  const { availableSlots, loading } = useAvailability(professionalId);
  
  const handleSlotSelect = async (slot) => {
    try {
      await createBooking({
        professionalId,
        datetime: slot.datetime,
        service: selectedService
      });
      showSuccess('Reserva confirmada');
    } catch (error) {
      showError('Error en la reserva');
    }
  };
  
  return (
    <Calendar
      availableSlots={availableSlots}
      onSlotSelect={handleSlotSelect}
      loading={loading}
    />
  );
};`,
      liveUrl: "#",
      status: "En producción"
    },
    {
      id: 4,
      title: "SaaS Landing Page",
      category: "landing",
      description: "Landing page de alta conversión para SaaS B2B con calculadora interactiva de ROI y sistema de leads automatizado.",
      image: "🚀",
      technologies: ["Next.js", "Framer Motion", "EmailJS", "Analytics"],
      metrics: {
        performance: "100/100",
        conversion: "12.5%",
        leads: "300+",
        bounce: "18%"
      },
      features: [
        "Diseño de alta conversión",
        "Calculadora de ROI interactiva",
        "Formularios optimizados",
        "Animaciones fluidas",
        "A/B testing integrado",
        "Analytics avanzado"
      ],
      results: "Tasa de conversión del 12.5% y generación de +300 leads cualificados mensuales.",
      codeSnippet: `// Calculadora ROI interactiva
const ROICalculator = () => {
  const [inputs, setInputs] = useState({
    employees: 10,
    hourlyRate: 25,
    hoursPerWeek: 5
  });
  
  const calculateROI = useMemo(() => {
    const weeklySavings = inputs.employees * inputs.hourlyRate * inputs.hoursPerWeek;
    const monthlySavings = weeklySavings * 4;
    const yearlyROI = monthlySavings * 12 - (199 * 12);
    
    return {
      monthly: monthlySavings,
      yearly: yearlyROI,
      percentage: ((yearlyROI / (199 * 12)) * 100).toFixed(1)
    };
  }, [inputs]);
  
  return (
    <div className="roi-calculator">
      {/* Calculator UI */}
    </div>
  );
};`,
      liveUrl: "#",
      status: "En producción"
    },
    {
      id: 5,
      title: "Marketplace Especializado",
      category: "ecommerce",
      description: "Marketplace B2B para productos industriales con sistema de cotizaciones, catálogo masivo y integración ERP.",
      image: "🏭",
      technologies: ["Next.js", "Node.js", "MongoDB", "Redis", "AWS"],
      metrics: {
        performance: "94/100",
        products: "50K+",
        transactions: "€2M+",
        growth: "+340%"
      },
      features: [
        "Catálogo masivo con búsqueda avanzada",
        "Sistema de cotizaciones B2B",
        "Integración con múltiples proveedores",
        "Panel de vendedores",
        "Gestión de logística",
        "Reportes y analytics empresariales"
      ],
      results: "Crecimiento del 340% en transacciones y digitalización completa del proceso de ventas B2B.",
      codeSnippet: `// Sistema de búsqueda optimizado
const useProductSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const search = useCallback(
    debounce(async (query, filters) => {
      setLoading(true);
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          body: JSON.stringify({ query, filters })
        });
        const data = await response.json();
        setResults(data.products);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );
  
  return { results, loading, search };
};`,
      liveUrl: "#",
      status: "En producción"
    },
    {
      id: 6,
      title: "Learning Management System",
      category: "webapp",
      description: "Plataforma educativa online con cursos interactivos, seguimiento de progreso y sistema de certificaciones.",
      image: "🎓",
      technologies: ["React", "Node.js", "PostgreSQL", "Video.js", "PDF.js"],
      metrics: {
        performance: "97/100",
        students: "2000+",
        completion: "85%",
        satisfaction: "4.8/5"
      },
      features: [
        "Reproductor de video personalizado",
        "Sistema de progreso gamificado",
        "Exámenes y certificaciones",
        "Foros de discusión",
        "Analytics de aprendizaje",
        "Integración con sistemas LTI"
      ],
      results: "Tasa de finalización del 85% y alta satisfacción estudiantil con el sistema de aprendizaje.",
      codeSnippet: `// Sistema de progreso gamificado
const useProgress = (courseId, userId) => {
  const [progress, setProgress] = useState(null);
  
  const updateProgress = async (lessonId, completed = true) => {
    const newProgress = await api.updateProgress({
      courseId,
      userId,
      lessonId,
      completed
    });
    
    setProgress(newProgress);
    
    // Trigger achievements
    if (newProgress.percentage >= 100) {
      triggerCertification(courseId, userId);
    }
  };
  
  return { progress, updateProgress };
};`,
      liveUrl: "#",
      status: "En producción"
    }
  ];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Casos de Estudio Detallados
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explora proyectos reales con métricas, código y resultados de negocio
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Project header */}
              <div className="p-6 pb-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{project.image}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'En producción' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-2 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded border border-cyan-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="px-6 pb-4">
                <h4 className="font-semibold text-white mb-3">Métricas clave:</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(project.metrics).map(([key, value], index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold gradient-text">{value}</div>
                      <div className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="px-6 pb-4">
                <h4 className="font-semibold text-white mb-3">Características principales:</h4>
                <div className="space-y-1">
                  {project.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-400 text-xs">✓</span>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                  {project.features.length > 3 && (
                    <div className="text-cyan-400 text-sm">
                      +{project.features.length - 3} características más
                    </div>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="px-6 pb-6">
                <h4 className="font-semibold text-white mb-2">Resultados:</h4>
                <p className="text-gray-300 text-sm italic mb-4">
                  "{project.results}"
                </p>
                
                <button className="w-full py-3 px-6 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl transition-all duration-300">
                  Ver caso completo
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold gradient-text mb-4">
              ¿Quieres ser el próximo caso de éxito?
            </h3>
            <p className="text-gray-400 mb-6">
              Hablemos sobre tu proyecto y cómo puedo ayudarte a conseguir resultados similares.
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105">
              Iniciar mi proyecto
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProjectsGrid;