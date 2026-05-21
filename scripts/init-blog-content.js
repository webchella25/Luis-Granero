// scripts/init-blog-content.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Category from '../src/models/Category.js';
import BlogPost from '../src/models/BlogPost.js';
import User from '../src/models/User.js';

const categories = [
  {
    name: 'React & Next.js',
    slug: 'react-nextjs',
    description: 'Frameworks modernos de JavaScript',
    color: '#06B6D4',
    icon: '⚛️',
    isActive: true
  },
  {
    name: 'JavaScript',
    slug: 'javascript',
    description: 'Fundamentos y características avanzadas',
    color: '#F59E0B',
    icon: '📜',
    isActive: true
  },
  {
    name: 'TypeScript',
    slug: 'typescript',
    description: 'JavaScript tipado y escalable',
    color: '#3178C6',
    icon: '🔷',
    isActive: true
  },
  {
    name: 'Frontend',
    slug: 'frontend',
    description: 'UI/UX, CSS, animaciones y más',
    color: '#A855F7',
    icon: '🎨',
    isActive: true
  },
  {
    name: 'Backend',
    slug: 'backend',
    description: 'APIs, bases de datos y arquitectura',
    color: '#10B981',
    icon: '⚙️',
    isActive: true
  },
  {
    name: 'Performance',
    slug: 'performance',
    description: 'Optimización y mejores prácticas',
    color: '#F97316',
    icon: '⚡',
    isActive: true
  },
  {
    name: 'DevOps',
    slug: 'devops',
    description: 'Deployment, CI/CD y automatización',
    color: '#8B5CF6',
    icon: '🚀',
    isActive: true
  }
];

const blogPosts = [
  {
    title: 'Guía Completa de React Hooks en 2026',
    slug: 'guia-completa-react-hooks-2026',
    excerpt: 'Aprende a dominar los React Hooks con ejemplos prácticos y casos de uso reales. Desde useState hasta hooks personalizados.',
    content: `# Guía Completa de React Hooks en 2026

Los React Hooks revolucionaron la forma en que escribimos componentes en React. En esta guía completa, exploraremos todos los hooks esenciales y cómo usarlos efectivamente.

## ¿Qué son los React Hooks?

Los Hooks son funciones que te permiten "enganchar" el estado y el ciclo de vida de React desde componentes funcionales.

## Hooks Básicos

### useState

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
\`\`\`

### useEffect

\`\`\`jsx
import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);

  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
\`\`\`

## Custom Hooks

\`\`\`jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
\`\`\`

## Mejores Prácticas

1. Llama hooks solo en el nivel superior
2. Usa el linter eslint-plugin-react-hooks
3. Nombra custom hooks con "use"
4. Extrae lógica compleja a custom hooks

Los React Hooks son fundamentales en el desarrollo moderno. ¡Domínalos!`,
    category: 'react-nextjs',
    tags: ['react', 'hooks', 'javascript', 'frontend'],
    status: 'published',
    readTime: 8,
    views: 0,
    likes: 0
  },
  {
    title: 'Server Components vs Client Components en Next.js 15',
    slug: 'server-components-vs-client-components-nextjs-15',
    excerpt: 'Entiende la diferencia entre Server Components y Client Components en Next.js 15.',
    content: `# Server Components vs Client Components en Next.js 15

Next.js 15 introduce un nuevo paradigma con React Server Components.

## Server Components

\`\`\`jsx
async function HomePage() {
  const data = await fetch('https://api.example.com/data');
  const posts = await data.json();

  return (
    <div>
      <h1>Posts</h1>
      {posts.map(post => <article key={post.id}>{post.title}</article>)}
    </div>
  );
}
\`\`\`

## Client Components

\`\`\`jsx
'use client';
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
\`\`\`

## Cuándo usar cada uno

**Server Components:** Acceso a backend, reducir bundle, SEO
**Client Components:** useState, useEffect, event listeners

Next.js 15 con Server Components es el futuro del desarrollo web.`,
    category: 'react-nextjs',
    tags: ['nextjs', 'react', 'server-components'],
    status: 'published',
    readTime: 6,
    views: 0,
    likes: 0
  },
  {
    title: 'TypeScript: Tipos Avanzados que Debes Conocer',
    slug: 'typescript-tipos-avanzados-debes-conocer',
    excerpt: 'Utility types, tipos condicionales y más. Lleva tu TypeScript al siguiente nivel.',
    content: `# TypeScript: Tipos Avanzados

TypeScript ofrece tipos avanzados que mejoran tu código.

## Utility Types

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
type UserPreview = Pick<User, 'id' | 'name'>;
type UserWithoutId = Omit<User, 'id'>;
\`\`\`

## Tipos Condicionales

\`\`\`typescript
type IsString<T> = T extends string ? true : false;
type A = IsString<'hello'>; // true
type B = IsString<42>; // false
\`\`\`

## Mapped Types

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
\`\`\`

Domina tipos avanzados para código más seguro y mantenible.`,
    category: 'typescript',
    tags: ['typescript', 'tipos', 'programacion'],
    status: 'published',
    readTime: 10,
    views: 0,
    likes: 0
  },
  {
    title: 'Optimización de Performance: Core Web Vitals',
    slug: 'optimizacion-performance-core-web-vitals',
    excerpt: 'Mejora el rendimiento de tu app React y optimiza Core Web Vitals.',
    content: `# Optimización de Performance

Google usa Core Web Vitals para rankear sitios.

## Core Web Vitals

1. LCP - Largest Contentful Paint
2. FID - First Input Delay
3. CLS - Cumulative Layout Shift

## Optimizar LCP

\`\`\`jsx
import Image from 'next/image';

function Hero() {
  return (
    <Image
      src="/hero.jpg"
      width={1200}
      height={600}
      priority
      placeholder="blur"
    />
  );
}
\`\`\`

## Code Splitting

\`\`\`jsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
});
\`\`\`

Los Core Web Vitals afectan SEO. Optimiza continuamente.`,
    category: 'performance',
    tags: ['performance', 'react', 'web-vitals', 'seo'],
    status: 'published',
    readTime: 12,
    views: 0,
    likes: 0
  },
  {
    title: 'APIs REST con Node.js y Express',
    slug: 'apis-rest-nodejs-express',
    excerpt: 'Aprende a crear APIs REST profesionales con Node.js y Express.',
    content: `# APIs REST con Node.js y Express

Construye APIs REST escalables y seguras.

## Setup

\`\`\`bash
npm install express mongoose cors helmet
\`\`\`

## Configuración básica

\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.listen(3000);
\`\`\`

## Modelo

\`\`\`javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});
\`\`\`

## Mejores prácticas

1. Usa variables de entorno
2. Valida todos los inputs
3. Implementa rate limiting
4. Documenta tu API

Crear APIs profesionales requiere seguir convenciones y buenas prácticas.`,
    category: 'backend',
    tags: ['nodejs', 'express', 'api', 'backend'],
    status: 'published',
    readTime: 15,
    views: 0,
    likes: 0
  },
  {
    title: 'CSS Moderno: Grid, Flexbox y Container Queries',
    slug: 'css-moderno-grid-flexbox-container-queries',
    excerpt: 'Domina las técnicas modernas de CSS para layouts responsivos.',
    content: `# CSS Moderno

Aprende técnicas CSS modernas sin frameworks.

## CSS Grid

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
\`\`\`

## Flexbox

\`\`\`css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
\`\`\`

## Container Queries

\`\`\`css
.card-container {
  container-type: inline-size;
}

@container (min-width: 500px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}
\`\`\`

## Variables CSS

\`\`\`css
:root {
  --primary-color: #3b82f6;
}

.button {
  background: var(--primary-color);
}
\`\`\`

CSS moderno te da súper poderes sin frameworks pesados.`,
    category: 'frontend',
    tags: ['css', 'grid', 'flexbox', 'responsive'],
    status: 'published',
    readTime: 10,
    views: 0,
    likes: 0
  }
];

async function initBlogContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Inicializar categorías
    console.log('\n📁 Inicializando categorías...');
    const existingCategories = await Category.find();

    if (existingCategories.length === 0) {
      await Category.insertMany(categories);
      console.log(`✅ ${categories.length} categorías creadas`);
    } else {
      console.log(`ℹ️  Ya existen ${existingCategories.length} categorías`);
    }

    // Obtener admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No se encontró usuario admin. Crea uno primero.');
      process.exit(1);
    }

    console.log('\n📝 Inicializando posts de blog...');
    const existingPosts = await BlogPost.find();

    if (existingPosts.length === 0) {
      const postsWithAuthor = blogPosts.map(post => ({
        ...post,
        author: adminUser._id
      }));

      await BlogPost.insertMany(postsWithAuthor);
      console.log(`✅ ${blogPosts.length} posts de blog creados`);
    } else {
      console.log(`ℹ️  Ya existen ${existingPosts.length} posts`);
    }

    console.log('\n✅ Contenido del blog inicializado correctamente');
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initBlogContent();
