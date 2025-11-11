// src/models/CourseProgress.js
import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath',
    required: true,
    index: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedArticles: [{
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogPost'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number,
      default: 0 // minutos
    }
  }],
  currentArticle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost'
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'abandoned'],
    default: 'not_started'
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateId: {
    type: String,
    unique: true,
    sparse: true // Solo único si existe
  },
  certificateDate: Date,
  notes: {
    type: String,
    maxlength: 1000
  },
  bookmarked: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Índice compuesto para búsquedas rápidas
courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
courseProgressSchema.index({ status: 1, lastAccessedAt: -1 });

// Método para calcular el progreso automáticamente
courseProgressSchema.methods.calculateProgress = async function() {
  const LearningPath = mongoose.model('LearningPath');
  const course = await LearningPath.findById(this.courseId);
  
  if (!course || !course.articles || course.articles.length === 0) {
    return 0;
  }
  
  const completedCount = this.completedArticles.length;
  const totalArticles = course.articles.length;
  const progressPercent = Math.round((completedCount / totalArticles) * 100);
  
  this.progress = progressPercent;
  
  // Auto-completar curso si llega a 100%
  if (progressPercent === 100 && this.status !== 'completed') {
    this.status = 'completed';
  }
  
  return progressPercent;
};

// Método para marcar artículo como completado
courseProgressSchema.methods.markArticleCompleted = async function(articleId, timeSpent = 0) {
  // Verificar si ya está completado
  const alreadyCompleted = this.completedArticles.some(
    a => a.articleId.toString() === articleId.toString()
  );
  
  if (!alreadyCompleted) {
    this.completedArticles.push({
      articleId,
      completedAt: new Date(),
      timeSpent
    });
    
    this.lastAccessedAt = new Date();
    await this.calculateProgress();
    await this.save();
  }
  
  return this.progress;
};

// Hook pre-save para actualizar progreso automáticamente
courseProgressSchema.pre('save', async function(next) {
  if (this.isModified('completedArticles')) {
    await this.calculateProgress();
  }
  next();
});

export default mongoose.models.CourseProgress || mongoose.model('CourseProgress', courseProgressSchema);