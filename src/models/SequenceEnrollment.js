// src/models/SequenceEnrollment.js - NUEVO ARCHIVO
import mongoose from 'mongoose';

const SequenceEnrollmentSchema = new mongoose.Schema({
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
  
  currentStep: {
    type: Number,
    default: 0
  },
  
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'failed'],
    default: 'active'
  },
  
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: Date,
  pausedAt: Date,
  
  // Auto-pausar si el lead responde o cambia de estado
  autoPauseOnReply: {
    type: Boolean,
    default: true
  },
  
  autoPauseOnStatusChange: {
    type: Boolean,
    default: true
  },
  
  pauseReason: String,
  
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

// Un lead solo puede estar en una secuencia activa a la vez
SequenceEnrollmentSchema.index({ leadId: 1, status: 1 }, { unique: false });

export default mongoose.models.SequenceEnrollment || mongoose.model('SequenceEnrollment', SequenceEnrollmentSchema);