// src/components/providers/SessionWrapper.js - VERSIÓN CORREGIDA
'use client';

export default function SessionWrapper({ children }) {
  return (
    <>{/* SessionProvider */}
      {children}
    {/* /SessionProvider */}</>
  );
}