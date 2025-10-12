// src/models/Sequence.js - VERIFICAR QUE EXISTE
import mongoose from 'mongoose';

const SequenceStepSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    min: 0
  },
  templateId: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    default: null
  },
  description: String
});

const SequenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  steps: [SequenceStepSchema],
  
  trigger: {
    type: String,
    enum: ['manual', 'auto_no_website', 'auto_slow_website', 'auto_no_ssl'],
    default: 'manual'
  },
  
  stats: {
    totalStarted: { type: Number, default: 0 },
    totalCompleted: { type: Number, default: 0 },
    totalActive: { type: Number, default: 0 },
    totalPaused: { type: Number, default: 0 }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
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

export default mongoose.models.Sequence || mongoose.model('Sequence', SequenceSchema);