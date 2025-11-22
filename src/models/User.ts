import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interfaces
export interface IStudentProfile {
    totalXP: number;
    level: number;
    achievements: string[];
    coursesEnrolled: number;
    coursesCompleted: number;
    totalStudyTime: number;
    streak: {
        current: number;
        longest: number;
    };
    lastStudyDate?: Date;
    learningPreferences: {
        difficulty: 'principiante' | 'intermedio' | 'avanzado';
        topics: string[];
        studyGoal: 'hobby' | 'career_change' | 'skill_upgrade' | 'freelance';
    };
}

export interface ISubscription {
    plan: 'free' | 'premium' | 'lifetime';
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    startDate?: Date;
    endDate?: Date;
    autoRenew: boolean;
    paymentMethod?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
}

export interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    role: 'user' | 'admin';
    profile: {
        firstName?: string;
        lastName?: string;
        avatar: string;
        bio?: string;
        location?: string;
        website?: string;
        socialLinks?: {
            twitter?: string;
            linkedin?: string;
            github?: string;
        };
    };
    studentProfile: IStudentProfile;
    subscription: ISubscription;
    isActive: boolean;
    emailVerified: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    lastLogin?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    createdAt: Date;
    updatedAt: Date;

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;
    addXP(xp: number): Promise<number>;
    unlockAchievement(achievementId: string): Promise<string[]>;
    updateStreak(): Promise<number>;
    hasPremiumAccess(): boolean;

    // Virtuals
    fullName: string;
}

const userSchema = new Schema<IUser>({
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

    // Student Profile
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

    // Subscription
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

    // Existing fields
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

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });
userSchema.index({ 'studentProfile.level': -1 });

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        if (this.password) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (error: any) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to add XP and level up
userSchema.methods.addXP = async function (xp: number): Promise<number> {
    this.studentProfile.totalXP += xp;

    // Level system: each level requires 100 XP more than the previous one (simplified logic from original)
    // Original logic: const xpForNextLevel = this.studentProfile.level * 100;
    // Wait, the original logic was: if (totalXP >= level * 100) -> level up.
    // This implies linear progression per level or cumulative? 
    // "const xpForNextLevel = this.studentProfile.level * 100;"
    // If level 1, need 100 XP. If level 2, need 200 XP (total or additional?).
    // Usually it's total. Let's keep the logic exactly as it was.

    const xpForNextLevel = this.studentProfile.level * 100;

    if (this.studentProfile.totalXP >= xpForNextLevel) {
        this.studentProfile.level += 1;
        console.log(`🎉 Usuario ${this.username} subió al nivel ${this.studentProfile.level}`);
    }

    await this.save();
    return this.studentProfile.level;
};

// Method to unlock achievement
userSchema.methods.unlockAchievement = async function (achievementId: string): Promise<string[]> {
    if (!this.studentProfile.achievements.includes(achievementId)) {
        this.studentProfile.achievements.push(achievementId);

        // XP Rewards
        const xpRewards: Record<string, number> = {
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

// Update streak
userSchema.methods.updateStreak = async function (): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStudy = this.studentProfile.lastStudyDate
        ? new Date(this.studentProfile.lastStudyDate)
        : null;

    if (lastStudy) {
        lastStudy.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today.getTime() - lastStudy.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Same day, do nothing
            return this.studentProfile.streak.current;
        } else if (diffDays === 1) {
            // Consecutive day
            this.studentProfile.streak.current += 1;

            // Update longest streak
            if (this.studentProfile.streak.current > this.studentProfile.streak.longest) {
                this.studentProfile.streak.longest = this.studentProfile.streak.current;
            }

            // Unlock streak achievements
            if (this.studentProfile.streak.current === 7) {
                await this.unlockAchievement('week_streak');
            }
            if (this.studentProfile.streak.current === 30) {
                await this.unlockAchievement('month_streak');
            }
        } else {
            // Streak broken
            this.studentProfile.streak.current = 1;
        }
    } else {
        // First time studying
        this.studentProfile.streak.current = 1;
    }

    this.studentProfile.lastStudyDate = new Date();
    await this.save();

    return this.studentProfile.streak.current;
};

// Check premium access
userSchema.methods.hasPremiumAccess = function (): boolean {
    if (this.subscription.plan === 'lifetime') return true;
    if (this.subscription.plan === 'free') return false;

    if (this.subscription.plan === 'premium') {
        const now = new Date();
        const endDate = this.subscription.endDate ? new Date(this.subscription.endDate) : null;
        return this.subscription.status === 'active' && (endDate ? endDate > now : false);
    }

    return false;
};

// Virtual for full name
userSchema.virtual('fullName').get(function (this: IUser) {
    if (this.profile.firstName && this.profile.lastName) {
        return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.username;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);

export default User;
