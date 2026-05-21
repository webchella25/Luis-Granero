/**
 * scripts/seed-seo-posts.js
 *
 * Inserta los 3 artículos pilares de la estrategia SEO en MongoDB.
 * Ejecutar con: node scripts/seed-seo-posts.js
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI no definida en .env.local');
  process.exit(1);
}

const BlogPostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  excerpt: String,
  category: String,
  tags: [String],
  difficulty: String,
  readTime: String,
  publishDate: Date,
  status: { type: String, default: 'published' },
  featured: Boolean,
  views: { type: Number, default: 0 },
  author: { name: String },
}, { timestamps: true });

const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);

function readContent(filename) {
  return fs.readFileSync(path.join(__dirname, 'seo-posts-content', filename), 'utf-8');
}

const posts = [
  {
    title: 'Cuánto cuesta una web profesional en 2025: desglose completo',
    slug: 'cuanto-cuesta-una-web-profesional-2025',
    excerpt: 'Precio real de una web profesional en 2025 según el tipo de proyecto: desde una landing page hasta un e-commerce a medida. Desglose por partidas, factores que afectan al coste y cómo presupuestar correctamente.',
    category: 'Freelance',
    tags: ['precios desarrollo web', 'presupuesto web', 'coste web profesional', 'freelance', 'e-commerce'],
    difficulty: 'Principiante',
    readTime: '8 min de lectura',
    publishDate: new Date('2025-03-24'),
    status: 'published',
    featured: false,
    author: { name: 'Luis Granero' },
    content: readContent('cuanto-cuesta-web.md'),
  },
  {
    title: 'Qué es React y por qué domina el desarrollo frontend en 2025',
    slug: 'que-es-react-guia-completa',
    excerpt: 'Guía completa para entender qué es React, cómo funciona, por qué se convirtió en el estándar del frontend y cuándo tiene sentido usarlo. Con ejemplos reales y comparativa con otros frameworks.',
    category: 'React',
    tags: ['qué es React', 'React tutorial', 'aprender React', 'React vs Vue', 'componentes React', 'React hooks'],
    difficulty: 'Principiante',
    readTime: '10 min de lectura',
    publishDate: new Date('2025-03-25'),
    status: 'published',
    featured: true,
    author: { name: 'Luis Granero' },
    content: readContent('que-es-react.md'),
  },
  {
    title: 'Guía completa de Next.js: del servidor a producción en 2025',
    slug: 'guia-completa-nextjs',
    excerpt: 'Todo lo que necesitas saber sobre Next.js: App Router, Server Components, SSR, SSG, optimización de imágenes y el stack moderno para construir webs rápidas y con buen SEO en 2025.',
    category: 'Next.js',
    tags: ['nextjs', 'next.js tutorial', 'app router', 'server components', 'react nextjs', 'SSR', 'SSG'],
    difficulty: 'Intermedio',
    readTime: '12 min de lectura',
    publishDate: new Date('2025-03-27'),
    status: 'published',
    featured: true,
    author: { name: 'Luis Granero' },
    content: readContent('guia-completa-nextjs.md'),
  },
  {
    title: 'React Hooks: guía completa con ejemplos reales (useState, useEffect y más)',
    slug: 'react-hooks-guia-completa',
    excerpt: 'Aprende todos los hooks de React con ejemplos reales: useState, useEffect, useRef, useContext, useMemo, useCallback, useReducer y cómo crear tus propios hooks personalizados.',
    category: 'React',
    tags: ['react hooks', 'useState', 'useEffect', 'useRef', 'useContext', 'hooks personalizados', 'aprender react'],
    difficulty: 'Intermedio',
    readTime: '14 min de lectura',
    publishDate: new Date('2025-03-28'),
    status: 'published',
    featured: false,
    author: { name: 'Luis Granero' },
    content: readContent('react-hooks-guia.md'),
  },
  {
    title: 'Freelance vs Agencia de desarrollo web: qué elegir para tu proyecto en 2025',
    slug: 'freelance-vs-agencia-desarrollo-web',
    excerpt: 'Comparativa honesta entre contratar un freelance o una agencia de desarrollo web. Ventajas, inconvenientes, cuándo tiene sentido cada opción y qué preguntar antes de decidir.',
    category: 'Freelance',
    tags: ['freelance vs agencia', 'contratar desarrollador web', 'elegir freelance', 'agencia desarrollo web', 'presupuesto web'],
    difficulty: 'Principiante',
    readTime: '7 min de lectura',
    publishDate: new Date('2025-03-26'),
    status: 'published',
    featured: false,
    author: { name: 'Luis Granero' },
    content: readContent('freelance-vs-agencia.md'),
  },
];

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    for (const post of posts) {
      const existing = await BlogPost.findOne({ slug: post.slug });
      if (existing) {
        console.log(`⚠️  Actualizando post existente: ${post.slug}`);
        await BlogPost.findOneAndUpdate({ slug: post.slug }, post, { new: true });
      } else {
        await BlogPost.create(post);
        console.log(`✅ Post creado: ${post.slug}`);
      }
    }

    console.log('\n🎉 Todos los posts SEO insertados correctamente.');
    console.log('\nURLs disponibles:');
    posts.forEach(p => console.log(`  → https://luisgranero.com/blog/${p.slug}`));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
