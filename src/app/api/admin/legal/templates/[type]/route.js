// src/app/api/admin/legal/templates/[type]/route.js
import { NextResponse } from 'next/server';
export async function GET(request, { params }) {
  try {
    const { type } = params;
    
    const templates = {
      'aviso-legal': getAvisoLegalTemplate(),
      'privacidad': getPrivacidadTemplate(),
      'cookies': getCookiesTemplate(),
      'terminos': getTerminosTemplate()
    };
    
    const template = templates[type];
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Templates pre-hechos
function getAvisoLegalTemplate() {
  return `# Aviso Legal

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

**Última actualización:** {{currentDate}}  
**{{companyName}}** - {{website}}`;
}

function getPrivacidadTemplate() {
  return `# Política de Privacidad

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

## 5. Destinatarios de los Datos

Tus datos personales no serán cedidos a terceros, salvo obligación legal.

Utilizamos los siguientes proveedores de servicios que pueden tener acceso a tus datos:

- **Hosting:** Servicios de alojamiento web
- **Email:** Servicios de email marketing (si estás suscrito)
- **Analytics:** Herramientas de análisis web (Google Analytics)

Todos nuestros proveedores cumplen con el RGPD y garantizan la seguridad de tus datos.

## 6. Transferencias Internacionales

Algunos de nuestros proveedores de servicios pueden estar ubicados fuera del Espacio Económico Europeo. En estos casos, garantizamos que se han adoptado las medidas de seguridad adecuadas para proteger tus datos personales.

## 7. Conservación de los Datos

Conservaremos tus datos personales durante:

- **Consultas:** El tiempo necesario para gestionar tu solicitud más 1 año
- **Newsletter:** Hasta que retires tu consentimiento
- **Obligaciones legales:** El tiempo requerido por ley

## 8. Derechos del Usuario

Tienes derecho a:

- **Acceso:** Conocer qué datos personales tenemos sobre ti
- **Rectificación:** Corregir datos inexactos o incompletos
- **Supresión:** Solicitar la eliminación de tus datos ("derecho al olvido")
- **Limitación:** Solicitar la limitación del tratamiento
- **Portabilidad:** Recibir tus datos en formato estructurado
- **Oposición:** Oponerte al tratamiento de tus datos
- **No ser objeto de decisiones automatizadas:** Incluida la elaboración de perfiles

Para ejercer tus derechos, envía un email a {{email}} indicando:
- Nombre y apellidos
- Fotocopia de tu DNI/NIE
- Derecho que deseas ejercer

## 9. Reclamaciones

Si consideras que el tratamiento de tus datos personales vulnera el RGPD, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD):

**Web:** www.aepd.es  
**Dirección:** C/ Jorge Juan, 6, 28001 Madrid  
**Teléfono:** 901 100 099 / 912 663 517

## 10. Seguridad

Hemos adoptado medidas técnicas y organizativas para proteger tus datos personales frente a pérdida, uso indebido, acceso no autorizado, divulgación, alteración o destrucción.

## 11. Modificaciones

Nos reservamos el derecho a modificar esta Política de Privacidad en cualquier momento. Te notificaremos cualquier cambio significativo publicando la nueva política en esta página.

---

**Última actualización:** {{currentDate}}  
**{{companyName}}** - {{website}}`;
}

function getCookiesTemplate() {
  return `# Política de Cookies

**Última actualización:** {{currentDate}}

## 1. ¿Qué son las cookies?

Una cookie es un pequeño archivo de texto que se almacena en tu navegador cuando visitas casi cualquier página web. Su utilidad es que la web sea capaz de recordar tu visita cuando vuelvas a navegar por esa página.

Las cookies suelen almacenar información de carácter técnico, preferencias personales, personalización de contenidos, estadísticas de uso, enlaces a redes sociales, acceso a cuentas de usuario, etc.

## 2. ¿Qué tipos de cookies utiliza este sitio web?

### Cookies Técnicas (Necesarias)

Son aquellas que permiten la navegación a través de la página web y la utilización de las diferentes opciones o servicios que en ella existen.

**Ejemplo:** Control de tráfico y comunicación de datos, identificación de sesión, recordar preferencias de privacidad.

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
**Más información:** [Política de privacidad de Google](https://policies.google.com/privacy)

**Cookies utilizadas:**
- \`_ga\`: Registra una identificación única para generar datos estadísticos
- \`_gid\`: Registra una identificación única para generar datos estadísticos
- \`_gat\`: Utilizada para limitar la frecuencia de solicitudes

### Cookies de Preferencias

Permiten recordar información para que accedas al servicio con determinadas características que pueden diferenciar tu experiencia de la de otros usuarios.

**Ejemplo:** Idioma preferido, región, número de resultados a mostrar, configuración de privacidad.

### Cookies Publicitarias (si aplica)

Son aquellas que permiten la gestión eficaz de los espacios publicitarios incluidos en la página web.

*Actualmente no utilizamos cookies publicitarias en este sitio web.*

### Cookies de Redes Sociales (si aplica)

Permiten compartir contenido con amigos y redes. Las cookies de redes sociales pueden rastrear tu navegación por internet.

*Las cookies de redes sociales solo se instalan si compartes contenido a través de los botones sociales.*

## 3. ¿Cómo puedo gestionar las cookies?

Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones del navegador instalado en tu ordenador.

### Google Chrome
1. Configuración > Privacidad y seguridad > Cookies y otros datos de sitios
2. Elige tus preferencias

[Más información](https://support.google.com/chrome/answer/95647)

### Mozilla Firefox
1. Opciones > Privacidad y seguridad > Cookies y datos del sitio
2. Elige tus preferencias

[Más información](https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias)

### Safari
1. Preferencias > Privacidad > Cookies y datos de sitios web
2. Elige tus preferencias

[Más información](https://support.apple.com/es-es/guide/safari/sfri11471/mac)

### Microsoft Edge
1. Configuración > Cookies y permisos del sitio
2. Elige tus preferencias

[Más información](https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09)

## 4. Deshabilitar cookies

Ten en cuenta que si desactivas las cookies técnicas, la calidad del sitio web puede disminuir y algunas funciones pueden dejar de funcionar correctamente.

## 5. ¿Con qué frecuencia actualizaremos esta política?

Podemos actualizar la Política de Cookies de nuestro sitio web para reflejar, por ejemplo, cambios en las cookies que utilizamos o por otras razones operativas, legales o reglamentarias.

Por favor, visita esta Política de Cookies regularmente para mantenerte informado sobre nuestro uso de cookies.

## 6. ¿Dónde puedo obtener más información?

Si tienes dudas acerca de nuestra Política de Cookies, puedes contactarnos:

**Email:** {{email}}  
**Teléfono:** {{phone}}

También puedes consultar más información sobre:

- [Política de Privacidad](/legal/privacidad)
- [Aviso Legal](/legal/aviso-legal)

---

**Última actualización:** {{currentDate}}  
**{{companyName}}** - {{website}}`;
}

function getTerminosTemplate() {
  return `# Términos y Condiciones de Uso

**Última actualización:** {{currentDate}}

## 1. Aceptación de los Términos

Al acceder y utilizar el sitio web {{website}} (en adelante, "el Sitio"), aceptas estar obligado por estos Términos y Condiciones, todas las leyes y regulaciones aplicables, y aceptas que eres responsable del cumplimiento de todas las leyes locales aplicables.

Si no estás de acuerdo con alguno de estos términos, no utilices este Sitio.

## 2. Uso del Sitio Web

### 2.1 Licencia de Uso

Se te concede una licencia limitada, no exclusiva, no transferible y revocable para acceder y utilizar el Sitio únicamente para fines personales y no comerciales.

### 2.2 Restricciones de Uso

Al utilizar este Sitio, aceptas NO:

- Usar el Sitio de manera que viole leyes o regulaciones
- Intentar acceder a áreas restringidas del Sitio
- Interferir o interrumpir la integridad o rendimiento del Sitio
- Realizar ingeniería inversa del Sitio o cualquiera de sus componentes
- Utilizar robots, scrapers u otras herramientas automatizadas sin autorización
- Transmitir virus, malware o cualquier código de naturaleza destructiva
- Hacerse pasar por otra persona o entidad
- Recopilar información de otros usuarios sin su consentimiento

## 3. Servicios Ofrecidos

{{companyName}} ofrece servicios de desarrollo web freelance, incluyendo pero no limitado a:

- Desarrollo de sitios web personalizados
- Aplicaciones web (SPAs, PWAs)
- E-commerce personalizado
- Desarrollo de APIs y backends
- Optimización y mantenimiento web
- Consultoría técnica

### 3.1 Proceso de Contratación

1. **Consulta inicial:** Contacto a través del formulario o email
2. **Briefing:** Definición de requisitos y alcance del proyecto
3. **Presupuesto:** Propuesta económica y cronograma
4. **Contrato:** Formalización del acuerdo por escrito
5. **Desarrollo:** Ejecución del proyecto con hitos definidos
6. **Entrega:** Finalización y transferencia del proyecto

### 3.2 Condiciones de Pago

- **Anticipo:** Se requiere un 50% del presupuesto total para iniciar el proyecto
- **Pago final:** El 50% restante se abona al finalizar y entregar el proyecto
- **Método de pago:** Transferencia bancaria o PayPal
- **Factura:** Se emitirá factura conforme a la legislación española vigente

## 4. Propiedad Intelectual

### 4.1 Contenido del Sitio

Todo el contenido incluido en este Sitio, como textos, gráficos, logotipos, iconos, imágenes, código y software, es propiedad de {{companyName}} o de sus proveedores de contenido y está protegido por las leyes españolas e internacionales de propiedad intelectual.

### 4.2 Trabajos Personalizados

Los derechos de propiedad intelectual de los trabajos desarrollados se transferirán al cliente una vez realizado el pago completo, salvo pacto en contrario establecido en el contrato específico del proyecto.

## 5. Garantías y Responsabilidades

### 5.1 Garantía de Calidad

{{companyName}} garantiza que los servicios se prestarán con:
- Profesionalidad y diligencia
- Código limpio y bien documentado
- Cumplimiento de estándares web actuales
- Testing funcional antes de la entrega

### 5.2 Limitación de Responsabilidad

{{companyName}} NO será responsable de:

- Pérdidas indirectas, incidentales o consecuentes
- Pérdida de beneficios o ingresos
- Interrupciones del negocio
- Pérdida de datos (se recomienda realizar copias de seguridad regularmente)
- Daños causados por mal uso o modificaciones no autorizadas
- Problemas derivados de servicios de terceros (hosting, dominios, etc.)

La responsabilidad máxima se limitará al importe pagado por el servicio.
## 6. Protección de Datos

El tratamiento de datos personales se rige por nuestra [Política de Privacidad](/legal/privacidad), que forma parte integral de estos Términos y Condiciones.

## 7. Modificaciones del Servicio

{{companyName}} se reserva el derecho de:

- Modificar o discontinuar el Sitio (o cualquier parte del mismo) en cualquier momento
- Cambiar estos Términos y Condiciones cuando sea necesario
- Actualizar precios y tarifas con previo aviso

Las modificaciones entrarán en vigor inmediatamente después de su publicación en el Sitio.

## 8. Enlaces a Terceros

Este Sitio puede contener enlaces a sitios web de terceros. {{companyName}} no controla ni es responsable del contenido, políticas de privacidad o prácticas de sitios web de terceros.

## 9. Resolución de Disputas

### 9.1 Ley Aplicable

Estos Términos se regirán e interpretarán de acuerdo con las leyes de España.

### 9.2 Jurisdicción

Para cualquier controversia derivada de estos Términos, las partes se someten a los Juzgados y Tribunales de {{city}}, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.

### 9.3 Resolución Amistosa

Antes de acudir a los tribunales, las partes intentarán resolver cualquier disputa de manera amistosa mediante negociación de buena fe.

## 10. Cancelación y Reembolsos

### 10.1 Cancelación por el Cliente

El cliente puede cancelar el proyecto en cualquier momento, pero:
- Si se cancela antes de iniciar: Reembolso del 100% del anticipo
- Si se cancela durante el desarrollo: Se cobrará el trabajo realizado hasta la fecha
- Si se cancela tras la entrega: No hay reembolso

### 10.2 Cancelación por {{companyName}}

{{companyName}} puede cancelar un proyecto si:
- El cliente incumple los plazos de pago acordados
- El cliente no proporciona la información o materiales necesarios
- Existen circunstancias extraordinarias que impidan la finalización

En estos casos, se facturará únicamente el trabajo realizado.

## 11. Confidencialidad

Ambas partes se comprometen a mantener confidencial toda la información compartida durante el proyecto, incluyendo pero no limitado a:
- Información comercial y estratégica
- Datos técnicos y de acceso
- Información de usuarios y clientes

## 12. Contacto

Para cualquier pregunta sobre estos Términos y Condiciones, puedes contactarnos:

**Email:** {{email}}  
**Teléfono:** {{phone}}  
**Dirección:** {{address}}, {{postalCode}} {{city}}, {{country}}

## 13. Divisibilidad

Si cualquier disposición de estos Términos fuera declarada inválida o inaplicable, las disposiciones restantes continuarán en pleno vigor y efecto.

## 14. Acuerdo Completo

Estos Términos constituyen el acuerdo completo entre tú y {{companyName}} con respecto al uso del Sitio.

---

**Última actualización:** {{currentDate}}  
**{{companyName}}** - {{website}}

Al utilizar este sitio web, confirmas que has leído, entendido y aceptado estos Términos y Condiciones.`;
}