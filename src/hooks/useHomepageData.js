// src/hooks/useHomepageData.js
'use client';

import { useState, useEffect } from 'react';

export function useHomepageData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHomepageData() {
      try {
        setLoading(true);
        const response = await fetch('/api/homepage');
        
        if (!response.ok) {
          throw new Error('Error fetching homepage data');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error loading homepage:', err);
        setError(err.message);
        
        // Fallback a datos por defecto
        const { homepageSchema } = await import('@/lib/pageData');
        setData(homepageSchema);
      } finally {
        setLoading(false);
      }
    }

    fetchHomepageData();
  }, []);

  return { data, loading, error };
}