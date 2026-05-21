import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
import { checkAuth } from '@/lib/checkAuth';

export async function GET(request) {
  const auth = await checkAuth(request);
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    await dbConnect();
    const testimonials = await Testimonial.find({})
      .sort({ verificationStatus: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(testimonials.map(t => ({ ...t, _id: t._id.toString() })));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await checkAuth(request);
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    await dbConnect();
    const body = await request.json();
    const testimonial = await Testimonial.create(body);
    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
