// src/models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  leadName: String,

  type: {
    type: String,
    enum: ['email_opened', 'email_clicked', 'demo_visited', 'lead_stale', 'appointment_booked'],
    required: true
  },

  title: { type: String, required: true },
  message: String,

  // Metadata extra (emailLogId, demoToken, etc.)
  metadata: mongoose.Schema.Types.Mixed,

  isRead: { type: Boolean, default: false },
  readAt: Date,

  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ leadId: 1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
