// src/components/layout/Footer.jsx
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';

async function getSocialLinks() {
  try {
    await dbConnect();
    const config = await SiteConfig.findOne({ key: 'site_info' }).lean();
    return config?.value?.social || {};
  } catch {
    return {};
  }
}

async function Footer() {
  const social = await getSocialLinks();
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
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </a>
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                  aria-label="LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
              {social.github && (
                <a
                  href={social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                  aria-label="GitHub"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                  aria-label="Twitter/X"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
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