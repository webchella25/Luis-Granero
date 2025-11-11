// src/app/api/courses/progress/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import CourseProgress from '@/models/CourseProgress';
import LearningPath from '@/models/LearningPath';
import User from '@/models/User';

// POST - Marcar artículo como completado
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { courseId, courseSlug, articleId, timeSpent = 0 } = await request.json();
    
    // Buscar el progreso del curso
    let progress;
    
    if (courseId) {
      progress = await CourseProgress.findOne({
        userId: session.user.id,
        courseId
      });
    } else if (courseSlug) {
      const course = await LearningPath.findOne({ slug: courseSlug });
      if (!course) {
        return NextResponse.json(
          { success: false, error: 'Curso no encontrado' },
          { status: 404 }
        );
      }
      
      progress = await CourseProgress.findOne({
        userId: session.user.id,
        courseId: course._id
      });
    }
    
    if (!progress) {
      return NextResponse.json(
        { success: false, error: 'No estás inscrito en este curso' },
        { status: 404 }
      );
    }
    
    // Marcar artículo como completado usando el método del modelo
    const newProgress = await progress.markArticleCompleted(articleId, timeSpent);
    
    // Actualizar usuario
    const user = await User.findById(session.user.id);
    user.studentProfile.totalStudyTime += timeSpent;
    await user.updateStreak();
    
    // Dar XP por completar lección
    await user.addXP(10);
    
    // Desbloquear logro primera lección
    if (progress.completedArticles.length === 1) {
      await user.unlockAchievement('first_lesson');
    }
    
    // Verificar si completó 50% del curso
    if (newProgress >= 50 && newProgress < 60) {
      await user.unlockAchievement('50_percent');
    }
    
    // Verificar si completó el curso (100%)
    if (newProgress === 100) {
      user.studentProfile.coursesCompleted += 1;
      await user.unlockAchievement('completionist');
      
      // Dar XP bonus por completar curso
      await user.addXP(100);
      
      // Verificar logros de múltiples cursos
      if (user.studentProfile.coursesCompleted === 5) {
        await user.unlockAchievement('5_courses');
      }
      if (user.studentProfile.coursesCompleted === 10) {
        await user.unlockAchievement('10_courses');
      }
      
      // Verificar si completó rápido (menos de 7 días)
      const enrolledDate = new Date(progress.enrolledAt);
      const now = new Date();
      const daysDiff = Math.floor((now - enrolledDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7) {
        await user.unlockAchievement('fast_learner');
      }
    }
    
    // Verificar hora de estudio para logros
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      await user.unlockAchievement('night_owl');
    } else if (hour >= 5 && hour < 7) {
      await user.unlockAchievement('early_bird');
    }
    
    console.log(`✅ Progreso actualizado: ${newProgress}% - Usuario: ${session.user.email}`);
    
    return NextResponse.json({
      success: true,
      progress: newProgress,
      completedArticles: progress.completedArticles.length,
      totalArticles: (await LearningPath.findById(progress.courseId)).articles.length,
      status: progress.status,
      xpEarned: 10,
      newLevel: user.studentProfile.level,
      achievements: user.studentProfile.achievements,
      streak: user.studentProfile.streak.current
    });
    
  } catch (error) {
    console.error('❌ Error actualizando progreso:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET - Obtener progreso de un curso
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
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const courseSlug = searchParams.get('courseSlug');
    
    let query = { userId: session.user.id };
    
    if (courseId) {
      query.courseId = courseId;
    } else if (courseSlug) {
      const course = await LearningPath.findOne({ slug: courseSlug });
      if (!course) {
        return NextResponse.json(
          { success: false, error: 'Curso no encontrado' },
          { status: 404 }
        );
      }
      query.courseId = course._id;
    } else {
      return NextResponse.json(
        { success: false, error: 'courseId o courseSlug requerido' },
        { status: 400 }
      );
    }
    
    const progress = await CourseProgress.findOne(query)
      .populate('courseId', 'title slug articles duration')
      .populate('completedArticles.articleId', 'title slug');
    
    if (!progress) {
      return NextResponse.json({
        success: true,
        enrolled: false,
        progress: null
      });
    }
    
    return NextResponse.json({
      success: true,
      enrolled: true,
      progress: {
        _id: progress._id,
        progress: progress.progress,
        status: progress.status,
        enrolledAt: progress.enrolledAt,
        lastAccessedAt: progress.lastAccessedAt,
        completedArticles: progress.completedArticles,
        currentArticle: progress.currentArticle,
        bookmarked: progress.bookmarked,
        certificateIssued: progress.certificateIssued
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo progreso:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}