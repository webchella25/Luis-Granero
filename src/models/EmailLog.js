// src/models/EmailLog.js - ACTUALIZADO CON TRACKING AVANZADO
import mongoose from 'mongoose';

const EmailLogSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  
  templateId: {
    type: String
  },
  
  emailTo: String,
  subject: String,
  emailBody: String, // Guardamos el contenido para referencia
  
  // Estado del email
  status: {
    type: String,
    enum: ['scheduled', 'sending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'],
    default: 'scheduled'
  },
  
  // Fechas de tracking
  scheduledFor: Date,
  sentAt: Date,
  deliveredAt: Date,
  
  // Tracking de aperturas
  opened: {
    type: Boolean,
    default: false
  },
  openedAt: Date,
  openCount: {
    type: Number,
    default: 0
  },
  openEvents: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String,
    location: String
  }],
  
  // Tracking de clicks
  clicked: {
    type: Boolean,
    default: false
  },
  clickedAt: Date,
  clickCount: {
    type: Number,
    default: 0
  },
  clickEvents: [{
    timestamp: Date,
    url: String,
    ipAddress: String,
    userAgent: String
  }],
  
  // Información del proveedor
  messageId: String, // ID del proveedor de email (Brevo, SendGrid, etc.)
  provider: {
    type: String,
    default: 'brevo'
  },
  
  // Errores y bounces
  error: String,
  bounceReason: String,
  bounceType: String, // hard, soft, complaint
  
  // Métricas calculadas
  timeToOpen: Number, // Segundos desde envío hasta primera apertura
  timeToClick: Number, // Segundos desde envío hasta primer click
  
  // Metadata
  source: {
    type: String,
    enum: ['manual', 'campaign', 'contact', 'email_course'],
    default: 'manual'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para optimizar queries
EmailLogSchema.index({ status: 1, scheduledFor: 1 });
EmailLogSchema.index({ messageId: 1 }, { unique: true, sparse: true });
EmailLogSchema.index({ emailTo: 1, sentAt: -1 });
EmailLogSchema.index({ opened: 1, clicked: 1 });

// Método para registrar apertura
EmailLogSchema.methods.trackOpen = async function(metadata = {}) {
  const now = new Date();
  
  this.opened = true;
  this.openCount += 1;
  
  if (!this.openedAt) {
    this.openedAt = now;
    
    // Calcular tiempo hasta primera apertura
    if (this.sentAt) {
      this.timeToOpen = Math.floor((now - this.sentAt) / 1000);
    }
  }
  
  this.openEvents.push({
    timestamp: now,
    ipAddress: metadata.ip,
    userAgent: metadata.userAgent,
    location: metadata.location
  });
  
  // Actualizar estado si no está en opened o clicked
  if (this.status === 'sent' || this.status === 'delivered') {
    this.status = 'opened';
  }
  
  return this.save();
};

// Método para registrar click
EmailLogSchema.methods.trackClick = async function(url, metadata = {}) {
  const now = new Date();
  
  this.clicked = true;
  this.clickCount += 1;
  
  if (!this.clickedAt) {
    this.clickedAt = now;
    
    // Calcular tiempo hasta primer click
    if (this.sentAt) {
      this.timeToClick = Math.floor((now - this.sentAt) / 1000);
    }
  }
  
  this.clickEvents.push({
    timestamp: now,
    url,
    ipAddress: metadata.ip,
    userAgent: metadata.userAgent
  });
  
  this.status = 'clicked';
  
  return this.save();
};

export default mongoose.models.EmailLog || mongoose.model('EmailLog', EmailLogSchema);
