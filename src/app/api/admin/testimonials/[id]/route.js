import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
import { checkAuth } from '@/lib/checkAuth';

export async function PUT(request, { params }) {
  const auth = await checkAuth(request);
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const testimonial = await Testimonial.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!testimonial) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(testimonial);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await checkAuth(request);
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    await dbConnect();
    const { id } = await params;
    await Testimonial.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
