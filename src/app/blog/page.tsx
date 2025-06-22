import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogHero from '@/components/blog/BlogHero';
import FeaturedPost from '@/components/blog/FeaturedPost';
import BlogGrid from '@/components/blog/BlogGrid';
import BlogCategories from '@/components/blog/BlogCategories';
import NewsletterSignup from '@/components/blog/NewsletterSignup';

export const metadata = {
  title: 'Blog - Luis Granero | Tutoriales y Artículos de Desarrollo Web',
  description: 'Artículos técnicos, tutoriales de React/Next.js, mejores prácticas de desarrollo web y tendencias tecnológicas.',
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <BlogHero />
      <FeaturedPost />
      <BlogGrid />
      <BlogCategories />
      <NewsletterSignup />
      <Footer />
    </main>
  );
}