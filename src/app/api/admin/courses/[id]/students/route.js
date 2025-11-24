// src/app/api/admin/courses/[id]/students/route.js
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/checkAuth';
import dbConnect from '@/lib/mongodb';
import LearningPath from '@/models/LearningPath';
import CourseProgress from '@/models/CourseProgress';
import User from '@/models/User';

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all'; // all, in_progress, completed, not_started

    // Obtener el curso
    const course = await LearningPath.findById(params.id).lean();

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todos los progresos de este curso
    let query = { courseId: params.id };

    if (status !== 'all') {
      query.status = status;
    }

    const courseProgressList = await CourseProgress.find(query)
      .populate('userId', 'username email profile studentProfile lastLogin')
      .sort({ enrolledAt: -1 })
      .lean();

    // Enriquecer con datos del estudiante
    const students = courseProgressList.map(progress => {
      const user = progress.userId;
      if (!user) return null;

      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.profile?.firstName && user.profile?.lastName
          ? `${user.profile.firstName} ${user.profile.lastName}`
          : user.username,
        avatar: user.profile?.avatar,
        enrolledAt: progress.enrolledAt,
        lastAccessedAt: progress.lastAccessedAt,
        progress: progress.progress,
        status: progress.status,
        completedArticles: progress.completedArticles.length,
        totalArticles: course.articles?.length || 0,
        timeSpent: progress.completedArticles.reduce((sum, a) => sum + (a.timeSpent || 0), 0),
        certificateIssued: progress.certificateIssued,
        certificateId: progress.certificateId,
        certificateDate: progress.certificateDate,
        level: user.studentProfile?.level || 1,
        totalXP: user.studentProfile?.totalXP || 0,
        lastLogin: user.lastLogin,
        progressId: progress._id
      };
    }).filter(s => s !== null);

    // Calcular métricas del curso
    const totalEnrolled = students.length;
    const inProgress = students.filter(s => s.status === 'in_progress').length;
    const completed = students.filter(s => s.status === 'completed' || s.progress === 100).length;
    const notStarted = students.filter(s => s.status === 'not_started').length;
    const avgProgress = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)
      : 0;
    const avgTimeSpent = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.timeSpent, 0) / students.length)
      : 0;
    const completionRate = totalEnrolled > 0
      ? Math.round(completed / totalEnrolled * 100)
      : 0;

    // Análisis de abandono por lección
    const articleCompletions = {};
    course.articles?.forEach((article, index) => {
      articleCompletions[index] = {
        order: article.order,
        title: article.title,
        completions: 0,
        dropoffRate: 0
      };
    });

    courseProgressList.forEach(progress => {
      progress.completedArticles.forEach(completed => {
        const articleIndex = course.articles?.findIndex(a =>
          a.postId.toString() === completed.articleId.toString()
        );
        if (articleIndex !== -1) {
          articleCompletions[articleIndex].completions++;
        }
      });
    });

    // Calcular tasa de abandono
    Object.values(articleCompletions).forEach((article, index) => {
      if (index === 0) {
        article.dropoffRate = 0;
      } else {
        const prevCompletions = articleCompletions[index - 1].completions;
        article.dropoffRate = prevCompletions > 0
          ? Math.round((1 - article.completions / prevCompletions) * 100)
          : 0;
      }
    });

    // Estudiantes activos (actividad en últimos 7 días)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeStudents = students.filter(s =>
      new Date(s.lastAccessedAt) > sevenDaysAgo
    ).length;

    console.log(`✅ Estudiantes del curso ${course.title}: ${students.length}`);

    return NextResponse.json({
      success: true,
      course: {
        _id: course._id,
        title: course.title,
        slug: course.slug,
        icon: course.icon,
        description: course.description,
        totalArticles: course.articles?.length || 0
      },
      metrics: {
        totalEnrolled,
        inProgress,
        completed,
        notStarted,
        activeStudents,
        avgProgress,
        avgTimeSpent,
        completionRate
      },
      students,
      articleCompletions: Object.values(articleCompletions)
    });

  } catch (error) {
    console.error('❌ Error cargando estudiantes del curso:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
