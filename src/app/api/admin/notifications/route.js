// src/app/api/admin/notifications/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

// GET — listar notificaciones no leídas
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') !== 'false';
    const limit = parseInt(searchParams.get('limit') || '50');

    const query = unreadOnly ? { isRead: false } : {};

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({ isRead: false });

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH — marcar como leídas
export async function PATCH(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { ids, markAll } = body;

    if (markAll) {
      await Notification.updateMany({ isRead: false }, { $set: { isRead: true, readAt: new Date() } });
    } else if (ids?.length) {
      await Notification.updateMany({ _id: { $in: ids } }, { $set: { isRead: true, readAt: new Date() } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
