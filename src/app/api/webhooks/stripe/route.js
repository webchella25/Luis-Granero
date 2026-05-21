// src/app/api/webhooks/stripe/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Purchase from '@/models/Purchase';
import LearningPath from '@/models/LearningPath';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      await dbConnect();

      const { courseId, courseSlug, courseTitle, customerEmail } = session.metadata;

      // Verificar que no existe ya esta compra
      const existing = await Purchase.findOne({ stripeSessionId: session.id });
      if (existing) {
        return NextResponse.json({ received: true });
      }

      await Purchase.create({
        email: customerEmail || session.customer_email,
        courseId,
        courseSlug,
        courseTitle,
        amount: session.amount_total,
        currency: session.currency,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        status: 'completed',
        paidAt: new Date(),
      });

      // Incrementar contador de enrollments en el curso
      await LearningPath.findByIdAndUpdate(courseId, { $inc: { enrollments: 1 } });

      console.log(`✅ Compra registrada: ${customerEmail || session.customer_email} → ${courseTitle}`);
    } catch (err) {
      console.error('Error registrando compra:', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
