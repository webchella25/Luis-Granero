// src/app/api/student/courses/[slug]/articles/[articleSlug]/complete/route.js
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/checkAuth';
import dbConnect from '@/lib/mongodb';
import CourseProgress from '@/models/CourseProgress';
import LearningPath from '@/models/LearningPath';
import BlogPost from '@/models/BlogPost';
import User from '@/models/User';

export async function POST(request, { params }) {
  try {
    const session = await checkAuth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { completed, timeSpent = 5 } = body; // Default 5 minutos si no se especifica

    // Buscar el curso
    const course = await LearningPath.findOne({ slug: params.slug, isPublished: true });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Buscar el artículo
    const article = await BlogPost.findOne({ slug: params.articleSlug });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Artículo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el artículo pertenece al curso
    const isArticleInCourse = course.articles.some(
      a => a.postId.toString() === article._id.toString()
    );

    if (!isArticleInCourse) {
      return NextResponse.json(
        { success: false, error: 'Este artículo no pertenece al curso' },
        { status: 400 }
      );
    }

    // Buscar o crear progreso del curso
    let courseProgress = await CourseProgress.findOne({
      userId: session.user.id,
      courseId: course._id
    });

    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        userId: session.user.id,
        courseId: course._id,
        status: 'in_progress',
        progress: 0,
        completedArticles: []
      });
    }

    // Verificar si el artículo ya está completado
    const articleIndex = courseProgress.completedArticles.findIndex(
      ca => ca.articleId.toString() === article._id.toString()
    );

    if (completed) {
      // MARCAR COMO COMPLETADO
      if (articleIndex === -1) {
        // Agregar a completados
        courseProgress.completedArticles.push({
          articleId: article._id,
          completedAt: new Date(),
          timeSpent: timeSpent
        });

        // Actualizar estado si es el primer artículo
        if (courseProgress.status === 'not_started') {
          courseProgress.status = 'in_progress';
        }
      } else {
        // Ya está completado, actualizar timeSpent si se proporciona
        courseProgress.completedArticles[articleIndex].timeSpent += timeSpent;
      }
    } else {
      // DESMARCAR COMO COMPLETADO
      if (articleIndex !== -1) {
        courseProgress.completedArticles.splice(articleIndex, 1);
      }
    }

    // Actualizar último acceso
    courseProgress.lastAccessedAt = new Date();
    courseProgress.currentArticle = article._id;

    // Calcular progreso
    await courseProgress.calculateProgress();

    // Emitir certificado si llegó a 100%
    if (courseProgress.progress === 100 && !courseProgress.certificateIssued) {
      const certificateId = `CERT-${Date.now()}-${session.user.id.toString().slice(-6).toUpperCase()}`;
      courseProgress.certificateIssued = true;
      courseProgress.certificateId = certificateId;
      courseProgress.certificateDate = new Date();

      // Incrementar completions del curso
      await LearningPath.findByIdAndUpdate(course._id, {
        $inc: { completions: 1 }
      });
    }

    await courseProgress.save();

    // Actualizar XP y estadísticas del estudiante
    const user = await User.findById(session.user.id);

    if (completed && articleIndex === -1) {
      // Solo dar XP si es la primera vez que completa el artículo
      const xpGained = 10; // 10 XP por artículo completado
      user.studentProfile.totalXP += xpGained;

      // Calcular nuevo nivel (cada 100 XP = 1 nivel)
      user.studentProfile.level = Math.floor(user.studentProfile.totalXP / 100) + 1;

      // Actualizar tiempo de estudio
      user.studentProfile.totalStudyTime += timeSpent;

      // Actualizar racha (streak)
      const today = new Date().setHours(0, 0, 0, 0);
      const lastActivity = user.studentProfile.streak.lastActivityDate
        ? new Date(user.studentProfile.streak.lastActivityDate).setHours(0, 0, 0, 0)
        : null;

      if (!lastActivity || lastActivity < today) {
        // Es un nuevo día de actividad
        const oneDayAgo = today - (24 * 60 * 60 * 1000);

        if (lastActivity === oneDayAgo) {
          // Continúa la racha
          user.studentProfile.streak.current += 1;

          if (user.studentProfile.streak.current > user.studentProfile.streak.longest) {
            user.studentProfile.streak.longest = user.studentProfile.streak.current;
          }
        } else {
          // Reinicia la racha
          user.studentProfile.streak.current = 1;
        }

        user.studentProfile.streak.lastActivityDate = new Date();
      }

      await user.save();
    }

    console.log(`✅ Artículo ${article.slug} marcado como ${completed ? 'completado' : 'incompleto'} para usuario ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: completed ? 'Artículo marcado como completado' : 'Artículo marcado como incompleto',
      progress: {
        progress: courseProgress.progress,
        completedArticles: courseProgress.completedArticles.length,
        totalArticles: course.articles.length,
        certificateIssued: courseProgress.certificateIssued
      }
    });

  } catch (error) {
    console.error('❌ Error actualizando progreso del artículo:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
