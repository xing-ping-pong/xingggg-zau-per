import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

// Validation schemas
const createBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required').max(500, 'Excerpt too long'),
  featuredImage: z.string().url('Invalid image URL'),
  images: z.array(z.string().url()).optional(),
  author: z.object({
    name: z.string().min(1, 'Author name is required'),
    email: z.string().email('Invalid email'),
    avatar: z.string().url().optional()
  }),
  tags: z.array(z.string()).optional(),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional()
});

const updateBlogSchema = createBlogSchema.partial();

// GET /api/blogs - Get all blogs with filtering and pagination
export async function GET(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'published';
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const slug = searchParams.get('slug');
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build query
    const query: any = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (featured === 'true') query.featured = true;
    if (slug) query.slug = slug;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute queries
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    const responseTime = performance.now() - startTime;
    
    return NextResponse.json({
      success: true,
      data: {
        blogs,
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
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch blogs',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create new blog
export async function POST(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    await connectDB();
    
    const body = await req.json();
    console.log('Creating blog with data:', JSON.stringify(body, null, 2));
    
    // Validate input
    const validatedData = createBlogSchema.parse(body);
    
    // Generate slug from title
    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    }

    const slug = generateSlug(validatedData.title);
    
    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug });
    
    if (existingBlog) {
      return NextResponse.json(
        { success: false, message: 'A blog with this title already exists' },
        { status: 400 }
      );
    }
    
    // Create blog with slug
    const blogData = {
      ...validatedData,
      slug
    };
    
    const blog = new Blog(blogData);
    await blog.save();
    
    const responseTime = performance.now() - startTime;
    
    return NextResponse.json({
      success: true,
      message: 'Blog created successfully',
      data: blog,
      meta: {
        responseTime: `${responseTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating blog:', error);
    
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
        message: 'Failed to create blog',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
