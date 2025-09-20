import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import BlogReview from '@/lib/models/BlogReview';

const createReviewSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email').max(255, 'Email too long'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(1, 'Comment is required').max(1000, 'Comment too long'),
  userId: z.string().optional() // Optional for logged-in users
});

// GET /api/blogs/[id]/reviews - Get blog reviews
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now();
  
  try {
    await connectDB();
    
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'approved';
    
    // Check if blog exists
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Build query
    const query: any = { blog: id };
    if (status) query.status = status;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute queries
    const [reviews, total] = await Promise.all([
      BlogReview.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogReview.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    // Calculate average rating
    const avgRating = await BlogReview.aggregate([
      { $match: { blog: blog._id, status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
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
        averageRating: avgRating[0]?.avgRating || 0
      },
      meta: {
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching blog reviews:', error);
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

// POST /api/blogs/[id]/reviews - Create blog review
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
    
    // Check if blog exists
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Check for existing review from same user (only for logged-in users)
    if (validatedData.userId && validatedData.userId !== 'guest') {
      const existingReview = await BlogReview.findOne({
        blog: id,
        user: validatedData.userId
      });
      
      if (existingReview) {
        return NextResponse.json(
          { success: false, message: 'You have already reviewed this blog' },
          { status: 400 }
        );
      }
    }
    
    // Create review
    const reviewData = {
      ...validatedData,
      blog: id,
      user: validatedData.userId && validatedData.userId !== 'guest' ? validatedData.userId : null
    };
    
    const review = new BlogReview(reviewData);
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
    console.error('Error creating blog review:', error);
    
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
