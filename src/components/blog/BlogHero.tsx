// src/components/blog/BlogHero.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BlogHeroProps {
  totalPosts?: number;
}

export default function BlogHero({ totalPosts = 0 }: BlogHeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(0);
  const [typingText, setTypingText] = useState('');

  // Temas de programación rotativos
  const programmingTopics = [
    { 
      topic: "React Hooks", 
      color: "from-blue-400 to-cyan-400", 
      icon: "⚛️",
      description: "Custom hooks y patrones avanzados"
    },
    { 
      topic: "Next.js 14", 
      color: "from-gray-400 to-white", 
      icon: "▲",
      description: "App Router y Server Components"
    },
    { 
      topic: "Performance", 
      color: "from-yellow-400 to-orange-500", 
      icon: "⚡",
      description: "Core Web Vitals y optimización"
    },
    { 
      topic: "TypeScript", 
      color: "from-blue-600 to-indigo-600", 
      icon: "🔷",
      description: "Tipos avanzados y mejores prácticas"
    },
    { 
      topic: "DevOps", 
      color: "from-green-500 to-emerald-600", 
      icon: "🚀",
      description: "CI/CD y deployment automation"
    }
  ];

  // Stats del blog (usando totalPosts dinámico)
  const blogStats = [
    { label: "Artículos", value: totalPosts > 0 ? `${totalPosts}+` : "50+", icon: "📖", color: "cyan" },
    { label: "Lectores", value: "10K+", icon: "👥", color: "green" },
    { label: "Tutoriales", value: "25+", icon: "🎓", color: "purple" },
    { label: "Código", value: "1000+", color: "yellow", icon: "💻" }
  ];

  // Texto de typewriter
  const typewriterTexts = [
    "console.log('Compartiendo conocimiento...');",
    "const blog = new Knowledge();",
    "function shareExperience() { return wisdom; }",
    "// Código que enseña y inspira",
    "export default LearnTogether;"
  ];

  useEffect(() => {
    setIsVisible(true);

    // Rotación de topics cada 3 segundos
    const topicInterval = setInterval(() => {
      setCurrentTopic((prev) => (prev + 1) % programmingTopics.length);
    }, 3000);

    // Efecto typewriter
    let textIndex = 0;
    let charIndex = 0;
    const typewriterInterval = setInterval(() => {
      const currentText = typewriterTexts[textIndex];
      
      if (charIndex < currentText.length) {
        setTypingText(currentText.substring(0, charIndex + 1));
        charIndex++;
      } else {
        setTimeout(() => {
          textIndex = (textIndex + 1) % typewriterTexts.length;
          charIndex = 0;
          setTypingText('');
        }, 2000);
      }
    }, 100);

    return () => {
      clearInterval(topicInterval);
      clearInterval(typewriterInterval);
    };
  }, []);

  const currentProgrammingTopic = programmingTopics[currentTopic];

  return (
    <section className="py-20 bg-gradient-to-br from-black via-gray-950 to-gray-900 relative overflow-hidden min-h-[85vh] flex items-center">
      
      {/* EFECTOS DE FONDO TIPO TERMINAL */}
      <div className="absolute inset-0">
        {/* Matrix-style code rain */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-20 gap-1 h-full font-mono text-xs text-green-400">
            {[...Array(200)].map((_, i) => (
              <div 
                key={i}
                className="animate-pulse opacity-60"
                style={{ 
                  animationDelay: `${i * 50}ms`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              >
                {Math.random() > 0.5 ? '1' : '0'}
              </div>
            ))}
          </div>
        </div>
        
        {/* Efectos de luz intelectuales */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Terminal window effect */}
        <div className="absolute top-8 right-8 w-64 h-48 bg-gray-900/80 border border-gray-700 rounded-lg p-4 font-mono text-xs text-green-400 opacity-30">
          <div className="flex space-x-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="space-y-1">
            <div>$ npm run blog</div>
            <div>✓ Building knowledge...</div>
            <div>✓ Sharing experience...</div>
            <div className="animate-pulse">▶ Ready to teach!</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          
          {/* TYPEWRITER CODE */}
          <div className="mb-8 font-mono text-lg md:text-xl text-cyan-400 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 max-w-2xl mx-auto">
            <span className="text-gray-500">// </span>
            <span>{typingText}</span>
            <span className="animate-blink text-green-400">|</span>
          </div>

          {/* TÍTULO PRINCIPAL CON EFECTOS */}
          <h1 className="mb-8">
            <div className="text-6xl md:text-8xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                Blog
              </span>
              <span className="text-white">.dev</span>
            </div>
            
            {/* SUBTÍTULO CON TOPIC ROTATIVO */}
            <div className="text-2xl md:text-4xl font-bold">
              <span className="text-gray-300">Explorando </span>
              <span 
                className={`bg-gradient-to-r ${currentProgrammingTopic.color} bg-clip-text text-transparent font-mono animate-pulse`}
              >
                {currentProgrammingTopic.icon} {currentProgrammingTopic.topic}
              </span>
            </div>
            <div className="text-lg md:text-xl text-gray-400 mt-2 font-mono">
              {currentProgrammingTopic.description}
            </div>
          </h1>

          {/* DESCRIPCIÓN CON HIGHLIGHTS TÉCNICOS */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            <span className="text-blue-400 font-semibold">Tutoriales técnicos</span>,{' '}
            <span className="text-purple-400 font-semibold">guías avanzadas</span> y{' '}
            <span className="text-cyan-400 font-semibold">experiencias reales</span>
            <br />
            del mundo del{' '}
            <span className="text-green-400 font-semibold bg-gray-900/50 px-2 py-1 rounded font-mono">desarrollo web moderno</span>.
          </p>

          {/* STATS DEL BLOG CON CÓDIGO */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {blogStats.map((stat, index) => {
              const colorClasses = {
                cyan: "from-cyan-400 to-cyan-600 border-cyan-500/30 hover:border-cyan-500/60",
                green: "from-green-400 to-green-600 border-green-500/30 hover:border-green-500/60",
                purple: "from-purple-400 to-purple-600 border-purple-500/30 hover:border-purple-500/60",
                yellow: "from-yellow-400 to-yellow-600 border-yellow-500/30 hover:border-yellow-500/60"
              };

              return (
                <div
                  key={index}
                  className={`group bg-gray-900/40 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 animate-fade-in-up font-mono ${colorClasses[stat.color]}`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="text-2xl mb-3 group-hover:scale-125 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className={`text-2xl md:text-3xl font-black bg-gradient-to-r ${colorClasses[stat.color].split(' ')[0]} ${colorClasses[stat.color].split(' ')[1]} bg-clip-text text-transparent mb-2 group-hover:animate-pulse`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-xs md:text-sm uppercase tracking-wider font-semibold">
                    {stat.label}
                  </div>
                  
                  {/* Loading bar estilo terminal */}
                  <div className="mt-4 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${colorClasses[stat.color].split(' ')[0]} ${colorClasses[stat.color].split(' ')[1]} rounded-full animate-progress-bar`}
                      style={{ animationDelay: `${index * 300 + 500}ms` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* NAVIGATION BUTTONS TIPO IDE */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link
              href="#articles"
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500/30 text-blue-400 font-bold text-xl rounded-2xl hover:from-blue-600/40 hover:to-purple-600/40 hover:border-blue-500/60 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 font-mono"
            >
              <span className="relative z-10 flex items-center">
                <span className="mr-3 text-2xl group-hover:rotate-12 transition-transform">📚</span>
                Leer artículos
                <span className="ml-3 group-hover:translate-x-2 transition-transform text-2xl">→</span>
              </span>
            </Link>
            
            <Link
              href="/blog/categories"
              className="group px-10 py-5 border-2 border-purple-400/50 text-purple-400 hover:bg-purple-400/10 hover:border-purple-400 font-bold text-xl rounded-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 font-mono"
            >
              <span className="flex items-center">
                <span className="mr-3 text-2xl group-hover:scale-125 transition-transform">🗂️</span>
                Explorar categorías
              </span>
            </Link>
          </div>

          {/* FEATURED CATEGORIES CON HOVER EFFECTS */}
          <div className="max-w-5xl mx-auto">
            <div className="text-gray-400 text-sm mb-6 font-mono">Categorías más populares:</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {programmingTopics.map((topic, index) => (
                <div
                  key={index}
                  className={`group flex flex-col items-center space-y-2 px-4 py-3 rounded-xl border transition-all duration-300 hover:scale-110 font-mono ${
                    index === currentTopic 
                      ? `border-blue-500/60 bg-gray-900/60` 
                      : 'border-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">
                    {topic.icon}
                  </span>
                  <span className={`font-semibold text-sm text-center ${
                    index === currentTopic 
                      ? `bg-gradient-to-r ${topic.color} bg-clip-text text-transparent` 
                      : 'text-gray-400 group-hover:text-gray-300'
                  }`}>
                    {topic.topic}
                  </span>
                  {index === currentTopic && (
                    <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}