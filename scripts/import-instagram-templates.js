// scripts/import-instagram-templates.js
// VERSIÓN SIMPLE - Sin dotenv, MongoDB URI por parámetro o variable de entorno

const mongoose = require('mongoose');

// ✅ Usar MONGODB_URI del sistema o pasarla como argumento
const MONGODB_URI = process.env.MONGODB_URI || process.argv[2];

if (!MONGODB_URI) {
  console.error('❌ Error: Falta MONGODB_URI');
  console.log('\n📝 Opciones para ejecutar:');
  console.log('1. Con variable de entorno:');
  console.log('   set MONGODB_URI=mongodb+srv://... && node scripts/import-instagram-templates.js');
  console.log('\n2. Como argumento:');
  console.log('   node scripts/import-instagram-templates.js "mongodb+srv://..."');
  process.exit(1);
}

// Esquema de MessageTemplate
const MessageTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  message: { type: String, required: true },
  category: {
    type: String,
    enum: ['presentacion', 'propuesta', 'seguimiento', 'oferta', 'otro'],
    required: true
  },
  targetSource: {
    type: String,
    enum: ['instagram', 'linkedin', 'twitter', 'facebook'],
    default: 'instagram'
  },
  availableVariables: [String],
  isActive: { type: Boolean, default: true },
  metadata: {
    conversionRate: { type: Number, default: 0 },
    useCount: { type: Number, default: 0 },
    averageResponseTime: Number,
    lastUsed: Date
  }
}, { timestamps: true });

const MessageTemplate = mongoose.models.MessageTemplate || mongoose.model('MessageTemplate', MessageTemplateSchema);

const instagramTemplates = [
  {
    name: "Presentación Inicial - Desarrollo Web",
    description: "Primer contacto profesional y directo",
    message: `Hola {nombre}! 👋

Soy Luis Granero, desarrollador web freelance.

Vi tu perfil @{username} y me pareció muy interesante tu proyecto en {categoria}.

Noto que tienes {followers} seguidores, pero ¿tu perfil está generando las ventas que esperas?

Muchos negocios como el tuyo están perdiendo clientes porque:
❌ No tienen web propia (solo dependen de Instagram)
❌ Los clientes no pueden comprar 24/7
❌ Es difícil aparecer en Google

Yo creo webs profesionales que convierten visitas en ventas reales.

¿Te gustaría ver cómo podría ayudarte? Sin compromiso.

Saludos,
Luis Granero
🌐 {tu_web}`,
    category: "presentacion",
    targetSource: "instagram",
    availableVariables: ["nombre", "username", "categoria", "followers", "tu_web"],
    isActive: true
  },
  {
    name: "Propuesta de Valor - Sin Web",
    description: "Para negocios que solo tienen Instagram",
    message: `Hola {nombre}! 👋

Me llamo Luis, soy desarrollador web.

Veo que tienes un proyecto increíble en {categoria}, pero noto que no tienes web propia.

¿Sabías que el 78% de tus clientes potenciales te buscan primero en Google antes de Instagram?

Sin una web:
❌ Pierdes ventas mientras duermes
❌ No aparecer en Google = clientes perdidos
❌ Instagram puede cerrar tu cuenta sin aviso

Con una web profesional:
✅ Vendes 24/7 automáticamente
✅ Apareces en Google (más clientes)
✅ Tienes TU propia plataforma
✅ Sistema de pagos integrado

Creo webs desde 1.500€ (con pasarela de pago incluida).

¿Hablamos 10 minutos? Te muestro ejemplos reales.

Saludos,
Luis 💻
{tu_web}`,
    category: "propuesta",
    targetSource: "instagram",
    availableVariables: ["nombre", "categoria", "tu_web"],
    isActive: true
  },
  {
    name: "Seguimiento - Segunda oportunidad",
    description: "Para leads que no respondieron al primer mensaje",
    message: `Hola {nombre}! 👋

Te escribí hace unos días sobre crear una web para tu proyecto de {categoria}.

Entiendo que estés ocupado, pero quería compartirte esto:

📊 Un negocio similar al tuyo aumentó sus ventas en un 340% en 3 meses solo con una web bien hecha.

No es magia, es tener:
✅ Catálogo online accesible 24/7
✅ Sistema de reservas/pagos automático
✅ Aparecer en Google cuando te busquen

¿10 minutos para una videollamada?
Te muestro cómo funcionaría para ti.

Sin compromiso. Si no te interesa, no pasa nada.

Saludos,
Luis Granero
🌐 {tu_web}
📱 Responde "INFO" y te cuento más`,
    category: "seguimiento",
    targetSource: "instagram",
    availableVariables: ["nombre", "categoria", "tu_web"],
    isActive: true
  },
  {
    name: "Oferta Especial - Black Friday / Promo",
    description: "Para campañas con descuento limitado",
    message: `🎁 Hola {nombre}!

Luis Granero aquí, desarrollador web.

Estoy haciendo una PROMO ESPECIAL este mes para negocios de {categoria} en {ubicacion}.

🚀 Paquete Web Profesional:
✅ Diseño personalizado y responsive
✅ Optimizada para Google (SEO)
✅ Formulario de contacto
✅ Panel de administración
✅ Hosting incluido 1 año

💰 Precio normal: 2.500€
🔥 Precio promo: 1.800€

⏰ Solo quedan 3 plazas este mes.

Vi tu Instagram (@{username}) y creo que podríamos hacer algo muy bueno.

¿Hablamos? Te mando ejemplos.

Luis 💻
{tu_web}

PD: Esta promo termina el 30 de este mes.`,
    category: "oferta",
    targetSource: "instagram",
    availableVariables: ["nombre", "categoria", "ubicacion", "username", "tu_web"],
    isActive: true
  },
  {
    name: "Caso de Éxito - Prueba Social",
    description: "Muestra resultados reales para generar confianza",
    message: `Hola {nombre}! 👋

Soy Luis, desarrollador web especializado en {categoria}.

Hace 2 meses trabajé con un negocio muy similar al tuyo (también en {ubicacion}).

📈 Resultados en 60 días:
✅ +340% de consultas desde Google
✅ +127% en conversión de visitas
✅ Sistema de reservas 24/7 automático
✅ Ahora vende mientras duerme

Antes: Solo Instagram (5-10 consultas/mes)
Ahora: Web + Instagram (40-50 consultas/mes)

¿Te gustaría ver el caso completo?

Te mando capturas reales de Analytics.

Creo que puedo ayudarte a conseguir resultados similares.

¿10 min para una llamada?

Saludos,
Luis Granero 💻
{tu_web}

PD: Tengo más casos de éxito en mi web si quieres verlos.`,
    category: "otro",
    targetSource: "instagram",
    availableVariables: ["nombre", "categoria", "ubicacion", "tu_web"],
    isActive: true
  }
];

async function importTemplates() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    const existingCount = await MessageTemplate.countDocuments({ targetSource: 'instagram' });
    
    if (existingCount > 0) {
      console.log(`⚠️  Ya existen ${existingCount} templates de Instagram`);
      console.log('⏳ Eliminando templates antiguos...');
      await MessageTemplate.deleteMany({ targetSource: 'instagram' });
      console.log('✅ Templates antiguos eliminados\n');
    }
    
    console.log('📝 Insertando templates nuevos...');
    const result = await MessageTemplate.insertMany(instagramTemplates);
    
    console.log(`\n✅ ${result.length} templates de Instagram importados!\n`);
    console.log('📋 Templates importados:');
    result.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name}`);
      console.log(`      Categoría: ${template.category}`);
      console.log(`      Variables: ${template.availableVariables.join(', ')}\n`);
    });
    
    console.log('🎉 ¡Listo! Ve a /admin/templates → tab Instagram\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
}

importTemplates();