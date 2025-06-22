function AboutHero() {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-8">
              Sobre mí
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
              Más de 10 años transformando ideas en soluciones web exitosas
            </p>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Profile */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-cyan-400/20 to-green-400/20 rounded-2xl p-8 backdrop-blur-sm border border-cyan-500/30">
                <div className="text-6xl text-center mb-4">👨‍💻</div>
                <h2 className="text-2xl font-bold text-center gradient-text mb-4">
                  Luis Granero
                </h2>
                <p className="text-center text-gray-300 font-mono">
                  Full Stack Developer & Tech Consultant
                </p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-xl p-4 text-center border border-gray-800">
                  <div className="text-2xl font-bold gradient-text">+10</div>
                  <div className="text-sm text-gray-400">Años experiencia</div>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4 text-center border border-gray-800">
                  <div className="text-2xl font-bold gradient-text">+50</div>
                  <div className="text-sm text-gray-400">Proyectos</div>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4 text-center border border-gray-800">
                  <div className="text-2xl font-bold gradient-text">100%</div>
                  <div className="text-sm text-gray-400">Personalizado</div>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4 text-center border border-gray-800">
                  <div className="text-2xl font-bold gradient-text">24/7</div>
                  <div className="text-sm text-gray-400">Soporte</div>
                </div>
              </div>
            </div>

            {/* Story */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white mb-4">Mi Historia</h3>
                <p className="text-gray-300 leading-relaxed">
                  Empecé mi viaje en el desarrollo web hace más de una década, creando sitios 
                  en WordPress para clientes de diversos sectores. Esta experiencia me enseñó 
                  a entender las necesidades reales del mercado y la importancia de crear 
                  soluciones que realmente funcionen.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Con el tiempo, sentí la necesidad de ir más allá de las soluciones genéricas. 
                  Me especialicé en desarrollo personalizado utilizando tecnologías modernas 
                  como React y Next.js, enfocándome en crear aplicaciones que no solo se vean bien, 
                  sino que generen resultados medibles.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Hoy me posiciono como un <span className="text-cyan-400 font-semibold">desarrollador técnico</span> que 
                  construye <span className="text-green-400 font-semibold">soluciones a medida</span> para startups, 
                  empresas tecnológicas y negocios que necesitan algo más que una web bonita: necesitan resultados.
                </p>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300">
                  Descargar CV
                </button>
                <button className="px-6 py-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold rounded-lg transition-all duration-300">
                  Ver Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutHero;