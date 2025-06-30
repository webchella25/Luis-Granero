// src/hooks/useBlogData.js
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useBlogData(initialFilters = {}) {
  const [data, setData] = useState({
    posts: [],
    pagination: {},
    categories: {},
    tags: [],
    popularPosts: [],
    filters: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 6,
    category: 'all',
    search: '',
    tag: '',
    difficulty: 'all',
    sort: 'publishedAt',
    order: 'desc',
    ...initialFilters
  });

  const fetchPosts = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/blog?${params}`);
      
      if (!response.ok) {
        throw new Error('Error fetching blog posts');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error loading blog posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchPosts(updatedFilters);
  }, [filters, fetchPosts]);

  const changePage = useCallback((page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchPosts(updatedFilters);
  }, [filters, fetchPosts]);

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      page: 1,
      limit: 6,
      category: 'all',
      search: '',
      tag: '',
      difficulty: 'all',
      sort: 'publishedAt',
      order: 'desc'
    };
    setFilters(defaultFilters);
    fetchPosts(defaultFilters);
  }, [fetchPosts]);

  return {
    posts: data.posts,
    pagination: data.pagination,
    categories: data.categories,
    tags: data.tags,
    popularPosts: data.popularPosts,
    filters: data.filters,
    loading,
    error,
    updateFilters,
    changePage,
    resetFilters,
    refetch: () => fetchPosts()
  };
}

// Hook para post individual
export function useBlogPost(slug) {
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [navigation, setNavigation] = useState({ prev: null, next: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/blog/${slug}`);
        
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Post no encontrado' : 'Error cargando post');
        }
        
        const data = await response.json();
        setPost(data.post);
        setRelatedPosts(data.relatedPosts || []);
        setNavigation(data.navigation || { prev: null, next: null });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  return { post, relatedPosts, navigation, loading, error };
}

// Hook para gestión de posts (admin)
export function useAdminBlogData() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/blog');
      
      if (!response.ok) {
        throw new Error('Error fetching admin blog posts');
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error loading admin blog posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const deletePost = useCallback(async (slug) => {
    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error eliminando post');
      }
      
      // Actualizar lista local
      setPosts(prev => prev.filter(post => post.slug !== slug));
      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err.message);
      return false;
    }
  }, []);

  const toggleFeatured = useCallback(async (slug, isFeatured) => {
    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !isFeatured })
      });
      
      if (!response.ok) {
        throw new Error('Error actualizando post');
      }
      
      // Actualizar lista local
      setPosts(prev => prev.map(post => 
        post.slug === slug 
          ? { ...post, isFeatured: !isFeatured }
          : post
      ));
      return true;
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.message);
      return false;
    }
  }, []);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    deletePost,
    toggleFeatured
  };
}