import mongoose from 'mongoose';

const ContactPageSchema = new mongoose.Schema({
  hero: {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true }
  },
  contactInfo: {
    email: { type: String, required: true },
    phone: String,
    location: String,
    availability: String,
    responseTime: String
  },
  socialLinks: [{
    platform: String,
    url: String,
    icon: String
  }],
  // CALCULADORA COMPLETAMENTE EDITABLE
  budgetCalculator: {
    enabled: { type: Boolean, default: true },
    title: { type: String, default: 'Calculadora de Presupuesto' },
    subtitle: { type: String, default: 'Obtén una estimación instantánea' },
    
    projectTypes: [{
      id: String,
      name: String,
      basePrice: Number,
      description: String,
      icon: String,
      order: { type: Number, default: 0 }
    }],
    
    features: [{
      id: String,
      name: String,
      price: Number,
      description: String,
      category: { type: String, enum: ['frontend', 'backend', 'design', 'extra', 'seo'] },
      order: { type: Number, default: 0 }
    }],
    
    timelines: [{
      id: String,
      name: String,
      multiplier: Number,
      days: Number,
      description: String,
      order: { type: Number, default: 0 }
    }],
    
    discounts: [{
      id: String,
      name: String,
      percentage: Number,
      minAmount: Number,
      description: String,
      enabled: { type: Boolean, default: true }
    }]
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

export default mongoose.models.ContactPage || mongoose.model('ContactPage', ContactPageSchema);