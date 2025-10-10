import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import ProductReview from '@/lib/models/ProductReview';
import { addPerformanceHeaders } from '@/lib/utils/performance';

const createReviewSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email').max(255, 'Email too long'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().max(200, 'Title too long').optional(),
  comment: z.string().min(1, 'Comment is required').max(2000, 'Comment too long'),
  userId: z.string().optional() // Optional for logged-in users
});

// GET /api/products/[id]/reviews - Get product reviews
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now();
  
  try {
    await connectDB();
    // Params may be a thenable in some Next.js runtimes; await if needed
    const resolvedParams = (params && typeof (params as any).then === 'function') ? await (params as any) : params;
    const { id } = resolvedParams;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'approved';
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest, helpful, rating
    
    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Build query
    const query: any = { product: id };
    if (status) query.status = status;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    let sort: any = { createdAt: -1 };
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'helpful':
        sort = { helpful: -1, createdAt: -1 };
        break;
      case 'rating':
        sort = { rating: -1, createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    // Execute queries
    const [reviews, total] = await Promise.all([
      ProductReview.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductReview.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    // Calculate rating statistics
    const ratingStats = await ProductReview.aggregate([
      { $match: { product: product._id, status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (ratingStats[0]?.ratingDistribution) {
      ratingStats[0].ratingDistribution.forEach((rating: number) => {
        distribution[rating as keyof typeof distribution]++;
      });
    }
    
    const responseTime = performance.now() - startTime;
    
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
        },
        ratingStats: {
          averageRating: ratingStats[0]?.averageRating || 0,
          totalReviews: ratingStats[0]?.totalReviews || 0,
          distribution
        }
      },
      meta: {
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching product reviews:', error);
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

// POST /api/products/[id]/reviews - Create product review
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now();
  
  try {
    await connectDB();
    
    const { id } = params;
    const body = await req.json();
    
    // Validate input
    const validatedData = createReviewSchema.parse(body);
    
    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check for existing review from same user (only for logged-in users)
    if (validatedData.userId && validatedData.userId !== 'guest') {
      const existingReview = await ProductReview.findOne({
        product: id,
        user: validatedData.userId
      });
      
      if (existingReview) {
        return NextResponse.json(
          { success: false, message: 'You have already reviewed this product' },
          { status: 400 }
        );
      }
    }
    
    // Create review
    const reviewData = {
      ...validatedData,
      product: id,
      user: validatedData.userId && validatedData.userId !== 'guest' ? validatedData.userId : null
    };
    
    const review = new ProductReview(reviewData);
    await review.save();
    
    const responseTime = performance.now() - startTime;
    
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
      meta: {
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product review:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error',
          errors: error.errors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create review',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
