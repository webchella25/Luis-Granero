// src/app/api/admin/students/route.js
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/checkAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import CourseProgress from '@/models/CourseProgress';

export async function GET(request) {
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
    const filter = searchParams.get('filter') || 'all'; // all, active, inactive, premium, at_risk
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt, xp, level, activity
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Obtener todos los usuarios estudiantes
    let query = { role: { $in: ['user', 'student'] } };

    // Búsqueda por nombre o email
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const allStudents = await User.find(query).lean();

    // Obtener todos los progresos para calcular métricas
    const allProgress = await CourseProgress.find({}).lean();

    // Fechas para filtros
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    // Enriquecer estudiantes con sus datos de progreso
    let enrichedStudents = allStudents.map(student => {
      const studentProgress = allProgress.filter(p =>
        p.userId.toString() === student._id.toString()
      );

      const coursesEnrolled = studentProgress.length;
      const coursesInProgress = studentProgress.filter(p =>
        p.status === 'in_progress' && p.progress < 100
      ).length;
      const coursesCompleted = studentProgress.filter(p =>
        p.status === 'completed' || p.progress === 100
      ).length;

      const lastActivity = student.studentProfile?.streak?.lastActivityDate
        ? new Date(student.studentProfile.streak.lastActivityDate)
        : new Date(student.createdAt);

      const isActive = lastActivity > sevenDaysAgo;
      const isPremium = student.subscription?.plan === 'premium' ||
                       student.subscription?.plan === 'pro';
      const isAtRisk = coursesInProgress > 0 && lastActivity < fourteenDaysAgo;

      return {
        _id: student._id,
        username: student.username,
        email: student.email,
        fullName: student.profile?.firstName && student.profile?.lastName
          ? `${student.profile.firstName} ${student.profile.lastName}`
          : student.username,
        avatar: student.profile?.avatar,
        createdAt: student.createdAt,
        lastActivity,
        isActive,
        isPremium,
        isAtRisk,
        level: student.studentProfile?.level || 1,
        totalXP: student.studentProfile?.totalXP || 0,
        streak: student.studentProfile?.streak?.current || 0,
        totalStudyTime: student.studentProfile?.totalStudyTime || 0,
        coursesEnrolled,
        coursesInProgress,
        coursesCompleted,
        certificatesEarned: studentProgress.filter(p => p.certificateIssued).length,
        subscriptionPlan: student.subscription?.plan || 'free'
      };
    });

    // Aplicar filtros
    if (filter !== 'all') {
      enrichedStudents = enrichedStudents.filter(s => {
        switch (filter) {
          case 'active':
            return s.isActive;
          case 'inactive':
            return !s.isActive;
          case 'premium':
            return s.isPremium;
          case 'at_risk':
            return s.isAtRisk;
          case 'completed':
            return s.coursesCompleted > 0;
          default:
            return true;
        }
      });
    }

    // Ordenar
    enrichedStudents.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'xp':
          aVal = a.totalXP;
          bVal = b.totalXP;
          break;
        case 'level':
          aVal = a.level;
          bVal = b.level;
          break;
        case 'activity':
          aVal = a.lastActivity.getTime();
          bVal = b.lastActivity.getTime();
          break;
        case 'courses':
          aVal = a.coursesEnrolled;
          bVal = b.coursesEnrolled;
          break;
        default: // createdAt
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }

      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Paginación
    const total = enrichedStudents.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedStudents = enrichedStudents.slice(skip, skip + limit);

    console.log(`✅ Listado de estudiantes: ${paginatedStudents.length} de ${total}`);

    return NextResponse.json({
      success: true,
      students: paginatedStudents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });

  } catch (error) {
    console.error('❌ Error listando estudiantes:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
