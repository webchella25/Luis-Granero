'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Code2, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/sobre-mi', label: 'Sobre mí' },
    { href: '/servicios', label: 'Servicios' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/blog', label: 'Blog' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-dark-800/95 backdrop-blur-md border-b border-primary/20' 
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Terminal className="w-8 h-8 text-primary group-hover:animate-pulse" />
              <Code2 className="w-4 h-4 text-secondary absolute -bottom-1 -right-1" />
            </div>
            <span className="text-xl font-bold gradient-text">
              Luis Granero
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-gray-300 hover:text-primary transition-colors duration-300 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/contacto"
              className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-dark-800 font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
            >
              Trabajemos juntos
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-primary hover:text-secondary transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 pb-4 border-t border-primary/20"
            >
              <div className="flex flex-col space-y-4 mt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-300 hover:text-primary transition-colors duration-300 py-2"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/contacto"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-dark-800 font-semibold rounded-lg text-center"
                >
                  Trabajemos juntos
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Header;