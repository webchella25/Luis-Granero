// src/app/api/student/stats/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import CourseProgress from '@/models/CourseProgress';
import User from '@/models/User';

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
    const allProgress = await CourseProgress.find({ userId: session.user.id })
      .populate('courseId', 'title topics')
      .lean();

    // Calcular estadísticas de tiempo por día (últimos 7 días)
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      // Buscar lecciones completadas ese día
      const dayActivity = allProgress.reduce((total, progress) => {
        const completedInDay = progress.completedArticles.filter(article => {
          const completedDate = new Date(article.completedAt);
          return completedDate >= date && completedDate < nextDay;
        });

        return total + completedInDay.reduce((sum, article) =>
          sum + (article.timeSpent || 0), 0
        );
      }, 0);

      last7Days.push({
        date: date.toISOString().split('T')[0],
        minutes: dayActivity,
        day: date.toLocaleDateString('es-ES', { weekday: 'short' })
      });
    }

    // Topics más estudiados
    const topicsCount = {};

    allProgress.forEach(progress => {
      if (progress.courseId?.topics) {
        progress.courseId.topics.forEach(topic => {
          topicsCount[topic] = (topicsCount[topic] || 0) + 1;
        });
      }
    });

    const topTopics = Object.entries(topicsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    // Progreso mensual
    const monthlyProgress = {};

    allProgress.forEach(progress => {
      progress.completedArticles.forEach(article => {
        const month = new Date(article.completedAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short'
        });
        monthlyProgress[month] = (monthlyProgress[month] || 0) + 1;
      });
    });

    const monthlyData = Object.entries(monthlyProgress)
      .map(([month, lessonsCompleted]) => ({ month, lessonsCompleted }))
      .slice(-6); // Últimos 6 meses

    return NextResponse.json({
      success: true,
      stats: {
        totalXP: user.studentProfile.totalXP,
        level: user.studentProfile.level,
        streak: user.studentProfile.streak.current,
        longestStreak: user.studentProfile.streak.longest,
        totalStudyTime: user.studentProfile.totalStudyTime,
        coursesEnrolled: allProgress.length,
        coursesCompleted: allProgress.filter(p => p.status === 'completed').length,
        achievementsCount: user.studentProfile.achievements.length
      },
      charts: {
        last7Days,
        topTopics,
        monthlyProgress: monthlyData
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}