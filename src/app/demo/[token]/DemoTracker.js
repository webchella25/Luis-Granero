'use client';
// src/app/demo/[token]/DemoTracker.js — Componente cliente que trackea la visita
import { useEffect } from 'react';

export default function DemoTracker({ token }) {
  useEffect(() => {
    // Trackear visita al cargar la página (solo una vez por sesión)
    const sessionKey = `demo_tracked_${token}`;
    if (sessionStorage.getItem(sessionKey)) return;

    fetch(`/api/demo/${token}/track`, { method: 'POST' })
      .then(() => sessionStorage.setItem(sessionKey, '1'))
      .catch(() => {}); // Silencioso — no afecta la experiencia del usuario
  }, [token]);

  return null;
}
