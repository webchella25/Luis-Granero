// src/components/ui/Loading.tsx
'use client';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function Loading({ 
  size = 'md', 
  text = 'Cargando...', 
  className = '' 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      {/* Spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-600 border-t-cyan-400`}></div>
        <div className={`${sizeClasses[size]} animate-ping rounded-full border border-cyan-400/20 absolute top-0 left-0`}></div>
      </div>
      
      {/* Texto */}
      {text && (
        <p className="text-gray-400 text-sm mt-4 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

// Componente para loading de secciones completas
export function SectionLoading({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-900/50 animate-pulse rounded-lg p-8 ${className}`}>
      <div className="space-y-4">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  );
}

// Loading para tarjetas/cards
export function CardLoading({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-800 animate-pulse rounded-lg p-6 ${className}`}>
      <div className="space-y-4">
        <div className="h-12 w-12 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  );
}