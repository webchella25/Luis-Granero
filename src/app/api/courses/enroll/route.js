// src/app/api/courses/enroll/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import CourseProgress from '@/models/CourseProgress';
import LearningPath from '@/models/LearningPath';
import User from '@/models/User';

// POST - Inscribir usuario a un curso
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

    const { courseId, courseSlug } = await request.json();

    // Obtener el curso
    let course;
    if (courseId) {
      course = await LearningPath.findById(courseId);
    } else if (courseSlug) {
      course = await LearningPath.findOne({ slug: courseSlug });
    }

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el curso es premium y el usuario tiene acceso
    if (course.isPremium) {
      const user = await User.findById(session.user.id);
      if (!user.hasPremiumAccess()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Este curso requiere suscripción premium',
            needsPremium: true
          },
          { status: 403 }
        );
      }
    }

    // Verificar si ya está inscrito
    const existingProgress = await CourseProgress.findOne({
      userId: session.user.id,
      courseId: course._id
    });

    if (existingProgress) {
      return NextResponse.json({
        success: true,
        message: 'Ya estás inscrito en este curso',
        progress: existingProgress,
        alreadyEnrolled: true
      });
    }

    // Crear nueva inscripción
    const courseProgress = await CourseProgress.create({
      userId: session.user.id,
      courseId: course._id,
      status: 'in_progress',
      enrolledAt: new Date()
    });

    // Actualizar contador de cursos del usuario
    const user = await User.findById(session.user.id);
    user.studentProfile.coursesEnrolled += 1;

    // Desbloquear logro si es el primer curso
    if (user.studentProfile.coursesEnrolled === 1) {
      await user.unlockAchievement('first_course');
    }

    await user.save();

    console.log(`✅ Usuario ${session.user.email} inscrito en curso: ${course.title}`);

    return NextResponse.json({
      success: true,
      message: 'Inscripción exitosa',
      progress: courseProgress,
      course: {
        _id: course._id,
        title: course.title,
        slug: course.slug,
        totalArticles: course.articles.length
      }
    });

  } catch (error) {
    console.error('❌ Error en inscripción:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET - Verificar si el usuario está inscrito en un curso
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { enrolled: false, needsAuth: true },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const courseSlug = searchParams.get('courseSlug');

    if (!courseId && !courseSlug) {
      return NextResponse.json(
        { success: false, error: 'courseId o courseSlug requerido' },
        { status: 400 }
      );
    }

    let query = { userId: session.user.id };

    if (courseId) {
      query.courseId = courseId;
    } else {
      const course = await LearningPath.findOne({ slug: courseSlug });
      if (!course) {
        return NextResponse.json({ enrolled: false });
      }
      query.courseId = course._id;
    }

    const progress = await CourseProgress.findOne(query)
      .populate('courseId', 'title slug articles');

    return NextResponse.json({
      enrolled: !!progress,
      progress: progress || null
    });

  } catch (error) {
    console.error('❌ Error verificando inscripción:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}