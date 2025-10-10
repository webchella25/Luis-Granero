// src/app/api/admin/appointments/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    await connectDB();

    let query: any = {};
    if (status !== 'all') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('leadId')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      appointments
    });

  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}