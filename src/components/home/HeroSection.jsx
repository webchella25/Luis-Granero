function HeroSection() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-8">
        <div className="flex items-center justify-center space-x-2 text-cyan-400 mb-8">
          <span className="font-mono text-lg">console.log(&quot;Hola mundo!&quot;)</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold gradient-text mb-4">
          Luis Granero
        </h1>
        
        <p className="text-2xl md:text-3xl text-gray-300 font-mono">
          Desarrollador Full Stack
        </p>
        
        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mt-8">
          Transformo ideas en <span className="text-cyan-400 font-semibold">aplicaciones web modernas</span> y{' '}
          <span className="text-green-400 font-semibold">soluciones personalizadas</span>. 
          Especializado en React, Next.js y arquitecturas escalables.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <button className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105">
            Ver mis proyectos
          </button>
          
          <button className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105">
            Hablemos
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;