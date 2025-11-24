// src/app/api/student/courses/[slug]/progress/route.js
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/checkAuth';
import dbConnect from '@/lib/mongodb';
import CourseProgress from '@/models/CourseProgress';
import LearningPath from '@/models/LearningPath';
import BlogPost from '@/models/BlogPost';

export async function GET(request, { params }) {
  try {
    const session = await checkAuth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Buscar el curso por slug
    const course = await LearningPath.findOne({ slug: params.slug, isPublished: true })
      .lean();

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Buscar o crear progreso del curso para este usuario
    let courseProgress = await CourseProgress.findOne({
      userId: session.user.id,
      courseId: course._id
    }).lean();

    // Si no existe progreso, crear uno nuevo
    if (!courseProgress) {
      const newProgress = await CourseProgress.create({
        userId: session.user.id,
        courseId: course._id,
        status: 'not_started',
        progress: 0,
        completedArticles: []
      });
      courseProgress = newProgress.toObject();
    }

    // Obtener todos los artículos del curso con sus detalles
    const articlesWithDetails = await Promise.all(
      course.articles.map(async (article) => {
        const blogPost = await BlogPost.findById(article.postId)
          .select('title slug readTime')
          .lean();

        if (!blogPost) return null;

        // Verificar si el artículo está completado
        const completedArticle = courseProgress.completedArticles.find(
          ca => ca.articleId.toString() === article.postId.toString()
        );

        return {
          _id: blogPost._id,
          title: article.title || blogPost.title,
          slug: blogPost.slug,
          order: article.order,
          duration: blogPost.readTime ? `${blogPost.readTime} min` : null,
          isRequired: article.isRequired,
          isCompleted: !!completedArticle,
          completedAt: completedArticle?.completedAt,
          timeSpent: completedArticle?.timeSpent || 0
        };
      })
    );

    // Filtrar artículos nulos y ordenar por order
    const articles = articlesWithDetails
      .filter(a => a !== null)
      .sort((a, b) => a.order - b.order);

    // Calcular tiempo total gastado
    const totalTimeSpent = courseProgress.completedArticles.reduce(
      (sum, article) => sum + (article.timeSpent || 0),
      0
    );

    console.log(`✅ Progreso del curso ${params.slug} cargado para usuario ${session.user.id}`);

    return NextResponse.json({
      success: true,
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        slug: course.slug,
        icon: course.icon,
        totalArticles: course.articles.length
      },
      progress: {
        _id: courseProgress._id,
        progress: courseProgress.progress,
        completedArticles: courseProgress.completedArticles.length,
        totalArticles: course.articles.length,
        status: courseProgress.status,
        startedAt: courseProgress.enrolledAt,
        lastAccessedAt: courseProgress.lastAccessedAt,
        timeSpent: totalTimeSpent,
        certificateIssued: courseProgress.certificateIssued,
        certificateIssuedAt: courseProgress.certificateDate,
        certificateId: courseProgress.certificateId
      },
      articles
    });

  } catch (error) {
    console.error('❌ Error cargando progreso del curso:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
