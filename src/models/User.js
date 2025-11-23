// src/models/User.js - JAVASCRIPT PURO
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: {
      type: String,
      default: '/images/default-avatar.png'
    },
    bio: String,
    location: String,
    website: String,
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String
    }
  },
  studentProfile: {
    totalXP: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    achievements: [String],
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
      default: 0
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
      topics: [String],
      studyGoal: {
        type: String,
        enum: ['hobby', 'career_change', 'skill_upgrade', 'freelance'],
        default: 'hobby'
      }
    }
  },
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
})

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    if (this.password) {
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(this.password, salt)
    }
    next()
  } catch (error) {
    next(error)
  }
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false
  return await bcrypt.compare(candidatePassword, this.password)
}

userSchema.virtual('fullName').get(function() {
  if (this.profile?.firstName && this.profile?.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`
  }
  return this.username
})

userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

export default mongoose.models.User || mongoose.model('User', userSchema)