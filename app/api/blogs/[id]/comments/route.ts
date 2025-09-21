import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import Comment from '@/lib/models/Comment';
import User from '@/lib/models/User';

const createCommentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email').max(255, 'Email too long'),
  content: z.string().min(1, 'Comment is required').max(1000, 'Comment too long'),
  parent: z.string().optional(), // For replies
  userId: z.string().optional() // Optional for logged-in users
});

// GET /api/blogs/[id]/comments - Get blog comments
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
    const limit = parseInt(searchParams.get('limit') || '20');
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
    const query: any = { blog: id, parent: { $exists: false } }; // Only top-level comments
    if (status) query.status = status;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute queries
    const [comments, total] = await Promise.all([
      Comment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(query)
    ]);
    
    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parent: comment._id,
          status: 'approved'
        })
        .sort({ createdAt: 1 })
        .lean();
        
        return {
          ...comment,
          replies
        };
      })
    );
    
    const totalPages = Math.ceil(total / limit);
    
    const responseTime = performance.now() - startTime;
    
    return NextResponse.json({
      success: true,
      data: {
        comments: commentsWithReplies,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      meta: {
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching blog comments:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch comments',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/blogs/[id]/comments - Create blog comment
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
    const validatedData = createCommentSchema.parse(body);
    
    // Check if blog exists
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // If it's a reply, check if parent comment exists
    if (validatedData.parent) {
      const parentComment = await Comment.findById(validatedData.parent);
      if (!parentComment) {
        return NextResponse.json(
          { success: false, message: 'Parent comment not found' },
          { status: 400 }
        );
      }
    }
    
    // Create comment
    const commentData: any = {
      ...validatedData,
      blog: id,
      status: 'approved' // Auto-approve comments for now
    };
    
    // Only add user if it's a valid user ID
    if (validatedData.userId && validatedData.userId !== 'guest') {
      commentData.user = validatedData.userId;
    }
    
    // Remove userId from the data as it's not part of the schema
    delete commentData.userId;
    
    const comment = new Comment(commentData);
    await comment.save();
    
    // Populate user data
    await comment.populate({
      path: 'user',
      select: 'name email avatar'
    });
    
    const responseTime = performance.now() - startTime;
    
    return NextResponse.json({
      success: true,
      message: 'Comment submitted successfully',
      data: comment,
      meta: {
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating blog comment:', error);
    
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
        message: 'Failed to create comment',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
