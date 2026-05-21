## ¿Qué es Next.js y por qué se ha convertido en el estándar?

Next.js es un **framework de React** creado por Vercel que añade todo lo que React por sí solo no tiene: enrutado, renderizado en servidor, generación estática, optimización de imágenes, API routes y mucho más. La primera vez que alguien trabaja con él suele pensar: "¿por qué no empecé aquí directamente?"

En 2025, Next.js es la elección predeterminada de la mayoría de equipos que construyen aplicaciones React en producción. Lo usan Vercel, Notion, TikTok, Twitch y miles de startups. Si quieres trabajar como desarrollador frontend o full-stack, conocer Next.js es prácticamente obligatorio.

---

## React vs Next.js: ¿cuál es la diferencia real?

React es una librería para construir interfaces. Next.js es un framework que envuelve React y resuelve los problemas que React deja sin respuesta:

| Problema | React solo | Next.js |
|---|---|---|
| Enrutado | Necesitas React Router | Basado en carpetas, automático |
| SEO | Difícil (SPA) | SSR y SSG nativos |
| Rendimiento inicial | Lento (JS en cliente) | HTML listo desde servidor |
| API backend | No incluido | API Routes incluidas |
| Optimización de imágenes | Manual | Componente `<Image>` automático |
| Deploy | Configuración manual | Un comando con Vercel |

Resumen: **React te da los bloques, Next.js te da el edificio**.

---

## Los 3 modos de renderizado de Next.js

Esta es la parte que más confunde al principio. Next.js ofrece tres formas de generar páginas:

### 1. SSG — Generación Estática (Static Site Generation)

El HTML se genera **en tiempo de compilación**. Es el modo más rápido posible porque el servidor solo sirve archivos HTML que ya existen.

Cuándo usarlo:
- Blogs y páginas de contenido que no cambian frecuentemente
- Landing pages, portfolios, documentación

```javascript
// La página se genera una vez al hacer build
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(post => ({ slug: post.slug }));
}
```

### 2. SSR — Renderizado en Servidor (Server-Side Rendering)

El HTML se genera **en cada petición**, en el servidor. El usuario recibe siempre datos frescos.

Cuándo usarlo:
- Dashboards con datos en tiempo real
- E-commerce con precios que cambian
- Páginas personalizadas según el usuario

```javascript
// En App Router (Next.js 13+), los componentes son Server por defecto
async function ProductPage({ params }) {
  const product = await fetch(`/api/products/${params.id}`);
  // Esto se ejecuta en el servidor, no en el navegador
  return <ProductDetail product={product} />;
}
```

### 3. CSR — Renderizado en Cliente (Client-Side Rendering)

Igual que una SPA de React pura. El HTML inicial está vacío, JavaScript carga los datos en el cliente.

Cuándo usarlo:
- Secciones que requieren interactividad inmediata
- Datos que no necesitan SEO
- Componentes con estado complejo

```javascript
'use client'; // Esta directiva marca el componente como cliente

import { useState, useEffect } from 'react';

function UserDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/user-data').then(r => r.json()).then(setData);
  }, []);

  return <div>{data ? <Dashboard data={data} /> : <Skeleton />}</div>;
}
```

---

## El App Router: la forma moderna de Next.js

A partir de Next.js 13, Vercel introdujo el **App Router**, una forma completamente nueva de estructurar aplicaciones basada en React Server Components.

### Estructura de carpetas

```
app/
├── page.tsx          → /
├── sobre-mi/
│   └── page.tsx      → /sobre-mi
├── blog/
│   ├── page.tsx      → /blog
│   └── [slug]/
│       └── page.tsx  → /blog/cualquier-post
└── api/
    └── posts/
        └── route.ts  → /api/posts
```

No hay que configurar rutas. **La estructura de carpetas es el enrutado**.

### Server Components vs Client Components

Esta es la mayor diferencia conceptual del App Router:

- **Server Components** (por defecto): se ejecutan en el servidor. Pueden acceder directamente a bases de datos, leer archivos, usar variables de entorno. No añaden JavaScript al bundle del cliente.
- **Client Components** (`'use client'`): se ejecutan en el navegador. Pueden usar `useState`, `useEffect`, eventos del DOM.

La regla de oro: **usa Server Components siempre que puedas. Baja a Client solo cuando necesites interactividad**.

---

## Optimizaciones incluidas que marcan la diferencia

### Componente Image

```jsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Descripción"
  width={1200}
  height={600}
  priority // Precarga la imagen above-the-fold
/>
```

Automáticamente: redimensiona según el dispositivo, convierte a WebP/AVIF, aplica lazy loading, evita el Cumulative Layout Shift (CLS). Todo gratis.

### Componente Link

```jsx
import Link from 'next/link';

<Link href="/servicios">Ver servicios</Link>
```

Prefetch automático de la página destino cuando el enlace entra en el viewport. La navegación es casi instantánea.

### Metadata API

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      images: [post.featuredImage],
    },
  };
}
```

SEO dinámico por página sin librerías externas.

---

## Cómo empezar: de cero a tu primera app

### 1. Crear el proyecto

```bash
npx create-next-app@latest mi-app --typescript --tailwind --eslint --app
cd mi-app
npm run dev
```

En `http://localhost:3000` ya tienes tu app funcionando.

### 2. Tu primera página

Crea `app/hola/page.tsx`:

```tsx
export default function HolaPage() {
  return (
    <main>
      <h1>Hola desde Next.js</h1>
      <p>Esta página está en /hola</p>
    </main>
  );
}
```

Visita `http://localhost:3000/hola`. Así de simple es el enrutado.

### 3. Fetching de datos

```tsx
// app/posts/page.tsx - Server Component
async function PostsPage() {
  const posts = await fetch('https://jsonplaceholder.typicode.com/posts')
    .then(r => r.json());

  return (
    <ul>
      {posts.slice(0, 10).map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

export default PostsPage;
```

Sin `useEffect`, sin estados de carga manual. El fetch ocurre en el servidor.

---

## Cuándo usar Next.js y cuándo no

**Úsalo si:**
- Necesitas SEO (blog, e-commerce, landing pages)
- La aplicación tiene páginas públicas accesibles sin login
- Quieres un solo repositorio para frontend y API
- El rendimiento inicial importa

**Considera otras opciones si:**
- Es una app interna completamente detrás de login (Vite + React puede ser suficiente)
- El equipo no está familiarizado con SSR y los plazos son muy cortos
- La infraestructura ya está en otro ecosistema y migrar no compensa

---

## Stack moderno con Next.js en 2025

La combinación que usan la mayoría de proyectos nuevos:

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| Componentes UI | shadcn/ui |
| Base de datos | PostgreSQL (Drizzle / Prisma) o MongoDB (Mongoose) |
| Auth | NextAuth.js / Clerk |
| Deploy | Vercel |

Con este stack puedes construir desde un blog personal hasta un SaaS completo.

---

## Preguntas frecuentes

**¿Next.js reemplaza a React?**
No. Next.js usa React internamente. Aprendes React y además aprendes Next.js encima.

**¿Es gratis Next.js?**
El framework es open source y gratuito. Vercel (la empresa detrás) ofrece un plan gratuito generoso para deploy. No estás obligado a usar Vercel.

**¿Necesito saber React antes de aprender Next.js?**
Lo ideal es tener bases de React (componentes, props, estado, hooks). Pero mucha gente aprende ambos en paralelo y funciona bien.

**¿Qué es mejor, Next.js o Nuxt.js?**
Next.js es para React, Nuxt.js es para Vue. Si ya sabes React, usa Next.js. Si prefieres Vue, usa Nuxt.

---

## Próximos pasos

Si quieres profundizar:

1. **[Aprende React desde cero](/blog/que-es-react-guia-completa)** — la base antes de Next.js
2. **[Mis servicios de desarrollo React & Next.js](/servicios/desarrollo-react-nextjs)** — si buscas a alguien que construya tu proyecto
3. La [documentación oficial de Next.js](https://nextjs.org/docs) es de las mejores que existen. El tutorial interactivo de su web es un excelente punto de partida.

Next.js no es magia. Es React con las decisiones difíciles ya tomadas. Y eso, cuando tienes un proyecto real que sacar adelante, vale mucho.
