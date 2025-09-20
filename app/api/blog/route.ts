import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/lib/models/BlogPost';
import { authenticateUser } from '@/lib/auth';
import { blogPostSchema } from '@/lib/utils/validation';
import { asyncHandler } from '@/lib/utils/errorHandler';

export const GET = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search');
  const tag = searchParams.get('tag');
  const published = searchParams.get('published') !== 'false';

  const query: any = {};
  
  if (published) {
    query.isPublished = true;
    query.publishDate = { $lte: new Date() };
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (tag) {
    query.tags = tag;
  }

  const skip = (page - 1) * limit;

  const [posts, totalCount] = await Promise.all([
    BlogPost.find(query)
      .populate('author', 'username')
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BlogPost.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return NextResponse.json({
    success: true,
    data: {
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

export const POST = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  const user = await authenticateUser(req as any);
  if (!user || !user.isAdmin) {
    return NextResponse.json({
      success: false,
      message: 'Admin access required'
    }, { status: 403 });
  }

  const body = await req.json();
  const validatedData = blogPostSchema.parse(body);

  // Set author and publish date
  const blogPost = new BlogPost({
    ...validatedData,
    author: user._id,
    publishDate: validatedData.publishDate ? new Date(validatedData.publishDate) : new Date()
  });

  await blogPost.save();
  await blogPost.populate('author', 'username');

  return NextResponse.json({
    success: true,
    message: 'Blog post created successfully',
    data: { blogPost }
  }, { status: 201 });
});
