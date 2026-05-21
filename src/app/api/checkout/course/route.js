// src/app/api/checkout/course/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import LearningPath from '@/models/LearningPath';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { courseId, courseSlug, email } = await request.json();

    if (!courseId || !email) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    await dbConnect();
    const course = await LearningPath.findById(courseId).lean();
    if (!course || !course.isPremium) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'https://luisgranero.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_COURSE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        courseId: courseId.toString(),
        courseSlug: course.slug,
        courseTitle: course.title,
        customerEmail: email,
      },
      success_url: `${baseUrl}/cursos/${course.slug}?pago=ok`,
      cancel_url: `${baseUrl}/cursos/${course.slug}?pago=cancelado`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
