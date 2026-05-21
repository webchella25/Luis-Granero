## ¿Qué es React?

React es una **librería de JavaScript de código abierto** creada por Facebook (Meta) en 2013 para construir interfaces de usuario. Hoy es la tecnología frontend más usada en el mundo, presente en productos como Facebook, Instagram, Airbnb, Netflix, Notion, Linear y miles de aplicaciones más.

La idea central de React es simple pero poderosa: **la interfaz de usuario es una función de los datos**. Cuando los datos cambian, la UI se actualiza automáticamente. Sin manipulación manual del DOM, sin jQuery, sin gestión compleja de eventos.

---

## ¿Cómo funciona React? Los conceptos clave

### Componentes

React organiza la interfaz en **componentes reutilizables**. Un componente es como una función JavaScript que devuelve HTML:

```jsx
function TarjetaUsuario({ nombre, avatar }) {
  return (
    <div className="card">
      <img src={avatar} alt={nombre} />
      <h2>{nombre}</h2>
    </div>
  );
}
```

La clave es que estos componentes se componen entre sí. Una página entera no es más que componentes dentro de componentes.

### JSX

React usa **JSX**, una sintaxis que parece HTML dentro de JavaScript. El navegador no entiende JSX directamente; se transforma en JavaScript puro durante el proceso de compilación.

### El Virtual DOM

Uno de los secretos del rendimiento de React es el **Virtual DOM**. En lugar de actualizar el DOM real (que es lento) en cada cambio, React mantiene una copia virtual en memoria, calcula qué ha cambiado (diffing) y solo actualiza lo necesario. Esto hace que las interfaces sean extremadamente rápidas.

### Estado y hooks

El **estado** son los datos que pueden cambiar en un componente. React gestiona el estado con **hooks**, funciones especiales que empiezan por `use`:

```jsx
import { useState } from 'react';

function Contador() {
  const [cuenta, setCuenta] = useState(0);

  return (
    <div>
      <p>Has hecho clic {cuenta} veces</p>
      <button onClick={() => setCuenta(cuenta + 1)}>
        Incrementar
      </button>
    </div>
  );
}
```

Cuando `setCuenta` se llama, React re-renderiza el componente con el nuevo valor. Automáticamente.

---

## Los hooks más importantes

| Hook | Para qué sirve |
|------|----------------|
| `useState` | Gestionar estado local del componente |
| `useEffect` | Ejecutar efectos secundarios (fetch, timers, eventos) |
| `useContext` | Compartir datos entre componentes sin prop drilling |
| `useRef` | Acceder a elementos del DOM o guardar valores sin re-render |
| `useMemo` / `useCallback` | Optimizar rendimiento memorizando valores y funciones |

---

## ¿Por qué React domina el mercado?

Varias razones concretas explican por qué React lleva 10 años siendo el líder indiscutible:

**1. Ecosistema maduro.** Miles de librerías construidas específicamente para React: React Router, React Query, Zustand, Framer Motion, shadcn/ui...

**2. Comunidad enorme.** Cualquier problema que tengas, alguien ya lo ha resuelto y lo ha documentado en Stack Overflow, GitHub o YouTube.

**3. Meta como empresa detrás.** Actualización constante, roadmap público y uso masivo en producción que garantiza estabilidad.

**4. Demanda laboral altísima.** React está en el 70–75% de las ofertas de trabajo frontend. Aprenderlo tiene retorno directo.

**5. Versatilidad.** Con React puedes construir webs, apps móviles (React Native), apps de escritorio y hasta realidad virtual (React Three Fiber).

---

## React vs Vue vs Angular: ¿cuál elegir?

| Criterio | React | Vue | Angular |
|----------|-------|-----|---------|
| Curva de aprendizaje | Media | Baja | Alta |
| Flexibilidad | Muy alta | Alta | Media (opinionated) |
| Ecosistema | Enorme | Grande | Grande |
| Demanda laboral | ★★★★★ | ★★★ | ★★★ |
| Ideal para | SPAs, apps complejas | Proyectos medianos | Enterprise |
| Empresa detrás | Meta | Comunidad | Google |

Mi recomendación: si empiezas desde cero y quieres la mejor inversión de tiempo, **React es la elección más segura en 2025**.

---

## ¿Cuándo usar React y cuándo no?

**Usa React cuando:**
- La interfaz tiene mucha interactividad (formularios complejos, tiempo real, filtros dinámicos)
- Necesitas reutilización masiva de componentes
- El proyecto va a crecer y quieres mantenibilidad
- Hay un equipo de más de una persona

**Considera otras opciones cuando:**
- Necesitas SEO crítico y poco JavaScript → puede bastar con HTML + CSS + Alpine.js
- El proyecto es una web estática simple → Astro o Hugo son más eficientes
- El presupuesto es muy limitado → WordPress puede ser suficiente

---

## De React a Next.js

React solo es una librería de UI. Para construir aplicaciones reales necesitas añadir: routing, fetching de datos, optimización de imágenes, configuración de Webpack, SSR...

Ahí entra **Next.js**: el framework construido sobre React que resuelve todos estos problemas. La mayoría de proyectos nuevos en 2025 usan Next.js en lugar de React puro. Si quieres profundizar, lee la [guía completa de Next.js](/blog/guia-completa-nextjs) donde explico App Router, Server Components, SSR y el stack moderno.

---

## ¿Cómo aprender React desde cero?

1. **Aprende JavaScript moderno primero.** Sin bases sólidas de JS (arrow functions, destructuring, promises, módulos), React se hace cuesta arriba.
2. **Empieza con la documentación oficial** de react.dev — es excelente y tiene ejemplos interactivos.
3. **Practica con proyectos pequeños.** Una todo list, un buscador de películas, un clon de cualquier UI simple.
4. **No te pierdas en el ecosistema.** Aprende React core antes de saltar a Redux, React Query o cualquier otra librería.

Si prefieres aprender con estructura y guía, tengo un [curso gratuito de React en 5 días por email](/cursos/react-5-dias) donde construyes una app real desde cero.

---

## Conclusión

React es, en 2025, la habilidad frontend más demandada y versátil del mercado. No es una moda: lleva 10 años evolucionando y mejorando, y su posición como estándar del sector se ha consolidado con el ecosistema de Next.js.

Si estás empezando, es la mejor inversión de tiempo que puedes hacer. Si ya tienes experiencia con otros frameworks, migrarte a React es más sencillo de lo que parece.

¿Tienes dudas o quieres saber si React es adecuado para tu proyecto? [Escríbeme](/contacto), estaré encantado de orientarte.
