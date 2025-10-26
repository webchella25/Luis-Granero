// src/models/Appointment.js - MEJORADO
import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  // Relación con el lead
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  
  // Token único para el magic link
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Datos de contacto
  name: {
    type: String,
    required: true
  },
  phone: String,
  email: String,
  
  // Fecha y hora de la cita
  scheduledDate: Date,
  scheduledTime: String,
  
  // Estado de la cita
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  
  // ✅ NUEVO: Notas de la llamada
  callNotes: {
    type: String,
    default: ''
  },
  
  // ✅ NUEVO: Duración de la llamada
  duration: {
    planned: {
      type: Number, // minutos
      default: 30
    },
    actual: {
      type: Number, // minutos reales
      default: null
    },
    startedAt: Date,
    endedAt: Date
  },
  
  // ✅ NUEVO: Resultado de la llamada
  callResult: {
    converted: {
      type: Boolean,
      default: null // null = no evaluado aún
    },
    interest: {
      type: String,
      enum: ['hot', 'warm', 'cold', null],
      default: null
    },
    nextSteps: String,
    budgetDiscussed: String,
    closingProbability: {
      type: Number, // 0-100
      min: 0,
      max: 100,
      default: null
    }
  },
  
  // Notas adicionales (pre-llamada)
  notes: String,
  
  // ✅ NUEVO: Recordatorios enviados con tracking
  remindersSent: [{
    type: { 
      type: String, 
      enum: ['email_24h', 'email_1h', 'sms_24h', 'sms_1h', 'manual'] 
    },
    sentAt: Date,
    opened: {
      type: Boolean,
      default: false
    },
    openedAt: Date
  }],
  
  // Token expiration
  tokenExpiresAt: {
    type: Date,
    required: true
  },
  
  // ✅ NUEVO: Origen de la cita
  source: {
    type: String,
    enum: ['website_form', 'manual', 'import', 'api'],
    default: 'website_form'
  },
  
  // ✅ NUEVO: Razón de cancelación
  cancellationReason: {
    type: String,
    enum: ['not_interested', 'too_expensive', 'bad_timing', 'found_alternative', 'no_response', 'other', null],
    default: null
  },
  cancellationNotes: String,
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
AppointmentSchema.index({ token: 1, tokenExpiresAt: 1 });
AppointmentSchema.index({ leadId: 1 });
AppointmentSchema.index({ scheduledDate: 1, status: 1 });
AppointmentSchema.index({ status: 1, scheduledDate: 1 });

// ✅ Virtual para saber si está expirado
AppointmentSchema.virtual('isExpired').get(function() {
  return this.tokenExpiresAt < new Date();
});

// ✅ Virtual para saber si necesita recordatorio
AppointmentSchema.virtual('needsReminder').get(function() {
  if (!this.scheduledDate || this.status !== 'confirmed') return false;
  
  const now = new Date();
  const appointmentDate = new Date(this.scheduledDate);
  const hoursUntil = (appointmentDate - now) / (1000 * 60 * 60);
  
  // Necesita recordatorio si es en 24h y no se ha enviado
  const needs24h = hoursUntil <= 24 && hoursUntil > 1 && 
    !this.remindersSent.some(r => r.type === 'email_24h');
  
  // Necesita recordatorio si es en 1h y no se ha enviado
  const needs1h = hoursUntil <= 1 && hoursUntil > 0 && 
    !this.remindersSent.some(r => r.type === 'email_1h');
  
  return needs24h || needs1h;
});

// ✅ Método para calcular duración automáticamente
AppointmentSchema.methods.calculateDuration = function() {
  if (this.duration.startedAt && this.duration.endedAt) {
    const durationMs = this.duration.endedAt - this.duration.startedAt;
    this.duration.actual = Math.round(durationMs / (1000 * 60)); // minutos
  }
  return this.duration.actual;
};

// ✅ Método para marcar recordatorio como enviado
AppointmentSchema.methods.markReminderSent = function(type) {
  this.remindersSent.push({
    type,
    sentAt: new Date()
  });
  return this.save();
};

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);