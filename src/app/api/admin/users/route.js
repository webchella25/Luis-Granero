// src/app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/adminAuth';
export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();

    const users = await User.find({})
      .select('username email role isActive createdAt updatedAt profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
