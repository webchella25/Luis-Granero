// src/app/api/checkout/verify/route.js
// Verifica si un email ya ha comprado un curso
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Purchase from '@/models/Purchase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const courseId = searchParams.get('courseId');

  if (!email || !courseId) {
    return NextResponse.json({ hasPurchased: false });
  }

  try {
    await dbConnect();
    const purchase = await Purchase.findOne({
      email: email.toLowerCase(),
      courseId,
      status: 'completed',
    }).lean();

    return NextResponse.json({ hasPurchased: !!purchase });
  } catch {
    return NextResponse.json({ hasPurchased: false });
  }
}
