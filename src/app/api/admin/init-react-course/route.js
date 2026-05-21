// src/app/api/admin/init-react-course/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import EmailCourse from '@/models/EmailCourse'
import logger from '@/lib/logger'

export async function POST(request) {
  try {


    await dbConnect()

    // Verificar si ya existe
    const existing = await EmailCourse.findOne({ slug: 'react-5-dias' })
    if (existing) {
      return NextResponse.json({
        error: 'El curso ya existe',
        courseId: existing._id
      }, { status: 400 })
    }

    // Crear el curso de React
    const course = await EmailCourse.create({
      title: 'React en 5 Días',
      slug: 'react-5-dias',
      description: 'Aprende React desde cero en 5 días. Un email diario con lecciones prácticas, ejemplos de código y ejercicios para dominar los fundamentos de React.',
      shortDescription: 'Domina React en 5 días con lecciones prácticas diarias',
      icon: '⚛️',
      color: 'cyan',
      totalDays: 5,
      ctaText: '¡Quiero Aprender React!',
      sendTime: '09:00',
      isActive: true,

      benefits: [
        'Aprende a tu ritmo con lecciones diarias',
        'Ejemplos de código reales y prácticos',
        'Ejercicios para reforzar lo aprendido',
        'Acceso directo a mi soporte por email',
        'Certificado al completar el curso',
        '100% gratis, sin tarjeta de crédito'
      ],

      whatYouLearn: [
        'Fundamentos de React y JSX',
        'Componentes funcionales y props',
        'Estado y hooks (useState, useEffect)',
        'Manejo de eventos y formularios',
        'Buenas prácticas y patrones comunes'
      ],

      testimonials: [
        {
          name: 'María González',
          text: 'Increíble curso. En solo 5 días pasé de no saber nada de React a crear mi primera app. ¡Totalmente recomendado!',
          avatar: '👩‍💻'
        },
        {
          name: 'Carlos Ruiz',
          text: 'Las explicaciones son claras y los ejemplos muy útiles. Luis tiene un don para enseñar.',
          avatar: '👨‍💻'
        }
      ],

      emails: [
        {
          day: 1,
          subject: '⚛️ Día 1: Bienvenido a React - Tu primer componente',
          previewText: 'Hoy aprenderás qué es React y crearás tu primer componente',
          htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #61dafb; }
    h2 { color: #282c34; margin-top: 30px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
    pre { background: #282c34; color: #61dafb; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .cta { background: #61dafb; color: #282c34; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>⚛️ Día 1: Bienvenido a React</h1>

  <p>Hola {{name}},</p>

  <p>¡Bienvenido al curso de React en 5 días! 🎉</p>

  <p>Estoy muy emocionado de acompañarte en este viaje. Durante los próximos 5 días, recibirás un email cada mañana con una lección práctica que te llevará desde cero hasta crear aplicaciones React reales.</p>

  <h2>📚 ¿Qué es React?</h2>

  <p>React es una biblioteca de JavaScript creada por Facebook para construir interfaces de usuario interactivas. Es:</p>

  <ul>
    <li><strong>Declarativo:</strong> Describes cómo debería verse tu UI y React se encarga del resto</li>
    <li><strong>Basado en componentes:</strong> Construyes piezas reutilizables</li>
    <li><strong>Aprende una vez, escribe en cualquier lugar:</strong> Web, móvil, desktop</li>
  </ul>

  <h2>🚀 Tu Primer Componente</h2>

  <p>Un componente React es como un bloque de construcción. Aquí está el más simple:</p>

  <pre><code>function Saludo() {
  return &lt;h1&gt;¡Hola Mundo!&lt;/h1&gt;;
}

export default Saludo;</code></pre>

  <p>Este componente hace tres cosas:</p>
  <ol>
    <li>Define una función llamada <code>Saludo</code></li>
    <li>Retorna JSX (HTML dentro de JavaScript)</li>
    <li>Se exporta para usarlo en otros archivos</li>
  </ol>

  <div class="highlight">
    <strong>💡 Dato clave:</strong> JSX parece HTML pero es JavaScript. Por eso usamos <code>className</code> en lugar de <code>class</code> y <code>onClick</code> en lugar de <code>onclick</code>.
  </div>

  <h2>✏️ Ejercicio del Día</h2>

  <p>Crea un componente que muestre tu nombre y tu ocupación:</p>

  <pre><code>function MiPerfil() {
  return (
    &lt;div&gt;
      &lt;h2&gt;Tu Nombre&lt;/h2&gt;
      &lt;p&gt;Tu Ocupación&lt;/p&gt;
    &lt;/div&gt;
  );
}</code></pre>

  <p><strong>Reto:</strong> Añade más información como tu ciudad o un hobby.</p>

  <h2>📖 Para Mañana</h2>

  <p>En el Día 2 aprenderás sobre <strong>Props</strong> - cómo hacer que tus componentes sean reutilizables pasándoles datos.</p>

  <p>¿Tienes dudas? Responde a este email, ¡estoy aquí para ayudarte!</p>

  <p>Nos vemos mañana,<br>
  <strong>Luis Granero</strong><br>
  Desarrollador Full Stack</p>

  <div class="footer">
    <p>¿No quieres recibir más emails? <a href="{{unsubscribe_url}}">Darse de baja</a></p>
  </div>
</body>
</html>
          `
        },
        {
          day: 2,
          subject: '⚛️ Día 2: Props - Componentes Reutilizables',
          previewText: 'Aprende a pasar datos a tus componentes con props',
          htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #61dafb; }
    h2 { color: #282c34; margin-top: 30px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
    pre { background: #282c34; color: #61dafb; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>⚛️ Día 2: Props</h1>

  <p>Hola {{name}},</p>

  <p>¡Bienvenido al segundo día! Hoy aprenderás uno de los conceptos más importantes de React: <strong>Props</strong>.</p>

  <h2>🎯 ¿Qué son las Props?</h2>

  <p>Props (properties) son datos que pasas de un componente padre a un componente hijo. Es como pasar argumentos a una función.</p>

  <pre><code>// Componente hijo
function Tarjeta({ titulo, descripcion }) {
  return (
    &lt;div&gt;
      &lt;h3&gt;{titulo}&lt;/h3&gt;
      &lt;p&gt;{descripcion}&lt;/p&gt;
    &lt;/div&gt;
  );
}

// Componente padre
function App() {
  return (
    &lt;Tarjeta
      titulo="React"
      descripcion="Biblioteca de UI"
    /&gt;
  );
}</code></pre>

  <div class="highlight">
    <strong>💡 Regla de oro:</strong> Las props son <strong>de solo lectura</strong>. Un componente nunca debe modificar sus propias props.
  </div>

  <h2>🔄 Reutilización</h2>

  <p>El poder de las props está en la reutilización:</p>

  <pre><code>function App() {
  return (
    &lt;&gt;
      &lt;Tarjeta titulo="React" descripcion="UI" /&gt;
      &lt;Tarjeta titulo="Next.js" descripcion="Framework" /&gt;
      &lt;Tarjeta titulo="TypeScript" descripcion="Tipado" /&gt;
    &lt;/&gt;
  );
}</code></pre>

  <p>¡El mismo componente, datos diferentes! 🎉</p>

  <h2>✏️ Ejercicio del Día</h2>

  <p>Crea un componente <code>Producto</code> que reciba:</p>
  <ul>
    <li>nombre</li>
    <li>precio</li>
    <li>enStock (booleano)</li>
  </ul>

  <p>Muestra "Disponible" o "Agotado" según el valor de <code>enStock</code>.</p>

  <h2>📖 Para Mañana</h2>

  <p>En el Día 3 aprenderás sobre <strong>Estado (State)</strong> - cómo hacer que tus componentes sean interactivos y respondan a acciones del usuario.</p>

  <p>¡Sigue así! 💪</p>

  <p>Saludos,<br>
  <strong>Luis</strong></p>

  <div class="footer">
    <p>¿No quieres recibir más emails? <a href="{{unsubscribe_url}}">Darse de baja</a></p>
  </div>
</body>
</html>
          `
        },
        {
          day: 3,
          subject: '⚛️ Día 3: Estado y useState - Componentes Interactivos',
          previewText: 'Haz que tus componentes respondan a las acciones del usuario',
          htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #61dafb; }
    h2 { color: #282c34; margin-top: 30px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
    pre { background: #282c34; color: #61dafb; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>⚛️ Día 3: Estado y useState</h1>

  <p>Hola {{name}},</p>

  <p>¡Ya vas por la mitad del curso! 🎉 Hoy aprenderás a hacer que tus componentes sean <strong>interactivos</strong>.</p>

  <h2>🔄 ¿Qué es el Estado?</h2>

  <p>El estado es la memoria de tu componente. Son datos que pueden cambiar con el tiempo y hacer que React re-renderice el componente.</p>

  <pre><code>import { useState } from 'react';

function Contador() {
  const [count, setCount] = useState(0);

  return (
    &lt;div&gt;
      &lt;p&gt;Contador: {count}&lt;/p&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        Incrementar
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>

  <h2>📊 Anatomía de useState</h2>

  <pre><code>const [valor, setValor] = useState(valorInicial);</code></pre>

  <ul>
    <li><code>valor</code>: El estado actual</li>
    <li><code>setValor</code>: Función para actualizar el estado</li>
    <li><code>valorInicial</code>: Valor al montar el componente</li>
  </ul>

  <div class="highlight">
    <strong>💡 Importante:</strong> Nunca modifiques el estado directamente con <code>count = 5</code>. Siempre usa la función <code>setCount(5)</code>.
  </div>

  <h2>🎨 Múltiples Estados</h2>

  <p>Un componente puede tener varios estados:</p>

  <pre><code>function Formulario() {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState(0);
  const [activo, setActivo] = useState(true);

  return (
    &lt;div&gt;
      &lt;input
        value={nombre}
        onChange={(e) =&gt; setNombre(e.target.value)}
      /&gt;
    &lt;/div&gt;
  );
}</code></pre>

  <h2>✏️ Ejercicio del Día</h2>

  <p>Crea un botón "Me gusta" que:</p>
  <ol>
    <li>Muestre el número de likes</li>
    <li>Incremente el contador al hacer click</li>
    <li>Cambie de color cuando tenga más de 10 likes</li>
  </ol>

  <h2>📖 Para Mañana</h2>

  <p>En el Día 4 aprenderás sobre <strong>useEffect</strong> - cómo reaccionar a cambios y hacer llamadas a APIs.</p>

  <p>¡Vas muy bien! 🚀</p>

  <p>Saludos,<br>
  <strong>Luis</strong></p>

  <div class="footer">
    <p>¿No quieres recibir más emails? <a href="{{unsubscribe_url}}">Darse de baja</a></p>
  </div>
</body>
</html>
          `
        },
        {
          day: 4,
          subject: '⚛️ Día 4: useEffect - Efectos Secundarios y APIs',
          previewText: 'Aprende a hacer llamadas a APIs y manejar efectos secundarios',
          htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #61dafb; }
    h2 { color: #282c34; margin-top: 30px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
    pre { background: #282c34; color: #61dafb; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>⚛️ Día 4: useEffect</h1>

  <p>Hola {{name}},</p>

  <p>¡Penúltimo día! 💪 Hoy aprenderás uno de los hooks más potentes: <strong>useEffect</strong>.</p>

  <h2>⚡ ¿Qué es useEffect?</h2>

  <p>useEffect te permite ejecutar código después de que el componente se renderice. Es perfecto para:</p>

  <ul>
    <li>Llamadas a APIs</li>
    <li>Suscripciones</li>
    <li>Timers</li>
    <li>Actualizar el DOM manualmente</li>
  </ul>

  <h2>🎯 Ejemplo Básico</h2>

  <pre><code>import { useState, useEffect } from 'react';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    // Se ejecuta después del render
    fetch('https://api.example.com/users')
      .then(res => res.json())
      .then(data => setUsuarios(data));
  }, []); // Array vacío = solo una vez

  return (
    &lt;ul&gt;
      {usuarios.map(user => (
        &lt;li key={user.id}&gt;{user.name}&lt;/li&gt;
      ))}
    &lt;/ul&gt;
  );
}</code></pre>

  <h2>🔄 Array de Dependencias</h2>

  <p>El segundo argumento controla cuándo se ejecuta el efecto:</p>

  <pre><code>useEffect(() => {
  // Se ejecuta después de cada render
});

useEffect(() => {
  // Solo una vez (al montar)
}, []);

useEffect(() => {
  // Cuando 'count' cambia
}, [count]);</code></pre>

  <div class="highlight">
    <strong>💡 Regla importante:</strong> Incluye en el array todas las variables que uses dentro del effect.
  </div>

  <h2>🧹 Limpieza</h2>

  <p>Algunos efectos necesitan limpieza:</p>

  <pre><code>useEffect(() => {
  const timer = setInterval(() => {
    console.log('Tick');
  }, 1000);

  // Función de limpieza
  return () => {
    clearInterval(timer);
  };
}, []);</code></pre>

  <h2>✏️ Ejercicio del Día</h2>

  <p>Crea un componente que:</p>
  <ol>
    <li>Obtenga datos de <code>https://jsonplaceholder.typicode.com/posts</code></li>
    <li>Muestre un "Cargando..." mientras espera</li>
    <li>Liste los títulos de los posts cuando lleguen</li>
  </ol>

  <h2>📖 Para Mañana</h2>

  <p>¡Último día! Aprenderás <strong>buenas prácticas</strong>, patrones comunes y cómo estructurar tu proyecto React.</p>

  <p>¡Un día más! 🎉</p>

  <p>Saludos,<br>
  <strong>Luis</strong></p>

  <div class="footer">
    <p>¿No quieres recibir más emails? <a href="{{unsubscribe_url}}">Darse de baja</a></p>
  </div>
</body>
</html>
          `
        },
        {
          day: 5,
          subject: '⚛️ Día 5: Buenas Prácticas y Próximos Pasos 🎓',
          previewText: '¡Felicidades! Completaste el curso. Aquí están tus próximos pasos',
          htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #61dafb; }
    h2 { color: #282c34; margin-top: 30px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
    pre { background: #282c34; color: #61dafb; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .highlight { background: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
    .cta-box { background: #61dafb; color: #282c34; padding: 20px; border-radius: 10px; margin: 30px 0; text-align: center; }
    .cta-button { background: #282c34; color: #61dafb; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>🎉 ¡Felicidades {{name}}!</h1>

  <p>Has completado el curso de <strong>React en 5 Días</strong>. ¡Increíble trabajo! 👏</p>

  <h2>📚 Lo que Aprendiste</h2>

  <ul>
    <li>✅ Componentes y JSX</li>
    <li>✅ Props para pasar datos</li>
    <li>✅ Estado con useState</li>
    <li>✅ Efectos con useEffect</li>
    <li>✅ Patrones y buenas prácticas</li>
  </ul>

  <h2>💎 Buenas Prácticas Esenciales</h2>

  <h3>1. Estructura de Componentes</h3>
  <pre><code>function MiComponente({ prop1, prop2 }) {
  // 1. Hooks primero
  const [state, setState] = useState();
  useEffect(() => {}, []);

  // 2. Funciones auxiliares
  const handleClick = () => {};

  // 3. Return
  return &lt;div&gt;...&lt;/div&gt;;
}</code></pre>

  <h3>2. Nombrar Componentes</h3>
  <ul>
    <li>PascalCase para componentes: <code>UserProfile</code></li>
    <li>camelCase para funciones: <code>handleSubmit</code></li>
    <li>Nombres descriptivos: <code>isLoading</code> mejor que <code>loading</code></li>
  </ul>

  <h3>3. Extraer Componentes</h3>
  <p>Si un componente tiene más de 100 líneas, probablemente puedes dividirlo.</p>

  <div class="highlight">
    <strong>🎯 Regla de oro:</strong> Un componente = Una responsabilidad
  </div>

  <h2>🚀 Próximos Pasos</h2>

  <p>Ahora que dominas los fundamentos, aquí están tus opciones para continuar:</p>

  <ol>
    <li><strong>Practica:</strong> Crea un proyecto personal (TODO list, clima app, etc.)</li>
    <li><strong>Aprende Next.js:</strong> Framework de React para producción</li>
    <li><strong>TypeScript:</strong> Añade tipado a tus proyectos</li>
    <li><strong>State Management:</strong> Zustand o Redux para apps grandes</li>
  </ol>

  <h2>📖 Recursos Recomendados</h2>

  <ul>
    <li>📘 <a href="https://react.dev">Documentación Oficial de React</a></li>
    <li>🎥 <a href="https://luisgranero.com/blog">Mi Blog con Tutoriales</a></li>
    <li>💼 <a href="https://luisgranero.com/portfolio">Proyectos de Ejemplo</a></li>
  </ul>

  <div class="cta-box">
    <h2>🎓 ¿Necesitas Ayuda con un Proyecto?</h2>
    <p>Si tienes un proyecto en mente o necesitas mentoría personalizada, estoy aquí para ayudarte.</p>
    <a href="https://luisgranero.com/contacto" class="cta-button">Hablemos de tu Proyecto</a>
  </div>

  <h2>💌 Última Palabra</h2>

  <p>Gracias por confiar en mí para aprender React. Ver tu progreso durante estos 5 días ha sido increíble.</p>

  <p>Recuerda: el desarrollo web es un camino de aprendizaje continuo. No tengas miedo de experimentar, cometer errores y hacer preguntas.</p>

  <p>Si este curso te ayudó, me encantaría que lo compartieras con otros desarrolladores que quieran aprender React.</p>

  <p>¡Mucho éxito en tu viaje con React! 🚀</p>

  <p>Con cariño,<br>
  <strong>Luis Granero</strong><br>
  Desarrollador Full Stack<br>
  <a href="https://luisgranero.com">luisgranero.com</a></p>

  <div class="footer">
    <p>P.D: Responde a este email si tienes preguntas o quieres contarme qué construiste con React. ¡Me encantaría saberlo!</p>
    <p>¿No quieres recibir más emails? <a href="{{unsubscribe_url}}">Darse de baja</a></p>
  </div>
</body>
</html>
          `
        }
      ]
    })

    logger.info(`React course created successfully: ${course._id}`)

    return NextResponse.json({
      success: true,
      message: 'Curso de React creado exitosamente',
      course: {
        id: course._id,
        title: course.title,
        slug: course.slug
      }
    }, { status: 201 })

  } catch (error) {
    logger.error('Error creating React course:', error)
    return NextResponse.json({
      error: 'Error al crear curso',
      details: error.message
    }, { status: 500 })
  }
}
