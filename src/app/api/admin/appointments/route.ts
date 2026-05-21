// src/app/api/admin/appointments/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Lead from '@/models/Lead'; // 🔥 ESTO REGISTRA EL MODELO

export async function GET(request: Request) {
  try {

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

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    const appointment = new Appointment(data);
    await appointment.save();
    
    // Poblar leadId después de guardar
    await appointment.populate('leadId');

    return NextResponse.json({
      success: true,
      appointment
    });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    
    const data = await request.json();
    const { _id, ...updateData } = data;
    
    const appointment = await Appointment.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    ).populate('leadId');

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment
    });
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cita eliminada'
    });
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}