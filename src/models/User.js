// src/models/User.js - VERSIÓN COMPLETA ACTUALIZADA
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      default: '/images/default-avatar.png'
    },
    bio: {
      type: String,
      maxlength: 500
    },
    location: String,
    website: String,
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String
    }
  },
  
  // 🔥 NUEVO: Perfil de estudiante
  studentProfile: {
    totalXP: {
      type: Number,
      default: 0,
      min: 0
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    achievements: [{
      type: String,
      enum: [
        'first_lesson',           // Primera lección completada
        'first_course',           // Primer curso completado
        '50_percent',             // 50% de un curso
        'fast_learner',           // Completar curso en menos de 7 días
        'week_streak',            // 7 días seguidos estudiando
        'month_streak',           // 30 días seguidos
        'night_owl',              // Estudiar después de las 22:00
        'early_bird',             // Estudiar antes de las 7:00
        'completionist',          // 100% de un curso
        '5_courses',              // 5 cursos completados
        '10_courses',             // 10 cursos completados
        'premium_student',        // Usuario premium
        'reviewer',               // Dejar 5 reviews
        'social_learner'          // Compartir 3 cursos
      ]
    }],
    coursesEnrolled: {
      type: Number,
      default: 0
    },
    coursesCompleted: {
      type: Number,
      default: 0
    },
    totalStudyTime: {
      type: Number,
      default: 0 // En minutos
    },
    streak: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      }
    },
    lastStudyDate: Date,
    learningPreferences: {
      difficulty: {
        type: String,
        enum: ['principiante', 'intermedio', 'avanzado'],
        default: 'principiante'
      },
      topics: [String], // ['React', 'Next.js', 'TypeScript']
      studyGoal: {
        type: String,
        enum: ['hobby', 'career_change', 'skill_upgrade', 'freelance'],
        default: 'hobby'
      }
    }
  },
  
  // 🔥 NUEVO: Suscripción
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'lifetime'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'trial'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: false
    },
    paymentMethod: String,
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  
  // Campos existentes
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// 🔥 ÍNDICES para optimización
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });
userSchema.index({ 'studentProfile.level': -1 });

// Hash password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 🔥 NUEVO: Método para añadir XP y subir de nivel
userSchema.methods.addXP = async function(xp) {
  this.studentProfile.totalXP += xp;
  
  // Sistema de niveles: cada nivel requiere 100 XP más que el anterior
  const xpForNextLevel = this.studentProfile.level * 100;
  
  if (this.studentProfile.totalXP >= xpForNextLevel) {
    this.studentProfile.level += 1;
    console.log(`🎉 Usuario ${this.username} subió al nivel ${this.studentProfile.level}`);
  }
  
  await this.save();
  return this.studentProfile.level;
};

// 🔥 NUEVO: Método para desbloquear logro
userSchema.methods.unlockAchievement = async function(achievementId) {
  if (!this.studentProfile.achievements.includes(achievementId)) {
    this.studentProfile.achievements.push(achievementId);
    
    // Dar XP por logro desbloqueado
    const xpRewards = {
      'first_lesson': 10,
      'first_course': 50,
      '50_percent': 25,
      'fast_learner': 100,
      'week_streak': 75,
      'month_streak': 200,
      'night_owl': 15,
      'early_bird': 15,
      'completionist': 100,
      '5_courses': 250,
      '10_courses': 500,
      'premium_student': 50,
      'reviewer': 30,
      'social_learner': 20
    };
    
    const xpReward = xpRewards[achievementId] || 10;
    await this.addXP(xpReward);
    
    console.log(`🏆 Logro desbloqueado: ${achievementId} (+${xpReward} XP)`);
  }
  
  return this.studentProfile.achievements;
};

// 🔥 NUEVO: Actualizar racha de estudio
userSchema.methods.updateStreak = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastStudy = this.studentProfile.lastStudyDate 
    ? new Date(this.studentProfile.lastStudyDate)
    : null;
  
  if (lastStudy) {
    lastStudy.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Mismo día, no hacer nada
      return this.studentProfile.streak.current;
    } else if (diffDays === 1) {
      // Día consecutivo
      this.studentProfile.streak.current += 1;
      
      // Actualizar racha más larga
      if (this.studentProfile.streak.current > this.studentProfile.streak.longest) {
        this.studentProfile.streak.longest = this.studentProfile.streak.current;
      }
      
      // Desbloquear logros de racha
      if (this.studentProfile.streak.current === 7) {
        await this.unlockAchievement('week_streak');
      }
      if (this.studentProfile.streak.current === 30) {
        await this.unlockAchievement('month_streak');
      }
    } else {
      // Racha rota
      this.studentProfile.streak.current = 1;
    }
  } else {
    // Primera vez estudiando
    this.studentProfile.streak.current = 1;
  }
  
  this.studentProfile.lastStudyDate = new Date();
  await this.save();
  
  return this.studentProfile.streak.current;
};

// 🔥 NUEVO: Verificar si tiene acceso premium
userSchema.methods.hasPremiumAccess = function() {
  if (this.subscription.plan === 'lifetime') return true;
  if (this.subscription.plan === 'free') return false;
  
  if (this.subscription.plan === 'premium') {
    const now = new Date();
    const endDate = new Date(this.subscription.endDate);
    return this.subscription.status === 'active' && endDate > now;
  }
  
  return false;
};

// Virtual para nombre completo
userSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Asegurar que los virtuals se incluyan en JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.models.User || mongoose.model('User', userSchema);