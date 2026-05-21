import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';

export async function GET() {
  try {
    await dbConnect();
    const testimonials = await Testimonial.find({ verificationStatus: 'verified', isActive: true })
      .sort({ isFeatured: -1, orderIndex: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      testimonials.map(t => ({ ...t, _id: t._id.toString() })),
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch {
    return NextResponse.json([]);
  }
}
