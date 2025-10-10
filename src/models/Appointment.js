// src/models/Appointment.js
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
  phone: {
    type: String,
    required: true
  },
  email: String,
  
  // Fecha y hora de la cita
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  
  // Estado de la cita
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  
  // Notas adicionales
  notes: String,
  
  // Recordatorios enviados
  remindersSent: [{
    type: { type: String, enum: ['email', 'sms'] },
    sentAt: Date
  }],
  
  // Token expiration
  tokenExpiresAt: {
    type: Date,
    required: true
  },
  
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

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);