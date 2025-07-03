// src/components/providers/SessionWrapper.js
'use client';

import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo o nombre */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Luis Granero</h1>
          <p className="text-gray-400">Desarrollador Web</p>
        </div>
        
        {/* Spinner elegante */}
        <div className="relative">
          <div className="w-16 h-16 border-2 border-gray-600 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
          <div className="w-16 h-16 border border-cyan-400/20 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 animate-ping"></div>
        </div>
        
        <p className="text-gray-400 mt-4 animate-pulse">Cargando...</p>
      </div>
    </div>
  );
}

export default function SessionWrapper({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga mínima para evitar flash
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}