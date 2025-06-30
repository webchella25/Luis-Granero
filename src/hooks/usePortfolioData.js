// src/hooks/usePortfolioData.js
'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePortfolioData(initialFilters = {}) {
  const [data, setData] = useState({
    projects: [],
    pagination: {},
    categories: {},
    filters: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: 'all',
    search: '',
    sort: 'createdAt',
    order: 'desc',
    ...initialFilters
  });

  const fetchProjects = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/projects?${params}`);
      
      if (!response.ok) {
        throw new Error('Error fetching projects');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchProjects(updatedFilters);
  }, [filters, fetchProjects]);

  const changePage = useCallback((page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchProjects(updatedFilters);
  }, [filters, fetchProjects]);

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      page: 1,
      limit: 12,
      category: 'all',
      search: '',
      sort: 'createdAt',
      order: 'desc'
    };
    setFilters(defaultFilters);
    fetchProjects(defaultFilters);
  }, [fetchProjects]);

  return {
    projects: data.projects,
    pagination: data.pagination,
    categories: data.categories,
    filters: data.filters,
    loading,
    error,
    updateFilters,
    changePage,
    resetFilters,
    refetch: () => fetchProjects()
  };
}

// Hook para proyecto individual
export function useProjectData(slug) {
  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProject() {
      if (!slug) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${slug}`);
        
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Proyecto no encontrado' : 'Error cargando proyecto');
        }
        
        const data = await response.json();
        setProject(data.project);
        setRelatedProjects(data.relatedProjects || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [slug]);

  return { project, relatedProjects, loading, error };
}