import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import BlogReview from '@/lib/models/BlogReview';
import BlogView from '@/lib/models/BlogView';

const updateBlogSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().min(1).max(500).optional(),
  featuredImage: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  author: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    avatar: z.string().url().optional()
  }).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().min(1).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  featured: z.boolean().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional()
});

// GET /api/blogs/[id] - Get single blog with reviews
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now();
  
  try {
    await connectDB();
    
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const includeReviews = searchParams.get('includeReviews') === 'true';
    
    // Find blog by ID or slug
    const blog = await Blog.findOne({
      $or: [
        { _id: id },
        { slug: id }
      ]
    }).lean();
    
    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Get client IP address
    const getClientIP = (req: NextRequest) => {
      const forwarded = req.headers.get('x-forwarded-for');
      const realIP = req.headers.get('x-real-ip');
      const clientIP = req.headers.get('x-client-ip');
      
      if (forwarded) {
        return forwarded.split(',')[0].trim();
      }
      if (realIP) {
        return realIP;
      }
      if (clientIP) {
        return clientIP;
      }
      
      return 'unknown';
    };
    
    const ipAddress = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Check if this IP has already viewed this blog
    const existingView = await BlogView.findOne({
      blog: blog._id,
      ipAddress: ipAddress
    });
    
    // Only increment view count if this is a new view from this IP
    if (!existingView && ipAddress !== 'unknown') {
      try {
        // Create new view record
        await BlogView.create({
          blog: blog._id,
          ipAddress: ipAddress,
          userAgent: userAgent
        });
        
        // Increment view count
        await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
        blog.views += 1;
      } catch (error) {
        // If there's a duplicate key error, the view was already recorded
        console.log('View already recorded for this IP:', error);
      }
    }
    
    let reviews = [];
    if (includeReviews) {
      reviews = await BlogReview.find({ 
        blog: blog._id, 
        status: 'approved' 
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    }
    
    const responseTime = performance.now() - startTime;
    
    return NextResponse.json({
      success: true,
      data: {
        blog,
        reviews: includeReviews ? reviews : undefined
      },
      meta: {
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch blog',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id] - Update blog
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now();
  
  try {
    await connectDB();
    
    const { id } = params;
    const body = await req.json();
    
    // Validate input
    const validatedData = updateBlogSchema.parse(body);
    
    // Check if blog exists
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Check for slug conflicts if title is being updated
    if (validatedData.title && validatedData.title !== existingBlog.title) {
      const newSlug = validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const slugConflict = await Blog.findOne({ 
        slug: newSlug,
        _id: { $ne: id }
      });
      
      if (slugConflict) {
        return NextResponse.json(
          { success: false, message: 'A blog with this title already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );
    
    const responseTime = performance.now() - startTime;
    
    return NextResponse.json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog,
      meta: {
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error updating blog:', error);
    
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
        message: 'Failed to update blog',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete blog
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now();
  
  try {
    await connectDB();
    
    const { id } = params;
    
    // Check if blog exists
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Delete blog and related reviews
    await Promise.all([
      Blog.findByIdAndDelete(id),
      BlogReview.deleteMany({ blog: id })
    ]);
    
    const responseTime = performance.now() - startTime;
    
    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully',
      meta: {
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete blog',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
