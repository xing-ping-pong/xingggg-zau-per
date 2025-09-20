import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

const likeSchema = z.object({
  userId: z.string().optional() // Make userId optional for guest users
});

// POST /api/blogs/[id]/like - Toggle blog like
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
    const { userId } = likeSchema.parse(body);
    
    // Check if blog exists
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // For guest users, just increment/decrement likes without tracking who liked
    if (!userId || userId === 'guest') {
      const isLiked = blog.likes > 0; // Simple check for guest users
      
      let updatedBlog;
      if (isLiked) {
        // Unlike the blog (decrement)
        updatedBlog = await Blog.findByIdAndUpdate(
          id,
          { $inc: { likes: -1 } },
          { new: true }
        );
      } else {
        // Like the blog (increment)
        updatedBlog = await Blog.findByIdAndUpdate(
          id,
          { $inc: { likes: 1 } },
          { new: true }
        );
      }
      
      const responseTime = performance.now() - startTime;
      
      return NextResponse.json({
        success: true,
        message: isLiked ? 'Blog unliked successfully' : 'Blog liked successfully',
        data: {
          liked: !isLiked,
          likes: updatedBlog.likes
        },
        meta: {
          responseTime: `${responseTime.toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // For logged-in users, track who liked
    const isLiked = blog.likesBy.includes(userId);
    
    let updatedBlog;
    if (isLiked) {
      // Unlike the blog
      updatedBlog = await Blog.findByIdAndUpdate(
        id,
        {
          $pull: { likesBy: userId },
          $inc: { likes: -1 }
        },
        { new: true }
      );
    } else {
      // Like the blog
      updatedBlog = await Blog.findByIdAndUpdate(
        id,
        {
          $addToSet: { likesBy: userId },
          $inc: { likes: 1 }
        },
        { new: true }
      );
    }
    
    const responseTime = performance.now() - startTime;
    
    return NextResponse.json({
      success: true,
      message: isLiked ? 'Blog unliked successfully' : 'Blog liked successfully',
      data: {
        liked: !isLiked,
        likes: updatedBlog.likes
      },
      meta: {
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error toggling blog like:', error);
    
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
        message: 'Failed to toggle like',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/blogs/[id]/like - Check if user liked the blog
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now();
  
  try {
    await connectDB();
    
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if blog exists
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }
    
    const isLiked = blog.likesBy.includes(userId);
    
    const responseTime = performance.now() - startTime;
    
    return NextResponse.json({
      success: true,
      data: {
        liked: isLiked,
        likes: blog.likes
      },
      meta: {
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error checking blog like status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to check like status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
