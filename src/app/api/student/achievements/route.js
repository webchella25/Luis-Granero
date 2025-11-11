// src/app/api/student/achievements/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Definición de todos los logros disponibles
const ACHIEVEMENTS_CATALOG = {
  first_lesson: {
    id: 'first_lesson',
    name: 'Primera Lección',
    description: 'Completaste tu primera lección',
    icon: '🎯',
    xp: 10,
    rarity: 'common'
  },
  first_course: {
    id: 'first_course',
    name: 'Primer Curso',
    description: 'Te inscribiste en tu primer curso',
    icon: '📚',
    xp: 50,
    rarity: 'common'
  },
  '50_percent': {
    id: '50_percent',
    name: 'A Mitad de Camino',
    description: 'Completaste el 50% de un curso',
    icon: '⚡',
    xp: 25,
    rarity: 'common'
  },
  fast_learner: {
    id: 'fast_learner',
    name: 'Aprendizaje Rápido',
    description: 'Completaste un curso en menos de 7 días',
    icon: '🚀',
    xp: 100,
    rarity: 'rare'
  },
  week_streak: {
    id: 'week_streak',
    name: 'Racha Semanal',
    description: '7 días seguidos estudiando',
    icon: '🔥',
    xp: 75,
    rarity: 'uncommon'
  },
  month_streak: {
    id: 'month_streak',
    name: 'Racha Mensual',
    description: '30 días seguidos estudiando',
    icon: '💪',
    xp: 200,
    rarity: 'epic'
  },
  night_owl: {
    id: 'night_owl',
    name: 'Búho Nocturno',
    description: 'Estudiaste después de las 22:00',
    icon: '🦉',
    xp: 15,
    rarity: 'common'
  },
  early_bird: {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Estudiaste antes de las 7:00',
    icon: '🐦',
    xp: 15,
    rarity: 'common'
  },
  completionist: {
    id: 'completionist',
    name: 'Completista',
    description: 'Completaste un curso al 100%',
    icon: '🏆',
    xp: 100,
    rarity: 'rare'
  },
  '5_courses': {
    id: '5_courses',
    name: 'Estudiante Dedicado',
    description: 'Completaste 5 cursos',
    icon: '⭐',
    xp: 250,
    rarity: 'epic'
  },
  '10_courses': {
    id: '10_courses',
    name: 'Maestro del Aprendizaje',
    description: 'Completaste 10 cursos',
    icon: '🎓',
    xp: 500,
    rarity: 'legendary'
  },
  premium_student: {
    id: 'premium_student',
    name: 'Estudiante Premium',
    description: 'Te uniste a Premium',
    icon: '💎',
    xp: 50,
    rarity: 'uncommon'
  },
  reviewer: {
    id: 'reviewer',
    name: 'Crítico Constructivo',
    description: 'Dejaste 5 reviews de cursos',
    icon: '📝',
    xp: 30,
    rarity: 'uncommon'
  },
  social_learner: {
    id: 'social_learner',
    name: 'Compartiendo Conocimiento',
    description: 'Compartiste 3 cursos',
    icon: '🤝',
    xp: 20,
    rarity: 'common'
  }
};

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const user = await User.findById(session.user.id).lean();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Logros desbloqueados
    const unlockedAchievements = user.studentProfile.achievements.map(achievementId => ({
      ...ACHIEVEMENTS_CATALOG[achievementId],
      unlocked: true
    }));
    
    // Logros bloqueados
    const lockedAchievements = Object.values(ACHIEVEMENTS_CATALOG)
      .filter(achievement => !user.studentProfile.achievements.includes(achievement.id))
      .map(achievement => ({
        ...achievement,
        unlocked: false
      }));
    
    // Ordenar por rareza
    const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
    
    unlockedAchievements.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
    lockedAchievements.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
    
    return NextResponse.json({
      success: true,
      achievements: {
        unlocked: unlockedAchievements,
        locked: lockedAchievements,
        total: Object.keys(ACHIEVEMENTS_CATALOG).length,
        unlockedCount: unlockedAchievements.length
      },
      stats: {
        totalXP: user.studentProfile.totalXP,
        level: user.studentProfile.level
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo logros:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}