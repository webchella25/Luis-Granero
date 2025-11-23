// src/app/api/student/dashboard/route.js
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/checkAuth'
import dbConnect from '@/lib/mongodb';
import CourseProgress from '@/models/CourseProgress';
import LearningPath from '@/models/LearningPath';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await checkAuth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Obtener usuario con todos sus datos
    const user = await User.findById(session.user.id).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todos los cursos del usuario
    const allCourses = await CourseProgress.find({ userId: session.user.id })
      .populate({
        path: 'courseId',
        select: 'title slug description icon duration level articles topics isPremium'
      })
      .sort({ lastAccessedAt: -1 })
      .lean();

    // Separar cursos por estado
    const coursesInProgress = allCourses.filter(c =>
      c.status === 'in_progress' && c.progress < 100
    );

    const coursesCompleted = allCourses.filter(c =>
      c.status === 'completed' || c.progress === 100
    );

    const coursesBookmarked = allCourses.filter(c => c.bookmarked);

    // Formatear cursos para el frontend
    const formatCourse = (courseProgress) => {
      const course = courseProgress.courseId;
      if (!course) return null;

      return {
        _id: courseProgress._id,
        courseId: course._id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        icon: course.icon,
        duration: course.duration,
        level: course.level,
        topics: course.topics,
        isPremium: course.isPremium,
        progress: courseProgress.progress,
        status: courseProgress.status,
        enrolledAt: courseProgress.enrolledAt,
        lastAccessedAt: courseProgress.lastAccessedAt,
        completedArticles: courseProgress.completedArticles.length,
        totalArticles: course.articles?.length || 0,
        bookmarked: courseProgress.bookmarked,
        certificateIssued: courseProgress.certificateIssued
      };
    };

    const formattedInProgress = coursesInProgress
      .map(formatCourse)
      .filter(c => c !== null);

    const formattedCompleted = coursesCompleted
      .map(formatCourse)
      .filter(c => c !== null);

    // Calcular estadísticas
    const stats = {
      coursesEnrolled: allCourses.length,
      coursesInProgress: coursesInProgress.length,
      coursesCompleted: coursesCompleted.length,
      totalXP: user.studentProfile.totalXP,
      level: user.studentProfile.level,
      streak: user.studentProfile.streak.current,
      longestStreak: user.studentProfile.streak.longest,
      totalStudyTime: user.studentProfile.totalStudyTime, // minutos
      totalStudyHours: Math.round(user.studentProfile.totalStudyTime / 60),
      achievements: user.studentProfile.achievements,
      achievementsCount: user.studentProfile.achievements.length,
      subscriptionPlan: user.subscription.plan,
      isPremium: user.hasPremiumAccess()
    };

    // Calcular progreso general (promedio de todos los cursos)
    const avgProgress = allCourses.length > 0
      ? Math.round(
        allCourses.reduce((sum, c) => sum + c.progress, 0) / allCourses.length
      )
      : 0;

    // Cursos recomendados (basados en topics del usuario)
    let recommendedCourses = [];

    if (user.studentProfile.learningPreferences?.topics?.length > 0) {
      recommendedCourses = await LearningPath.find({
        topics: { $in: user.studentProfile.learningPreferences.topics },
        isPublished: true,
        _id: { $nin: allCourses.map(c => c.courseId) } // Excluir ya inscritos
      })
        .limit(3)
        .select('title slug description icon duration level topics isPremium')
        .lean();
    }

    // Si no hay recomendaciones, obtener los más populares
    if (recommendedCourses.length === 0) {
      recommendedCourses = await LearningPath.find({
        isPublished: true,
        isFeatured: true,
        _id: { $nin: allCourses.map(c => c.courseId) }
      })
        .limit(3)
        .select('title slug description icon duration level topics isPremium')
        .lean();
    }

    // Actividad reciente (últimas 5 lecciones completadas)
    const recentActivity = [];

    for (const courseProgress of allCourses.slice(0, 5)) {
      if (courseProgress.completedArticles.length > 0) {
        const lastCompleted = courseProgress.completedArticles
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
          .slice(0, 2);

        for (const article of lastCompleted) {
          recentActivity.push({
            type: 'lesson_completed',
            courseTitle: courseProgress.courseId?.title,
            courseSlug: courseProgress.courseId?.slug,
            articleId: article.articleId,
            completedAt: article.completedAt,
            timeSpent: article.timeSpent
          });
        }
      }
    }

    recentActivity.sort((a, b) =>
      new Date(b.completedAt) - new Date(a.completedAt)
    );

    // Calcular XP para próximo nivel
    const xpForNextLevel = user.studentProfile.level * 100;
    const xpProgress = (user.studentProfile.totalXP % 100) / 100 * 100;

    console.log(`✅ Dashboard cargado para: ${user.email}`);

    return NextResponse.json({
      success: true,
      user: {
        name: user.username,
        email: user.email,
        avatar: user.profile?.avatar,
        fullName: user.profile?.firstName && user.profile?.lastName
          ? `${user.profile.firstName} ${user.profile.lastName}`
          : user.username
      },
      stats,
      courses: {
        inProgress: formattedInProgress,
        completed: formattedCompleted,
        bookmarked: coursesBookmarked.map(formatCourse).filter(c => c !== null),
        all: allCourses.map(formatCourse).filter(c => c !== null)
      },
      recommendedCourses,
      recentActivity: recentActivity.slice(0, 10),
      levelProgress: {
        currentLevel: user.studentProfile.level,
        totalXP: user.studentProfile.totalXP,
        xpForNextLevel,
        xpProgress: Math.round(xpProgress)
      },
      avgProgress
    });

  } catch (error) {
    console.error('❌ Error cargando dashboard:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}