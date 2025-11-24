// src/app/api/admin/students/analytics/route.js
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/checkAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import CourseProgress from '@/models/CourseProgress';
import LearningPath from '@/models/LearningPath';

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

    // Obtener todos los estudiantes (usuarios con cursos o con studentProfile)
    const allUsers = await User.find({}).lean();
    const students = allUsers.filter(u =>
      u.studentProfile || u.role === 'user'
    );

    // Fechas para cálculos
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Métricas básicas
    const totalStudents = students.length;

    // Estudiantes activos (actividad en últimos 7 días)
    const activeStudents = students.filter(s =>
      s.studentProfile?.streak?.lastActivityDate &&
      new Date(s.studentProfile.streak.lastActivityDate) > sevenDaysAgo
    ).length;

    // Estudiantes nuevos este mes
    const newStudentsThisMonth = students.filter(s =>
      new Date(s.createdAt) >= thisMonthStart
    ).length;

    // Estudiantes nuevos mes pasado
    const newStudentsLastMonth = students.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= lastMonthStart && createdAt <= lastMonthEnd;
    }).length;

    // Calcular crecimiento mensual
    const growthRate = newStudentsLastMonth > 0
      ? ((newStudentsThisMonth - newStudentsLastMonth) / newStudentsLastMonth * 100).toFixed(1)
      : newStudentsThisMonth > 0 ? 100 : 0;

    // Obtener todos los progresos de cursos
    const allProgress = await CourseProgress.find({})
      .populate('courseId', 'title isPremium')
      .lean();

    // Total de inscripciones
    const totalEnrollments = allProgress.length;

    // Cursos completados
    const completedCourses = allProgress.filter(p =>
      p.status === 'completed' || p.progress === 100
    ).length;

    // Tasa de completación
    const completionRate = totalEnrollments > 0
      ? (completedCourses / totalEnrollments * 100).toFixed(1)
      : 0;

    // Certificados emitidos
    const totalCertificates = allProgress.filter(p => p.certificateIssued).length;
    const certificatesThisMonth = allProgress.filter(p =>
      p.certificateIssued &&
      p.certificateDate &&
      new Date(p.certificateDate) >= thisMonthStart
    ).length;

    // Tiempo total de estudio (en horas)
    const totalStudyTime = students.reduce((sum, s) =>
      sum + (s.studentProfile?.totalStudyTime || 0), 0
    );
    const totalStudyHours = Math.round(totalStudyTime / 60);

    // XP total
    const totalXP = students.reduce((sum, s) =>
      sum + (s.studentProfile?.totalXP || 0), 0
    );

    // Estudiantes premium
    const premiumStudents = students.filter(s =>
      s.subscription?.plan === 'premium' || s.subscription?.plan === 'pro'
    ).length;

    // Cursos más populares (top 5)
    const courseEnrollments = {};
    allProgress.forEach(p => {
      if (p.courseId) {
        const courseId = p.courseId._id.toString();
        if (!courseEnrollments[courseId]) {
          courseEnrollments[courseId] = {
            courseId: p.courseId._id,
            title: p.courseId.title,
            isPremium: p.courseId.isPremium,
            enrollments: 0,
            completions: 0,
            avgProgress: 0,
            totalProgress: 0
          };
        }
        courseEnrollments[courseId].enrollments++;
        courseEnrollments[courseId].totalProgress += p.progress;
        if (p.status === 'completed' || p.progress === 100) {
          courseEnrollments[courseId].completions++;
        }
      }
    });

    const topCourses = Object.values(courseEnrollments)
      .map(c => ({
        ...c,
        avgProgress: c.enrollments > 0 ? Math.round(c.totalProgress / c.enrollments) : 0,
        completionRate: c.enrollments > 0 ? Math.round(c.completions / c.enrollments * 100) : 0
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // Niveles de estudiantes (distribución)
    const levelDistribution = {};
    students.forEach(s => {
      const level = s.studentProfile?.level || 1;
      levelDistribution[level] = (levelDistribution[level] || 0) + 1;
    });

    // Crecimiento diario últimos 30 días
    const dailyGrowth = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const count = students.filter(s => {
        const created = new Date(s.createdAt);
        return created >= date && created < nextDate;
      }).length;

      dailyGrowth.push({
        date: date.toISOString().split('T')[0],
        students: count
      });
    }

    // Tasa de retención (estudiantes que vuelven después de 7 días)
    const studentsOlderThan7Days = students.filter(s =>
      new Date(s.createdAt) < sevenDaysAgo
    );
    const returnedStudents = studentsOlderThan7Days.filter(s =>
      s.studentProfile?.streak?.lastActivityDate &&
      new Date(s.studentProfile.streak.lastActivityDate) > sevenDaysAgo
    ).length;
    const retentionRate = studentsOlderThan7Days.length > 0
      ? (returnedStudents / studentsOlderThan7Days.length * 100).toFixed(1)
      : 0;

    // Estudiantes en riesgo (sin actividad en 14+ días pero con cursos activos)
    const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
    const atRiskStudents = students.filter(s => {
      const lastActivity = s.studentProfile?.streak?.lastActivityDate;
      const hasActiveCourses = allProgress.some(p =>
        p.userId.toString() === s._id.toString() &&
        p.status === 'in_progress'
      );
      return hasActiveCourses &&
             (!lastActivity || new Date(lastActivity) < fourteenDaysAgo);
    }).length;

    // Estudiantes top por XP (top 10)
    const topStudentsByXP = students
      .map(s => ({
        id: s._id,
        name: s.username,
        email: s.email,
        xp: s.studentProfile?.totalXP || 0,
        level: s.studentProfile?.level || 1,
        coursesCompleted: allProgress.filter(p =>
          p.userId.toString() === s._id.toString() &&
          (p.status === 'completed' || p.progress === 100)
        ).length
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);

    console.log(`✅ Analytics cargado: ${totalStudents} estudiantes, ${totalEnrollments} inscripciones`);

    return NextResponse.json({
      success: true,
      overview: {
        totalStudents,
        activeStudents,
        newStudentsThisMonth,
        growthRate: parseFloat(growthRate),
        totalEnrollments,
        completedCourses,
        completionRate: parseFloat(completionRate),
        totalCertificates,
        certificatesThisMonth,
        totalStudyHours,
        totalXP,
        premiumStudents,
        retentionRate: parseFloat(retentionRate),
        atRiskStudents
      },
      topCourses,
      levelDistribution,
      dailyGrowth,
      topStudentsByXP
    });

  } catch (error) {
    console.error('❌ Error cargando analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
