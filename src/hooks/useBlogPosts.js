// src/hooks/useBlogPosts.js
import { useState, useEffect } from 'react';

export function useBlogPosts({ category, page = 1, limit = 6, search = '' } = {}) {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(category && { category }),
          ...(search && { search })
        });

        const response = await fetch(`/api/blog?${params}`);
        if (!response.ok) throw new Error('Error fetching posts');
        
        const result = await response.json();
        setPosts(result.posts);
        setPagination(result.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [category, page, limit, search]);

  return { posts, pagination, loading, error, refetch: () => fetchPosts() };
}