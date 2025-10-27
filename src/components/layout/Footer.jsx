// src/components/layout/Footer.jsx
import Link from 'next/link';

function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Inicio", href: "/" },
    { name: "Sobre mí", href: "/sobre-mi" },
    { name: "Servicios", href: "/servicios" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Blog", href: "/blog" },
    { name: "Contacto", href: "/contacto" }
  ];

  const services = [
    "Desarrollo Web Moderno",
    "Aplicaciones Personalizadas",
    "E-commerce Avanzado",
    "APIs y Backend",
    "SEO Técnico",
    "Auditorías Web"
  ];

  const technologies = [
    "React", "Next.js", "TypeScript", "Node.js", 
    "MongoDB", "Tailwind CSS", "Express", "Git"
  ];

  // 🔥 NUEVO: Links legales
  const legalLinks = [
    { name: "Aviso Legal", href: "/legal/aviso-legal" },
    { name: "Política de Privacidad", href: "/legal/privacidad" },
    { name: "Política de Cookies", href: "/legal/cookies" },
    { name: "Términos y Condiciones", href: "/legal/terminos" }
  ];

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            ¿Listo para tu próximo proyecto?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Transformemos tu idea en una aplicación web moderna y exitosa.
            Hablemos sobre tu proyecto sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contacto"
              className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-green-400 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105"
            >
              Iniciar proyecto
            </Link>
            <Link
              href="/contacto#presupuesto"
              className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold rounded-lg transition-all duration-300"
            >
              Consulta gratuita
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">💻</span>
              <span className="text-xl font-bold gradient-text">Luis Granero</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Desarrollador web freelance especializado en soluciones modernas y personalizadas. 
              Transformo ideas en aplicaciones web exitosas.
            </p>
            <div className="flex space-x-4">
              <a 
                href="mailto:hola@luisgranero.com"
                className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                aria-label="Email"
              >
                <span className="text-xl">📧</span>
              </a>
              <a 
                href="https://linkedin.com/in/luisgranero"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <span className="text-xl">💼</span>
              </a>
              <a 
                href="https://github.com/luisgranero"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                aria-label="GitHub"
              >
                <span className="text-xl">🐱</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Navegación</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-left"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Servicios</h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <span className="text-gray-400 text-sm">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technologies */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Tecnologías</h3>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded border border-cyan-500/30 hover:border-cyan-500/60 transition-colors duration-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-gray-400 text-sm text-center md:text-left">
              <span className="font-mono">© {currentYear} Luis Granero.</span> Todos los derechos reservados.
            </div>
            
            {/* 🔥 NUEVO: Legal Links */}
            <div className="flex flex-wrap items-center justify-center space-x-4 text-sm text-gray-400">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="hover:text-cyan-400 transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {/* Made with */}
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Hecho con</span>
              <span className="text-red-400">❤️</span>
              <span>y</span>
              <span className="text-cyan-400 font-mono">Next.js</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;