import mongoose from 'mongoose';

const BudgetRequestSchema = new mongoose.Schema({
  clientInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: String
  },
  
  budget: {
    projectType: {
      id: String,
      name: String,
      basePrice: Number
    },
    selectedFeatures: [{
      id: String,
      name: String,
      price: Number,
      category: String
    }],
    timeline: {
      id: String,
      name: String,
      multiplier: Number,
      days: Number
    },
    appliedDiscount: {
      id: String,
      name: String,
      percentage: Number
    },
    subtotal: Number,
    discount: Number,
    timelineAdjustment: Number,
    total: Number
  },
  
  message: String,
  
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'contacted', 'converted', 'rejected'],
    default: 'pending'
  },
  
  adminNotes: String,
  source: { type: String, default: 'web-calculator' },
  ipAddress: String,
  userAgent: String
  
}, {
  timestamps: true
});

BudgetRequestSchema.index({ 'clientInfo.email': 1 });
BudgetRequestSchema.index({ status: 1 });
BudgetRequestSchema.index({ createdAt: -1 });

export default mongoose.models.BudgetRequest || mongoose.model('BudgetRequest', BudgetRequestSchema);