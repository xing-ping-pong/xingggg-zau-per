import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/lib/models/BlogPost';
import { authenticateUser } from '@/lib/auth';
import { blogPostSchema } from '@/lib/utils/validation';
import { asyncHandler } from '@/lib/utils/errorHandler';

export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { slug: string } }) => {
  await connectDB();

  const blogPost = await BlogPost.findOne({ 
    slug: params.slug,
    isPublished: true,
    publishDate: { $lte: new Date() }
  })
    .populate('author', 'username')
    .lean();

  if (!blogPost) {
    return NextResponse.json({
      success: false,
      message: 'Blog post not found'
    }, { status: 404 });
  }

  // Increment view count
  await BlogPost.findByIdAndUpdate(blogPost._id, { $inc: { viewCount: 1 } });

  return NextResponse.json({
    success: true,
    data: { blogPost }
  });
});

export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { slug: string } }) => {
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

  const blogPost = await BlogPost.findOneAndUpdate(
    { slug: params.slug },
    {
      ...validatedData,
      publishDate: validatedData.publishDate ? new Date(validatedData.publishDate) : undefined
    },
    { new: true, runValidators: true }
  ).populate('author', 'username');

  if (!blogPost) {
    return NextResponse.json({
      success: false,
      message: 'Blog post not found'
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'Blog post updated successfully',
    data: { blogPost }
  });
});

export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { slug: string } }) => {
  await connectDB();

  const user = await authenticateUser(req as any);
  if (!user || !user.isAdmin) {
    return NextResponse.json({
      success: false,
      message: 'Admin access required'
    }, { status: 403 });
  }

  const blogPost = await BlogPost.findOneAndDelete({ slug: params.slug });

  if (!blogPost) {
    return NextResponse.json({
      success: false,
      message: 'Blog post not found'
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'Blog post deleted successfully'
  });
});
