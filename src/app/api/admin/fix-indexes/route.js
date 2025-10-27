import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const collection = db.collection('projects');
    
    await collection.dropIndexes();
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ isFeatured: 1 });
    await collection.createIndex({ orderIndex: 1 });
    await collection.createIndex({ isActive: 1 });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}