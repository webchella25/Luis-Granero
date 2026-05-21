// src/app/api/leads/list/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { clampPage, clampPaginationLimit, requireAdmin } from '@/lib/adminAuth';

const ALLOWED_SORT_FIELDS = new Set([
  'opportunityScore',
  'createdAt',
  'updatedAt',
  'lastContactedAt',
  'name',
  'status',
  'category'
]);

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = clampPage(searchParams.get('page'));
    const limit = clampPaginationLimit(searchParams.get('limit'), 50, 100);
    const search = searchParams.get('search') || '';
    const requestedSortBy = searchParams.get('sortBy') || 'opportunityScore';
    const sortBy = ALLOWED_SORT_FIELDS.has(requestedSortBy) ? requestedSortBy : 'opportunityScore';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    await connectDB();
    
    // Construir query
    let query: any = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sorting
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Obtener leads con paginación
    const skip = (page - 1) * limit;
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(query)
    ]);
    
    // Stats generales
    const [statusStats, opportunityStats] = await Promise.all([
      Lead.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Lead.aggregate([
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$opportunityScore' },
            highOpportunity: {
              $sum: { $cond: [{ $gte: ['$opportunityScore', 70] }, 1, 0] }
            },
            withWebsite: {
              $sum: { $cond: [{ $ne: ['$website', null] }, 1, 0] }
            },
            total: { $sum: 1 }
          }
        }
      ])
    ]);
    
    return NextResponse.json({
      success: true,
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        byStatus: statusStats.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        opportunities: opportunityStats[0] || {}
      }
    });
    
  } catch (error: any) {
    console.error('Error listing leads:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
