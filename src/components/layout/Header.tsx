// src/components/layout/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [serviciosOpen, setServiciosOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serviciosCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const handleDropdownEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setResourcesOpen(true);
  };

  const handleDropdownLeave = () => {
    closeTimer.current = setTimeout(() => setResourcesOpen(false), 150);
  };

  const handleServiciosEnter = () => {
    if (serviciosCloseTimer.current) clearTimeout(serviciosCloseTimer.current);
    setServiciosOpen(true);
  };

  const handleServiciosLeave = () => {
    serviciosCloseTimer.current = setTimeout(() => setServiciosOpen(false), 150);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Sobre mí', href: '/sobre-mi' },
    {
      name: 'Servicios',
      href: '/servicios',
      dropdownServicios: [
        { name: 'Todos los servicios', href: '/servicios', desc: 'Vista general' },
        { name: 'React & Next.js', href: '/servicios/desarrollo-react-nextjs', desc: 'Apps web modernas' },
        { name: 'E-commerce a medida', href: '/servicios/ecommerce', desc: 'Tiendas sin comisiones' },
        { name: 'Consultoría técnica', href: '/servicios/consultoria', desc: 'Code review y auditorías' },
        { name: 'Freelance en Valencia', href: '/servicios/desarrollo-web-valencia', desc: 'Reuniones presenciales' },
      ]
    },
    { name: 'Portfolio', href: '/portfolio' },
    {
      name: 'Recursos',
      href: '#',
      dropdown: [
        { name: 'Todos los artículos', href: '/blog', group: 'Blog' },
        { name: 'React', href: '/blog/categoria/react', group: 'Blog' },
        { name: 'Next.js', href: '/blog/categoria/nextjs', group: 'Blog' },
        { name: 'Freelance', href: '/blog/categoria/freelance', group: 'Blog' },
        { name: 'Cursos gratuitos', href: '/cursos', badge: 'Nuevo', group: 'Aprender' },
      ]
    },
    { name: 'Contacto', href: '/contacto' }
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0B1120]/95 backdrop-blur-lg border-b border-slate-700/50'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="group">
            <span className="text-xl font-semibold tracking-tight text-white group-hover:text-cyan-400 transition-colors duration-200" style={{ fontFamily: 'var(--font-heading, sans-serif)' }}>
              Luis Granero
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              item.dropdownServicios ? (
                /* ── Dropdown Servicios ── */
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={handleServiciosEnter}
                  onMouseLeave={handleServiciosLeave}
                >
                  <button
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      pathname.startsWith('/servicios')
                        ? 'text-cyan-400 bg-cyan-400/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${serviciosOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {serviciosOpen && (
                    <div className="absolute top-full left-0 w-60 bg-[#0B1120] border border-slate-700/50 rounded-lg shadow-xl z-50 pt-2">
                      <div className="py-1">
                        {item.dropdownServicios.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setServiciosOpen(false)}
                            className={`block px-4 py-3 transition-colors duration-150 ${
                              isActive(subItem.href) && subItem.href !== '/servicios'
                                ? 'text-cyan-400 bg-cyan-400/10'
                                : pathname === '/servicios' && subItem.href === '/servicios'
                                ? 'text-cyan-400 bg-cyan-400/10'
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="font-medium text-sm text-slate-200">{subItem.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{subItem.desc}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : item.dropdown ? (
                /* ── Dropdown Recursos ── */
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      pathname.startsWith('/blog') || pathname.startsWith('/cursos')
                        ? 'text-cyan-400 bg-cyan-400/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${resourcesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {resourcesOpen && (
                    <div className="absolute top-full left-0 w-56 bg-[#0B1120] border border-slate-700/50 rounded-lg shadow-xl z-50 py-2">
                      {/* Grupo Blog */}
                      <div className="px-3 pt-1 pb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Blog</span>
                      </div>
                      {item.dropdown.filter(s => s.group === 'Blog').map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={() => setResourcesOpen(false)}
                          className={`block px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                            isActive(subItem.href) && subItem.href !== '/blog'
                              ? 'text-cyan-400 bg-cyan-400/10'
                              : pathname === '/blog' && subItem.href === '/blog'
                              ? 'text-cyan-400 bg-cyan-400/10'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                      <div className="my-2 border-t border-slate-800" />
                      {/* Grupo Aprender */}
                      <div className="px-3 pb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Aprender</span>
                      </div>
                      {item.dropdown.filter(s => s.group === 'Aprender').map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={() => setResourcesOpen(false)}
                          className={`relative block px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                            isActive(subItem.href)
                              ? 'text-cyan-400 bg-cyan-400/10'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {subItem.name}
                            {subItem.badge && (
                              <span className="px-1.5 py-0.5 bg-cyan-500 text-white text-[10px] font-bold rounded-full">
                                {subItem.badge}
                              </span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-cyan-400 bg-cyan-400/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* CTA Buttons Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/admin/login"
              className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-all duration-300"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/contacto"
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
            >
              Trabajemos juntos
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                item.dropdownServicios ? (
                  <div key={item.name}>
                    <button
                      onClick={() => setServiciosOpen(!serviciosOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <span>{item.name}</span>
                      <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${serviciosOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {serviciosOpen && (
                      <div className="mt-2 ml-4 space-y-1">
                        {item.dropdownServicios.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-4 py-2.5 rounded-lg transition-all ${
                              isActive(subItem.href) && subItem.href !== '/servicios'
                                ? 'text-cyan-400 bg-cyan-400/10'
                                : pathname === '/servicios' && subItem.href === '/servicios'
                                ? 'text-cyan-400 bg-cyan-400/10'
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="font-medium text-sm text-slate-200">{subItem.name}</div>
                            <div className="text-xs text-slate-500">{subItem.desc}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : item.dropdown ? (
                  <div key={item.name}>
                    <button
                      onClick={() => setResourcesOpen(!resourcesOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <span>{item.name}</span>
                      <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${resourcesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {resourcesOpen && (
                      <div className="mt-2 ml-4 space-y-1">
                        <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Blog</p>
                        {item.dropdown.filter(s => s.group === 'Blog').map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              isActive(subItem.href) && subItem.href !== '/blog'
                                ? 'text-cyan-400 bg-cyan-400/10'
                                : pathname === '/blog' && subItem.href === '/blog'
                                ? 'text-cyan-400 bg-cyan-400/10'
                                : 'text-gray-300 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                        <div className="my-1 border-t border-slate-800 mx-4" />
                        <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Aprender</p>
                        {item.dropdown.filter(s => s.group === 'Aprender').map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              isActive(subItem.href)
                                ? 'text-cyan-400 bg-cyan-400/10'
                                : 'text-gray-300 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {subItem.name}
                              {subItem.badge && (
                                <span className="px-1.5 py-0.5 bg-cyan-500 text-white text-[10px] font-bold rounded-full">
                                  {subItem.badge}
                                </span>
                              )}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`relative px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive(item.href)
                        ? 'text-cyan-400 bg-cyan-400/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      {item.name}
                    </span>
                  </Link>
                )
              ))}
              
              {/* Auth Links Mobile */}
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 font-medium rounded-lg text-center transition-all"
              >
                Iniciar Sesión
              </Link>

              {/* CTA Mobile */}
              <Link
                href="/contacto"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg text-center transition-colors duration-200"
              >
                Trabajemos juntos
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}