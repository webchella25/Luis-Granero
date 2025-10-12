// src/app/api/appointments/stats/route.js - NUEVO
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const [
      total,
      pending,
      confirmed,
      completed,
      recentAppointments
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt scheduledDate')
        .lean()
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        total,
        pending,
        confirmed,
        completed
      },
      recentAppointments
    });

  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}