// src/models/TechStack.js - Tecnologías dominadas
import mongoose from 'mongoose';

const techStackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  color: {
    type: String,
    required: true,
    match: /^#[0-9A-Fa-f]{6}$/
  },
  category: {
    type: String,
    required: true,
    enum: ['frontend', 'backend', 'database', 'tools', 'mobile', 'design']
  },
  description: String,
  yearsExperience: Number,
  projects: [{ // Proyectos donde se usó esta tecnología
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  orderIndex: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.models.TechStack || mongoose.model('TechStack', techStackSchema);