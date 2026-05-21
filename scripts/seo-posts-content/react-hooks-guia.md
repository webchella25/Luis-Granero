## ¿Qué son los hooks de React?

Los hooks son funciones especiales de React que te permiten usar **estado y otras características de React** en componentes funcionales. Antes de los hooks (introducidos en React 16.8, 2019) todo eso requería clases. Hoy las clases son legado — los hooks son la forma moderna y recomendada de escribir React.

La regla más importante: **los hooks siempre empiezan por `use`**.

---

## useState — el hook fundamental

Gestiona un valor que puede cambiar en el tiempo. Cuando cambia, React re-renderiza el componente automáticamente.

```jsx
import { useState } from 'react';

function Contador() {
  const [cuenta, setCuenta] = useState(0); // valor inicial: 0

  return (
    <div>
      <p>Valor: {cuenta}</p>
      <button onClick={() => setCuenta(cuenta + 1)}>+1</button>
      <button onClick={() => setCuenta(0)}>Resetear</button>
    </div>
  );
}
```

`useState` devuelve un array con dos cosas: el valor actual y una función para actualizarlo. El nombre es por convención (`[algo, setAlgo]`).

### Cuándo usar la forma funcional del setter

Si el nuevo estado depende del anterior, usa la forma de función para evitar bugs:

```jsx
// ❌ Puede fallar si hay múltiples updates seguidos
setCuenta(cuenta + 1);

// ✅ Siempre correcto
setCuenta(prev => prev + 1);
```

---

## useEffect — sincronizar con el exterior

`useEffect` ejecuta código como efecto secundario: cuando el componente se monta, cuando cambia un valor, o cuando se desmonta.

```jsx
import { useState, useEffect } from 'react';

function PerfilUsuario({ userId }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    fetch(`/api/usuarios/${userId}`)
      .then(r => r.json())
      .then(setUsuario);
  }, [userId]); // ← array de dependencias

  if (!usuario) return <p>Cargando...</p>;
  return <h1>{usuario.nombre}</h1>;
}
```

### El array de dependencias

| Caso | Comportamiento |
|---|---|
| `useEffect(() => {})` | Ejecuta en cada render (raro, casi nunca correcto) |
| `useEffect(() => {}, [])` | Solo al montar (equivale a componentDidMount) |
| `useEffect(() => {}, [id])` | Al montar y cada vez que cambia `id` |

### La función de limpieza

Si tu efecto crea una suscripción, timer o listener, devuelve una función para limpiarla:

```jsx
useEffect(() => {
  const timer = setInterval(() => setTick(t => t + 1), 1000);
  return () => clearInterval(timer); // se ejecuta al desmontar
}, []);
```

---

## useRef — referencias sin re-render

`useRef` guarda un valor que persiste entre renders **sin causar re-renders** cuando cambia. También sirve para acceder a elementos del DOM.

```jsx
import { useRef } from 'react';

// Uso 1: referencia al DOM
function InputConFocus() {
  const inputRef = useRef(null);

  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={() => inputRef.current.focus()}>
        Enfocar
      </button>
    </>
  );
}

// Uso 2: valor persistente sin re-render
function Cronometro() {
  const intervalRef = useRef(null);

  const iniciar = () => {
    intervalRef.current = setInterval(() => {/* ... */}, 100);
  };

  const parar = () => clearInterval(intervalRef.current);
  // ...
}
```

---

## useContext — datos globales sin prop drilling

El "prop drilling" es pasar props por 3, 4 niveles de componentes hasta llegar al que lo necesita. `useContext` lo elimina.

```jsx
import { createContext, useContext, useState } from 'react';

// 1. Crear el contexto
const TemaContext = createContext('claro');

// 2. Proveedor en lo alto del árbol
function App() {
  const [tema, setTema] = useState('oscuro');
  return (
    <TemaContext.Provider value={tema}>
      <Layout />
    </TemaContext.Provider>
  );
}

// 3. Consumir en cualquier nivel sin pasar props
function BotonTema() {
  const tema = useContext(TemaContext);
  return <button className={tema}>Botón</button>;
}
```

---

## useCallback y useMemo — optimización de rendimiento

Ambos evitan recálculos o recreaciones innecesarias. Úsalos solo cuando tengas un problema de rendimiento real — añaden complejidad sin beneficio si se usan preventivamente.

### useMemo — memoriza un valor calculado

```jsx
import { useMemo } from 'react';

function ListaOrdenada({ items, filtro }) {
  // Sin useMemo: se recalcula en CADA render
  // Con useMemo: solo recalcula si cambia items o filtro
  const itemsFiltrados = useMemo(() => {
    return items
      .filter(item => item.nombre.includes(filtro))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [items, filtro]);

  return <ul>{itemsFiltrados.map(i => <li key={i.id}>{i.nombre}</li>)}</ul>;
}
```

### useCallback — memoriza una función

```jsx
import { useCallback } from 'react';

function Padre() {
  const handleClick = useCallback((id) => {
    console.log('clicked', id);
  }, []); // La función no cambia entre renders

  return <Hijo onClick={handleClick} />;
}
```

---

## useReducer — estado complejo

Cuando `useState` se vuelve complicado (múltiples valores relacionados, lógica compleja), `useReducer` es la alternativa:

```jsx
import { useReducer } from 'react';

const estadoInicial = { cuenta: 0, historial: [] };

function reducer(estado, accion) {
  switch (accion.type) {
    case 'incrementar':
      return {
        cuenta: estado.cuenta + 1,
        historial: [...estado.historial, estado.cuenta + 1]
      };
    case 'resetear':
      return estadoInicial;
    default:
      return estado;
  }
}

function ContadorAvanzado() {
  const [estado, dispatch] = useReducer(reducer, estadoInicial);

  return (
    <div>
      <p>Cuenta: {estado.cuenta}</p>
      <button onClick={() => dispatch({ type: 'incrementar' })}>+1</button>
      <button onClick={() => dispatch({ type: 'resetear' })}>Reset</button>
    </div>
  );
}
```

---

## Hooks personalizados — reutilizar lógica

La gran ventaja de los hooks es que puedes extraer lógica en hooks propios y reutilizarla en cualquier componente. Por convención, su nombre empieza por `use`.

```jsx
// hooks/useFetch.js
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    fetch(url)
      .then(r => r.json())
      .then(data => { setDatos(data); setCargando(false); })
      .catch(err => { setError(err); setCargando(false); });
  }, [url]);

  return { datos, cargando, error };
}

// Uso en cualquier componente
function Posts() {
  const { datos, cargando, error } = useFetch('/api/posts');

  if (cargando) return <Skeleton />;
  if (error) return <Error mensaje={error.message} />;
  return <Lista items={datos} />;
}
```

---

## Reglas de los hooks

React impone dos reglas que no se pueden romper:

1. **Solo en el nivel superior** — nunca dentro de un `if`, bucle o función anidada
2. **Solo en componentes React o hooks personalizados** — nunca en funciones JavaScript normales

```jsx
// ❌ MAL
function Componente({ mostrar }) {
  if (mostrar) {
    const [valor, setValor] = useState(0); // Rompe la regla 1
  }
}

// ✅ BIEN
function Componente({ mostrar }) {
  const [valor, setValor] = useState(0); // Siempre al nivel superior
  if (!mostrar) return null;
  return <div>{valor}</div>;
}
```

El plugin de ESLint `eslint-plugin-react-hooks` te avisa automáticamente cuando rompes estas reglas.

---

## Tabla resumen de hooks

| Hook | Para qué sirve | Cuándo usarlo |
|---|---|---|
| `useState` | Valor reactivo simple | Casi siempre |
| `useEffect` | Efectos secundarios, fetching | Sincronizar con exterior |
| `useRef` | DOM o valor sin re-render | Referencias y timers |
| `useContext` | Datos globales | Evitar prop drilling |
| `useMemo` | Valor calculado caro | Rendimiento probado |
| `useCallback` | Función estable | Props a componentes memorizados |
| `useReducer` | Estado complejo con lógica | Múltiples valores relacionados |

---

## Próximos pasos

- **[¿Qué es React? Guía completa](/blog/que-es-react-guia-completa)** — si quieres entender los fundamentos antes de los hooks
- **[Guía completa de Next.js](/blog/guia-completa-nextjs)** — el framework que lleva los hooks al servidor
- **[Mis cursos gratuitos de React](/cursos)** — aprende con proyectos reales paso a paso
- ¿Quieres aplicar esto en tu empresa? [Contáctame para una consultoría técnica](/servicios/consultoria)
