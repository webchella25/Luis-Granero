// src/app/api/admin/addons/route.js
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/checkAuth'
import dbConnect from '@/lib/mongodb';
import Addon from '@/models/Addon';

export async function GET() {
  try {
    await dbConnect();
    
    const addons = await Addon.find({})
      .sort({ category: 1, orderIndex: 1, createdAt: 1 });
    
    return NextResponse.json({ addons });
  } catch (error) {
    console.error('Error fetching addons:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await checkAuth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { addons } = await request.json();
    
    // Actualizar o crear add-ons
    const results = [];
    for (const addon of addons) {
      const result = await Addon.findOneAndUpdate(
        { _id: addon._id || new mongoose.Types.ObjectId() },
        {
          ...addon,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
      results.push(result);
    }
    
    return NextResponse.json({ 
      message: 'Addons updated successfully', 
      addons: results 
    });
  } catch (error) {
    console.error('Error saving addons:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}