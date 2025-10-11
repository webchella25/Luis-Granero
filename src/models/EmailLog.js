// src/models/EmailLog.js - NUEVO ARCHIVO
import mongoose from 'mongoose';

const EmailLogSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  
  sequenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sequence',
    required: true
  },
  
  enrollmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  step: {
    type: Number,
    required: true
  },
  
  templateId: {
    type: String,
    required: true
  },
  
  emailTo: String,
  subject: String,
  
  // Estado del email
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'failed', 'opened', 'clicked'],
    default: 'scheduled'
  },
  
  scheduledFor: Date,
  sentAt: Date,
  openedAt: Date,
  clickedAt: Date,
  
  // Tracking
  messageId: String, // ID del proveedor de email
  error: String,
  
  // Métricas
  opened: {
    type: Boolean,
    default: false
  },
  clicked: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
EmailLogSchema.index({ leadId: 1, sequenceId: 1 });
EmailLogSchema.index({ status: 1, scheduledFor: 1 });
EmailLogSchema.index({ enrollmentId: 1 });

export default mongoose.models.EmailLog || mongoose.model('EmailLog', EmailLogSchema);