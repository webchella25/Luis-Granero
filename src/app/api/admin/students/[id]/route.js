// src/app/api/admin/students/[id]/route.js
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/checkAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import CourseProgress from '@/models/CourseProgress';

export async function GET(request, { params }) {
  try {
    const session = await checkAuth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Obtener estudiante
    const student = await User.findById(params.id).lean();

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Estudiante no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todos los cursos del estudiante
    const courseProgress = await CourseProgress.find({ userId: params.id })
      .populate({
        path: 'courseId',
        select: 'title slug description icon duration level isPremium articles'
      })
      .sort({ lastAccessedAt: -1 })
      .lean();

    // Separar cursos por estado
    const coursesInProgress = courseProgress.filter(p =>
      p.status === 'in_progress' && p.progress < 100
    ).map(p => ({
      _id: p._id,
      courseId: p.courseId?._id,
      title: p.courseId?.title,
      slug: p.courseId?.slug,
      icon: p.courseId?.icon,
      progress: p.progress,
      completedArticles: p.completedArticles.length,
      totalArticles: p.courseId?.articles?.length || 0,
      lastAccessedAt: p.lastAccessedAt,
      enrolledAt: p.enrolledAt,
      isPremium: p.courseId?.isPremium
    }));

    const coursesCompleted = courseProgress.filter(p =>
      p.status === 'completed' || p.progress === 100
    ).map(p => ({
      _id: p._id,
      courseId: p.courseId?._id,
      title: p.courseId?.title,
      slug: p.courseId?.slug,
      icon: p.courseId?.icon,
      completedAt: p.updatedAt,
      certificateIssued: p.certificateIssued,
      certificateId: p.certificateId,
      certificateDate: p.certificateDate,
      isPremium: p.courseId?.isPremium
    }));

    // Actividad reciente (últimas lecciones completadas)
    const recentActivity = [];
    for (const progress of courseProgress.slice(0, 5)) {
      if (progress.completedArticles.length > 0) {
        const lastCompleted = progress.completedArticles
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
          .slice(0, 3);

        for (const article of lastCompleted) {
          recentActivity.push({
            type: 'lesson_completed',
            courseTitle: progress.courseId?.title,
            courseSlug: progress.courseId?.slug,
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

    // Estadísticas
    const stats = {
      coursesEnrolled: courseProgress.length,
      coursesInProgress: coursesInProgress.length,
      coursesCompleted: coursesCompleted.length,
      certificatesEarned: courseProgress.filter(p => p.certificateIssued).length,
      totalXP: student.studentProfile?.totalXP || 0,
      level: student.studentProfile?.level || 1,
      streak: student.studentProfile?.streak?.current || 0,
      longestStreak: student.studentProfile?.streak?.longest || 0,
      totalStudyTime: student.studentProfile?.totalStudyTime || 0,
      totalStudyHours: Math.round((student.studentProfile?.totalStudyTime || 0) / 60),
      achievements: student.studentProfile?.achievements || [],
      subscriptionPlan: student.subscription?.plan || 'free',
      isPremium: student.subscription?.plan === 'premium' || student.subscription?.plan === 'pro'
    };

    // Progreso promedio
    const avgProgress = courseProgress.length > 0
      ? Math.round(
        courseProgress.reduce((sum, p) => sum + p.progress, 0) / courseProgress.length
      )
      : 0;

    // Timeline de actividad (últimos 30 días)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activityTimeline = [];

    // Agregar inscripciones
    courseProgress.forEach(p => {
      if (new Date(p.enrolledAt) > thirtyDaysAgo) {
        activityTimeline.push({
          type: 'enrollment',
          date: p.enrolledAt,
          courseTitle: p.courseId?.title
        });
      }
    });

    // Agregar completaciones
    courseProgress.forEach(p => {
      if (p.status === 'completed' && new Date(p.updatedAt) > thirtyDaysAgo) {
        activityTimeline.push({
          type: 'course_completed',
          date: p.updatedAt,
          courseTitle: p.courseId?.title
        });
      }
    });

    // Agregar certificados
    courseProgress.forEach(p => {
      if (p.certificateIssued && p.certificateDate && new Date(p.certificateDate) > thirtyDaysAgo) {
        activityTimeline.push({
          type: 'certificate_earned',
          date: p.certificateDate,
          courseTitle: p.courseId?.title,
          certificateId: p.certificateId
        });
      }
    });

    activityTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`✅ Detalle de estudiante cargado: ${student.email}`);

    return NextResponse.json({
      success: true,
      student: {
        _id: student._id,
        username: student.username,
        email: student.email,
        fullName: student.profile?.firstName && student.profile?.lastName
          ? `${student.profile.firstName} ${student.profile.lastName}`
          : student.username,
        avatar: student.profile?.avatar,
        bio: student.profile?.bio,
        location: student.profile?.location,
        website: student.profile?.website,
        createdAt: student.createdAt,
        lastLogin: student.lastLogin,
        lastActivity: student.studentProfile?.streak?.lastActivityDate,
        preferences: student.studentProfile?.learningPreferences
      },
      stats,
      coursesInProgress,
      coursesCompleted,
      recentActivity: recentActivity.slice(0, 10),
      activityTimeline: activityTimeline.slice(0, 20),
      avgProgress
    });

  } catch (error) {
    console.error('❌ Error cargando detalle de estudiante:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
