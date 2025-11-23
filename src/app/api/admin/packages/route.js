// src/app/api/admin/packages/route.js
import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/checkAuth'
import dbConnect from '@/lib/mongodb';
import Package from '@/models/Package';

export async function GET() {
  try {
    await dbConnect();
    
    const packages = await Package.find({})
      .sort({ orderIndex: 1, createdAt: 1 });
    
    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
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
    
    const { packages } = await request.json();
    
    // Si se actualiza popular=true, quitar popular de otros
    for (const pkg of packages) {
      if (pkg.popular) {
        await Package.updateMany(
          { _id: { $ne: pkg._id } },
          { $set: { popular: false } }
        );
      }
    }
    
    // Actualizar o crear paquetes
    const results = [];
    for (const pkg of packages) {
      const result = await Package.findOneAndUpdate(
        { _id: pkg._id || new mongoose.Types.ObjectId() },
        {
          ...pkg,
          slug: pkg.slug || pkg.name.toLowerCase().replace(/\s+/g, '-'),
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
      results.push(result);
    }
    
    return NextResponse.json({ 
      message: 'Packages updated successfully', 
      packages: results 
    });
  } catch (error) {
    console.error('Error saving packages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}