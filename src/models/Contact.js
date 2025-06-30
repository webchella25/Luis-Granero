// src/models/Contact.js - Formularios de contacto
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  personal: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: String,
    company: String,
    website: String
  },
  project: {
    type: {
      type: String,
      required: true,
      enum: ['Desarrollo Web', 'E-commerce', 'Aplicación Web', 'APIs', 'SEO', 'Auditoría', 'Consultoría', 'Otro']
    },
    budget: {
      type: String,
      enum: ['< 1,000€', '1,000€ - 3,000€', '3,000€ - 7,000€', '7,000€ - 15,000€', '> 15,000€', 'A consultar']
    },
    timeline: {
      type: String,
      enum: ['Urgente (1-2 semanas)', 'Pronto (1 mes)', 'Medio plazo (2-3 meses)', 'Largo plazo (3+ meses)', 'Flexible']
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000
    },
    technologies: [String], // Tecnologías específicas solicitadas
    features: [String] // Features específicas requeridas
  },
  source: {
    type: String,
    enum: ['Website', 'LinkedIn', 'Referencia', 'Google', 'GitHub', 'Otro'],
    default: 'Website'
  },
  status: {
    type: String,
    enum: ['nuevo', 'contactado', 'en_progreso', 'propuesta_enviada', 'cerrado_ganado', 'cerrado_perdido'],
    default: 'nuevo'
  },
  priority: {
    type: String,
    enum: ['baja', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String,
    utm: {
      source: String,
      medium: String,
      campaign: String
    }
  },
  notes: String, // Notas internas
  followUpDate: Date,
  responseTime: Number // Tiempo en horas para primera respuesta
}, {
  timestamps: true
});

contactSchema.index({ status: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ 'project.type': 1 });
contactSchema.index({ createdAt: -1 });

export default mongoose.models.Contact || mongoose.model('Contact', contactSchema);