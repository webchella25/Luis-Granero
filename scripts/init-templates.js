// scripts/init-templates.js - VERSIÓN CORREGIDA
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const TemplateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['email', 'whatsapp', 'sms', 'copy'], required: true },
  subject: String,
  body: { type: String, required: true },
  variables: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema);

const defaultTemplates = [
  // ========== EMAILS ==========
  {
    id: 'email_no_website',
    name: 'Email - Sin Website',
    type: 'email',
    subject: 'Oportunidad digital para {{business_name}}',
    body: `Hola,

Soy Luis Granero, desarrollador web especializado en {{category}}.

He encontrado {{business_name}} en Google Maps y me he dado cuenta de que no tienen presencia web. En un mercado donde el 85% de clientes buscan online antes de visitar un negocio, esto representa una gran oportunidad perdida.

✨ Puedo ayudarte a crear una web profesional que:
- Atraiga más clientes locales a través de Google
- Muestre tu negocio 24/7, incluso cuando estés cerrado
- Aumente tu credibilidad frente a la competencia

Con {{review_count}} reseñas y una valoración de {{rating}} estrellas, es claro que ofreces un gran servicio. Una web profesional potenciaría aún más ese éxito.

👉 Agenda una llamada gratuita: {{magic_link}}

Solo una charla para ver cómo puedo ayudarte.

Saludos,
Luis Granero
Desarrollo Web Profesional
🌐 www.luisgranero.com
📧 luis@luisgranero.com`,
    variables: ['business_name', 'category', 'review_count', 'rating', 'magic_link']
  },
  
  {
    id: 'email_slow_website',
    name: 'Email - Website Lento',
    type: 'email',
    subject: 'Mejora la velocidad de {{business_name}} - Análisis gratuito',
    body: `Hola,

Soy Luis Granero, desarrollador web especializado en optimización de rendimiento.

He analizado la web de {{business_name}} y he detectado que tarda {{load_time}} segundos en cargar.

⚠️ Problemas detectados:
{{issues_list}}

¿Sabías que? Google penaliza las webs lentas, y los usuarios abandonan si tardan más de 3 segundos. Esto te está costando ventas cada día.

💡 Puedo ayudarte a mejorar hasta un 70% la velocidad:
- Más conversiones
- Mejor posicionamiento en Google
- Mejor experiencia de usuario

👉 Agenda un análisis gratuito: {{magic_link}}

Solo una charla para ver cómo puedo ayudarte.

Saludos,
Luis Granero
Desarrollo Web & Optimización
🌐 www.luisgranero.com
📧 luis@luisgranero.com`,
    variables: ['business_name', 'load_time', 'issues_list', 'magic_link']
  },

  // ========== WHATSAPP ==========
  {
    id: 'whatsapp_default',
    name: 'WhatsApp - Mensaje General',
    type: 'whatsapp',
    body: `Hola! 👋

Soy Luis Granero, desarrollador web.

He visto *{{business_name}}* en Google Maps y creo que podría ayudaros a conseguir más clientes online.

Con {{review_count}} reseñas positivas, es claro que ofrecéis un gran servicio. Una web profesional potenciaría aún más vuestro éxito.

¿Te interesaría una llamada de 15 minutos para hablar de vuestra presencia digital?

Un saludo!
Luis Granero
www.luisgranero.com`,
    variables: ['business_name', 'review_count']
  },

  {
    id: 'whatsapp_followup',
    name: 'WhatsApp - Seguimiento',
    type: 'whatsapp',
    body: `Hola de nuevo! 👋

Te escribí hace unos días sobre mejorar la presencia digital de {{business_name}}.

¿Has tenido tiempo de pensarlo?

Estoy disponible esta semana si quieres que charlemos 15 minutos sin compromiso.

Saludos!
Luis`,
    variables: ['business_name']
  },

  // ========== COPIAR MENSAJE (para redes sociales) ==========
  {
    id: 'copy_universal',
    name: 'Copiar - Mensaje Universal',
    type: 'copy',
    body: `Hola! 👋

Soy Luis Granero, desarrollador web especializado en {{category}}.

He visto *{{business_name}}* en Google Maps y creo que podría ayudaros a conseguir más clientes online.

Puedo ayudarte a crear una web profesional que:
✅ Atraiga más clientes locales a través de Google
✅ Muestre tu negocio 24/7
✅ Aumente tu credibilidad frente a la competencia

Con {{review_count}} reseñas positivas y {{rating}} estrellas, es claro que ofrecéis un gran servicio. Una web profesional potenciaría aún más vuestro éxito.

¿Te interesaría una llamada gratuita de 15 minutos para ver cómo podemos mejorar vuestra presencia digital?

Puedes responder este mensaje o llamarme cuando prefieras.

Un saludo! 🚀
Luis Granero
Desarrollo Web Profesional
📧 luis@luisgranero.com
🌐 www.luisgranero.com`,
    variables: ['business_name', 'category', 'review_count', 'rating']
  },

  // ========== EMAIL CONFIRMACIÓN CITA ==========
  {
    id: 'email_appointment_confirmation',
    name: 'Email - Confirmación de Cita',
    type: 'email',
    subject: 'Confirmación de llamada - Luis Granero',
    body: `Hola {{contact_name}},

Tu llamada ha sido agendada correctamente.

📅 Detalles de la Llamada:
- Fecha: {{scheduled_date}}
- Hora: {{scheduled_time}}
- Teléfono: {{phone}}

ℹ️ ¿Qué hablaremos?
- Tu proyecto y objetivos
- Soluciones técnicas recomendadas
- Presupuesto y plazos

Te llamaré puntualmente a la hora acordada. Si necesitas cambiar la fecha o tienes alguna pregunta, responde este email.

Saludos,
Luis Granero
Desarrollo Web Profesional
🌐 www.luisgranero.com
📧 luis@luisgranero.com`,
    variables: ['contact_name', 'scheduled_date', 'scheduled_time', 'phone']
  },

  // ========== SMS (opcional) ==========
  {
    id: 'sms_quick',
    name: 'SMS - Mensaje Rápido',
    type: 'sms',
    body: `Hola! Soy Luis, desarrollador web. He visto {{business_name}} y creo que puedo ayudaros a conseguir más clientes online. ¿Hablamos? 📱 luisgranero.com`,
    variables: ['business_name']
  }
];

async function initTemplates() {
  try {
    // Verificar que tenemos la URI de MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI no está definido en .env.local');
      console.log('💡 Asegúrate de tener un archivo .env.local con MONGODB_URI');
      process.exit(1);
    }

    console.log('🔌 Conectando a MongoDB...');
    console.log(`📍 URI: ${process.env.MONGODB_URI.substring(0, 30)}...`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    console.log('📝 Inicializando templates...\n');
    
    for (const template of defaultTemplates) {
      await Template.findOneAndUpdate(
        { id: template.id },
        template,
        { upsert: true, new: true }
      );
      console.log(`✅ ${template.type.toUpperCase().padEnd(10)} - ${template.name}`);
    }
    
    console.log('\n🎉 Todos los templates fueron inicializados correctamente');
    console.log(`📊 Total: ${defaultTemplates.length} templates`);
    console.log(`   📧 Emails: ${defaultTemplates.filter(t => t.type === 'email').length}`);
    console.log(`   📱 WhatsApp: ${defaultTemplates.filter(t => t.type === 'whatsapp').length}`);
    console.log(`   📋 Copiar: ${defaultTemplates.filter(t => t.type === 'copy').length}`);
    console.log(`   💬 SMS: ${defaultTemplates.filter(t => t.type === 'sms').length}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar
initTemplates();