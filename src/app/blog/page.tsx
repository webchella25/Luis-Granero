import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer.jsx';
import BlogHero from '@/components/blog/BlogHero.jsx';
import FeaturedPost from '@/components/blog/FeaturedPost.jsx';
import BlogGrid from '@/components/blog/BlogGrid.jsx';
import BlogCategories from '@/components/blog/BlogCategories.jsx';
import NewsletterSignup from '@/components/blog/NewsletterSignup.jsx';

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