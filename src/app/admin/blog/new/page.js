// src/app/admin/blog/new/page.js
import BlogPostForm from '@/components/admin/forms/BlogPostForm';

export default function NewBlogPost() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <BlogPostForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Nuevo Post - Admin Blog | Luis Granero',
  description: 'Crear nuevo artículo para el blog',
};