// scripts/init-legal-pages.js
// Script para crear las páginas legales iniciales en la base de datos

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Conectar a MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Schema de LegalPage
const LegalPageSchema = new mongoose.Schema({
  pageType: {
    type: String,
    enum: ['aviso-legal', 'privacidad', 'cookies', 'terminos'],
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  metaDescription: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

const LegalPage = mongoose.models.LegalPage || mongoose.model('LegalPage', LegalPageSchema);

// Templates de contenido
const templates = {
  'aviso-legal': {
    title: 'Aviso Legal',
    slug: 'aviso-legal',
    metaDescription: 'Aviso legal y términos de uso del sitio web de Luis Granero',
    content: `# Aviso Legal

**Última actualización:** {{currentDate}}

## 1. Datos Identificativos

En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los siguientes datos:

**Titular:** {{ownerName}}  
**NIF/DNI:** {{dni}}  
**Domicilio:** {{address}}, {{postalCode}} {{city}}, {{country}}  
**Email:** {{email}}  
**Teléfono:** {{phone}}  
**Sitio Web:** {{website}}

## 2. Objeto

El presente aviso legal regula el uso y utilización del sitio web {{website}}, del que es titular {{companyName}}.

La navegación por el sitio web atribuye la condición de usuario del mismo e implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal.

## 3. Propiedad Intelectual e Industrial

Todos los contenidos del sitio web, incluyendo, sin carácter limitativo, textos, fotografías, gráficos, imágenes, iconos, tecnología, software, links y demás contenidos audiovisuales o sonoros, así como su diseño gráfico y códigos fuente, son propiedad intelectual de {{companyName}}, sin que puedan entenderse cedidos al usuario ninguno de los derechos de explotación reconocidos por la normativa vigente en materia de propiedad intelectual sobre los mismos.

## 4. Uso del Sitio Web

El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que se ofrecen a través del sitio web y a no emplearlos para:

- Difundir contenidos delictivos, violentos, pornográficos, racistas, xenófobos, ofensivos, de apología del terrorismo o, en general, contrarios a la ley o al orden público.
- Introducir en la red virus informáticos o realizar actuaciones susceptibles de alterar, estropear, interrumpir o generar errores o daños en los documentos electrónicos, datos o sistemas físicos y lógicos.
- Intentar acceder a las cuentas de correo electrónico de otros usuarios o a áreas restringidas de los sistemas informáticos del sitio web o de terceros.
- Vulnerar los derechos de propiedad intelectual o industrial, así como violar la confidencialidad de la información.

## 5. Responsabilidad

{{companyName}} no se hace responsable de:

- La calidad del servicio, la velocidad de acceso, el correcto funcionamiento ni la disponibilidad ni continuidad del funcionamiento del sitio web.
- Los contenidos introducidos por terceros a través de formularios, comentarios o cualquier otra herramienta habilitada.
- El uso que terceros puedan hacer de los contenidos del sitio web.

## 6. Enlaces

El establecimiento de un hiperenlace desde una página web ajena a este sitio web no implica que exista algún tipo de relación entre {{companyName}} y el titular de la página web desde la que se realiza el enlace.

## 7. Protección de Datos

Para más información sobre el tratamiento de datos personales, consulta nuestra [Política de Privacidad](/legal/privacidad).

## 8. Modificaciones

{{companyName}} se reserva el derecho a modificar el presente Aviso Legal en cualquier momento, siendo publicadas las sucesivas versiones en el sitio web.

## 9. Legislación Aplicable

Las presentes condiciones se rigen por la legislación española. Para cualquier controversia que pudiera derivarse del acceso o uso del sitio web, las partes se someten a los Juzgados y Tribunales de {{city}}.

---

**{{companyName}}** - {{website}}`
  },
  
  'privacidad': {
    title: 'Política de Privacidad',
    slug: 'privacidad',
    metaDescription: 'Política de privacidad y protección de datos de Luis Granero',
    content: `# Política de Privacidad

**Última actualización:** {{currentDate}}

## 1. Responsable del Tratamiento

De conformidad con el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales (RGPD), te informamos que:

**Responsable:** {{ownerName}}  
**NIF/DNI:** {{dni}}  
**Domicilio:** {{address}}, {{postalCode}} {{city}}, {{country}}  
**Email:** {{email}}  
**Teléfono:** {{phone}}

## 2. Datos que Recopilamos

### 2.1 Datos proporcionados por el usuario

Recopilamos los datos personales que nos proporcionas voluntariamente cuando:

- Rellenas formularios de contacto
- Te suscribes a nuestra newsletter
- Solicitas información o presupuestos
- Interactúas con nuestros servicios

Estos datos pueden incluir:
- Nombre y apellidos
- Email
- Teléfono
- Empresa
- Mensaje o consulta

### 2.2 Datos recopilados automáticamente

Cuando visitas nuestro sitio web, recopilamos automáticamente cierta información sobre tu dispositivo, incluyendo:

- Dirección IP
- Tipo de navegador
- Páginas visitadas
- Tiempo de permanencia
- Fuente de referencia

Esta información se recopila mediante cookies y tecnologías similares. Para más información, consulta nuestra [Política de Cookies](/legal/cookies).

## 3. Finalidad del Tratamiento

Utilizamos tus datos personales para:

- **Gestión de consultas:** Responder a tus solicitudes de información o presupuestos
- **Comunicaciones comerciales:** Enviarte información sobre nuestros servicios (solo si has dado tu consentimiento)
- **Mejora del servicio:** Analizar el uso del sitio web para mejorar la experiencia de usuario
- **Cumplimiento legal:** Cumplir con obligaciones legales aplicables

## 4. Legitimación

La base legal para el tratamiento de tus datos personales es:

- **Consentimiento:** Has dado tu consentimiento expreso para el tratamiento de tus datos
- **Ejecución de contrato:** El tratamiento es necesario para la ejecución de un contrato
- **Interés legítimo:** El tratamiento es necesario para satisfacer nuestros intereses legítimos

## 5. Conservación de los Datos

Conservaremos tus datos personales durante:

- **Consultas:** El tiempo necesario para gestionar tu solicitud más 1 año
- **Newsletter:** Hasta que retires tu consentimiento
- **Obligaciones legales:** El tiempo requerido por ley

## 6. Derechos del Usuario

Tienes derecho a:

- **Acceso:** Conocer qué datos personales tenemos sobre ti
- **Rectificación:** Corregir datos inexactos o incompletos
- **Supresión:** Solicitar la eliminación de tus datos ("derecho al olvido")
- **Limitación:** Solicitar la limitación del tratamiento
- **Portabilidad:** Recibir tus datos en formato estructurado
- **Oposición:** Oponerte al tratamiento de tus datos

Para ejercer tus derechos, envía un email a {{email}} indicando el derecho que deseas ejercer.

## 7. Reclamaciones

Si consideras que el tratamiento de tus datos personales vulnera el RGPD, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD):

**Web:** www.aepd.es  
**Dirección:** C/ Jorge Juan, 6, 28001 Madrid  
**Teléfono:** 901 100 099

## 8. Seguridad

Hemos adoptado medidas técnicas y organizativas para proteger tus datos personales frente a pérdida, uso indebido, acceso no autorizado, divulgación, alteración o destrucción.

---

**{{companyName}}** - {{website}}`
  },
  
  'cookies': {
    title: 'Política de Cookies',
    slug: 'cookies',
    metaDescription: 'Política de uso de cookies en el sitio web de Luis Granero',
    content: `# Política de Cookies

**Última actualización:** {{currentDate}}

## 1. ¿Qué son las cookies?

Una cookie es un pequeño archivo de texto que se almacena en tu navegador cuando visitas casi cualquier página web. Su utilidad es que la web sea capaz de recordar tu visita cuando vuelvas a navegar por esa página.

## 2. ¿Qué tipos de cookies utiliza este sitio web?

### Cookies Técnicas (Necesarias)

Son aquellas que permiten la navegación a través de la página web y la utilización de las diferentes opciones o servicios que en ella existen.

**Proveedor:** {{companyName}}  
**Finalidad:** Funcionamiento básico del sitio web  
**Duración:** Sesión / 1 año  
**Tipo:** Primera parte

### Cookies Analíticas

Son aquellas que nos permiten cuantificar el número de usuarios y realizar análisis estadístico del uso que hacen los usuarios del servicio.

**Google Analytics**  
**Proveedor:** Google LLC  
**Finalidad:** Análisis estadístico del tráfico web  
**Duración:** 2 años  
**Tipo:** Tercera parte

## 3. ¿Cómo puedo gestionar las cookies?

Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones del navegador instalado en tu ordenador.

### Principales navegadores:

- **Google Chrome:** Configuración > Privacidad y seguridad > Cookies
- **Mozilla Firefox:** Opciones > Privacidad y seguridad > Cookies
- **Safari:** Preferencias > Privacidad > Cookies
- **Microsoft Edge:** Configuración > Cookies y permisos del sitio

## 4. Contacto

Si tienes dudas acerca de nuestra Política de Cookies, puedes contactarnos:

**Email:** {{email}}  
**Teléfono:** {{phone}}

---

**{{companyName}}** - {{website}}`
  },
  
  'terminos': {
    title: 'Términos y Condiciones',
    slug: 'terminos',
    metaDescription: 'Términos y condiciones de uso del sitio web de Luis Granero',
    content: `# Términos y Condiciones de Uso

**Última actualización:** {{currentDate}}

## 1. Aceptación de los Términos

Al acceder y utilizar el sitio web {{website}}, aceptas estar obligado por estos Términos y Condiciones.

Si no estás de acuerdo con alguno de estos términos, no utilices este Sitio.

## 2. Uso del Sitio Web

### 2.1 Licencia de Uso

Se te concede una licencia limitada, no exclusiva, no transferible y revocable para acceder y utilizar el Sitio únicamente para fines personales y no comerciales.

### 2.2 Restricciones de Uso

Al utilizar este Sitio, aceptas NO:

- Usar el Sitio de manera que viole leyes o regulaciones
- Intentar acceder a áreas restringidas del Sitio
- Interferir o interrumpir la integridad o rendimiento del Sitio
- Utilizar robots, scrapers u otras herramientas automatizadas sin autorización

## 3. Servicios Ofrecidos

{{companyName}} ofrece servicios de desarrollo web freelance, incluyendo:

- Desarrollo de sitios web personalizados
- Aplicaciones web (SPAs, PWAs)
- E-commerce personalizado
- Desarrollo de APIs y backends
- Optimización y mantenimiento web
- Consultoría técnica

## 4. Propiedad Intelectual

Todo el contenido incluido en este Sitio es propiedad de {{companyName}} o de sus proveedores de contenido y está protegido por las leyes españolas e internacionales de propiedad intelectual.

## 5. Limitación de Responsabilidad

{{companyName}} NO será responsable de pérdidas indirectas, incidentales o consecuentes derivadas del uso del Sitio.

## 6. Modificaciones

{{companyName}} se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento.

## 7. Ley Aplicable

Estos Términos se regirán por las leyes de España. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de {{city}}.

## 8. Contacto

Para cualquier pregunta sobre estos Términos y Condiciones:

**Email:** {{email}}  
**Teléfono:** {{phone}}  
**Dirección:** {{address}}, {{postalCode}} {{city}}, {{country}}

---

**{{companyName}}** - {{website}}`
  }
};

// Función principal
async function initLegalPages() {
  try {
    await connectDB();
    
    console.log('\n🚀 Inicializando páginas legales...\n');
    
    for (const [pageType, data] of Object.entries(templates)) {
      try {
        // Verificar si ya existe
        const existing = await LegalPage.findOne({ pageType });
        
        if (existing) {
          console.log(`⚠️  La página "${data.title}" ya existe, saltando...`);
          continue;
        }
        
        // Crear nueva página
        const page = new LegalPage({
          pageType,
          ...data,
          isPublished: true
        });
        
        await page.save();
        console.log(`✅ Página "${data.title}" creada correctamente`);
      } catch (error) {
        console.error(`❌ Error creando "${data.title}":`, error.message);
      }
    }
    
    console.log('\n✅ Proceso completado!\n');
    console.log('📋 Recuerda configurar tus datos legales en /admin/legal\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar
initLegalPages();