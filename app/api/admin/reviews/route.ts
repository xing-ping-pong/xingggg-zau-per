import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductReview from '@/lib/models/ProductReview';
import Product from '@/lib/models/Product';

// GET /api/admin/reviews - Get all product reviews with filters
export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/admin/reviews - Starting request');
    await connectDB();
    console.log('GET /api/admin/reviews - Database connected');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    
    console.log('GET /api/admin/reviews - Params:', { page, limit, status, search });
    
    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute queries
    console.log('GET /api/admin/reviews - Executing queries');
    const [reviews, total] = await Promise.all([
      ProductReview.find(query)
        .populate('product', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductReview.countDocuments(query)
    ]);
    
    console.log('GET /api/admin/reviews - Query results:', { reviewsCount: reviews.length, total });
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch reviews',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
