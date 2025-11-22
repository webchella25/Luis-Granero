// src/app/admin/blog/[id]/page.tsx
import { notFound } from 'next/navigation';
import BlogPostForm from '@/components/admin/forms/BlogPostForm';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

async function getPost(id: string) {
    try {
        await connectDB();
        const post = await Post.findById(id).lean();

        if (!post) {
            return null;
        }

        // Serializar el objeto para pasarlo al componente cliente
        return JSON.parse(JSON.stringify(post));
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

export default async function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="container mx-auto px-4">
                <BlogPostForm initialData={post} isEditing={true} />
            </div>
        </div>
    );
}

export const metadata = {
    title: 'Editar Post - Admin Blog | Luis Granero',
    description: 'Editar artículo del blog',
};
