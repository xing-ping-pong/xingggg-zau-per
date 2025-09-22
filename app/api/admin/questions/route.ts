import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductQuestion from '@/lib/models/ProductQuestion';
import Product from '@/lib/models/Product';

// GET /api/admin/questions - Get all questions with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const productId = searchParams.get('productId') || '';
    
    // Build query
    const query: any = {};
    
    if (status) query.status = status;
    if (productId) query.product = productId;
    
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute queries
    const [questions, total] = await Promise.all([
      ProductQuestion.find(query)
        .populate('product', 'name')
        .populate('answeredBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductQuestion.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: {
        questions,
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
    console.error('Error fetching admin questions:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch questions',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
