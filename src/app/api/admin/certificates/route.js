// src/app/api/admin/certificates/route.js
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/checkAuth';
import dbConnect from '@/lib/mongodb';
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
    const courseId = searchParams.get('courseId');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Query para certificados emitidos
    let query = { certificateIssued: true };

    if (courseId) {
      query.courseId = courseId;
    }

    const certificates = await CourseProgress.find(query)
      .populate('userId', 'username email profile')
      .populate('courseId', 'title slug icon')
      .sort({ certificateDate: -1 })
      .lean();

    // Filtrar por búsqueda si existe
    let filteredCertificates = certificates;
    if (search) {
      filteredCertificates = certificates.filter(cert => {
        const user = cert.userId;
        const course = cert.courseId;
        const searchLower = search.toLowerCase();

        return (
          user?.username?.toLowerCase().includes(searchLower) ||
          user?.email?.toLowerCase().includes(searchLower) ||
          course?.title?.toLowerCase().includes(searchLower) ||
          cert.certificateId?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Paginación
    const total = filteredCertificates.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedCertificates = filteredCertificates.slice(skip, skip + limit);

    // Formatear certificados
    const formattedCertificates = paginatedCertificates.map(cert => ({
      _id: cert._id,
      certificateId: cert.certificateId,
      certificateDate: cert.certificateDate,
      student: {
        _id: cert.userId?._id,
        username: cert.userId?.username,
        email: cert.userId?.email,
        fullName: cert.userId?.profile?.firstName && cert.userId?.profile?.lastName
          ? `${cert.userId.profile.firstName} ${cert.userId.profile.lastName}`
          : cert.userId?.username
      },
      course: {
        _id: cert.courseId?._id,
        title: cert.courseId?.title,
        slug: cert.courseId?.slug,
        icon: cert.courseId?.icon
      },
      progress: cert.progress,
      completedAt: cert.updatedAt
    }));

    // Estadísticas
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const certificatesThisMonth = certificates.filter(c =>
      new Date(c.certificateDate) >= thisMonth
    ).length;

    const certificatesLastMonth = certificates.filter(c => {
      const date = new Date(c.certificateDate);
      return date >= lastMonth && date < thisMonth;
    }).length;

    const growthRate = certificatesLastMonth > 0
      ? ((certificatesThisMonth - certificatesLastMonth) / certificatesLastMonth * 100).toFixed(1)
      : certificatesThisMonth > 0 ? 100 : 0;

    console.log(`✅ Certificados cargados: ${paginatedCertificates.length} de ${total}`);

    return NextResponse.json({
      success: true,
      certificates: formattedCertificates,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      },
      stats: {
        total: certificates.length,
        thisMonth: certificatesThisMonth,
        lastMonth: certificatesLastMonth,
        growthRate: parseFloat(growthRate)
      }
    });

  } catch (error) {
    console.error('❌ Error cargando certificados:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
