// src/app/api/admin/students/export/route.js
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
    const type = searchParams.get('type') || 'students'; // students, certificates, progress

    if (type === 'students') {
      return await exportStudents();
    } else if (type === 'certificates') {
      return await exportCertificates();
    } else if (type === 'progress') {
      return await exportProgress();
    }

    return NextResponse.json(
      { success: false, error: 'Tipo de exportación no válido' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Error exportando datos:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function exportStudents() {
  const students = await User.find({ role: { $in: ['user', 'student'] } }).lean();
  const allProgress = await CourseProgress.find({}).lean();

  const csv = [
    ['ID', 'Username', 'Email', 'Nombre Completo', 'Fecha Registro', 'Nivel', 'XP Total', 'Racha Actual', 'Tiempo Estudio (h)', 'Cursos Inscritos', 'Cursos Completados', 'Certificados', 'Plan', 'Última Actividad'].join(',')
  ];

  students.forEach(student => {
    const studentProgress = allProgress.filter(p =>
      p.userId.toString() === student._id.toString()
    );

    const coursesEnrolled = studentProgress.length;
    const coursesCompleted = studentProgress.filter(p =>
      p.status === 'completed' || p.progress === 100
    ).length;
    const certificates = studentProgress.filter(p => p.certificateIssued).length;

    const fullName = student.profile?.firstName && student.profile?.lastName
      ? `${student.profile.firstName} ${student.profile.lastName}`
      : '';

    const lastActivity = student.studentProfile?.streak?.lastActivityDate
      ? new Date(student.studentProfile.streak.lastActivityDate).toISOString().split('T')[0]
      : '';

    csv.push([
      student._id.toString(),
      escapeCSV(student.username),
      escapeCSV(student.email),
      escapeCSV(fullName),
      new Date(student.createdAt).toISOString().split('T')[0],
      student.studentProfile?.level || 1,
      student.studentProfile?.totalXP || 0,
      student.studentProfile?.streak?.current || 0,
      Math.round((student.studentProfile?.totalStudyTime || 0) / 60),
      coursesEnrolled,
      coursesCompleted,
      certificates,
      student.subscription?.plan || 'free',
      lastActivity
    ].join(','));
  });

  const csvContent = csv.join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="estudiantes_${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}

async function exportCertificates() {
  const certificates = await CourseProgress.find({ certificateIssued: true })
    .populate('userId', 'username email profile')
    .populate('courseId', 'title')
    .sort({ certificateDate: -1 })
    .lean();

  const csv = [
    ['ID Certificado', 'Estudiante', 'Email', 'Curso', 'Fecha Emisión', 'Fecha Completación'].join(',')
  ];

  certificates.forEach(cert => {
    csv.push([
      escapeCSV(cert.certificateId || ''),
      escapeCSV(cert.userId?.username || ''),
      escapeCSV(cert.userId?.email || ''),
      escapeCSV(cert.courseId?.title || ''),
      cert.certificateDate ? new Date(cert.certificateDate).toISOString().split('T')[0] : '',
      cert.updatedAt ? new Date(cert.updatedAt).toISOString().split('T')[0] : ''
    ].join(','));
  });

  const csvContent = csv.join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="certificados_${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}

async function exportProgress() {
  const progress = await CourseProgress.find({})
    .populate('userId', 'username email')
    .populate('courseId', 'title')
    .sort({ enrolledAt: -1 })
    .lean();

  const csv = [
    ['Estudiante', 'Email', 'Curso', 'Estado', 'Progreso %', 'Lecciones Completadas', 'Fecha Inscripción', 'Última Actividad', 'Certificado'].join(',')
  ];

  progress.forEach(p => {
    csv.push([
      escapeCSV(p.userId?.username || ''),
      escapeCSV(p.userId?.email || ''),
      escapeCSV(p.courseId?.title || ''),
      p.status,
      p.progress,
      p.completedArticles.length,
      new Date(p.enrolledAt).toISOString().split('T')[0],
      new Date(p.lastAccessedAt).toISOString().split('T')[0],
      p.certificateIssued ? 'Sí' : 'No'
    ].join(','));
  });

  const csvContent = csv.join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="progreso_cursos_${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}

function escapeCSV(value) {
  if (!value) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}
