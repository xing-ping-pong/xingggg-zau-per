import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactMessage from '@/lib/models/ContactMessage';
import { authenticateUser } from '@/lib/auth';
import { contactMessageSchema } from '@/lib/utils/validation';
import { asyncHandler } from '@/lib/utils/errorHandler';

export const POST = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  const body = await req.json();
  const validatedData = contactMessageSchema.parse(body);

  // Get user if authenticated
  const user = await authenticateUser(req as any);

  const contactMessage = new ContactMessage({
    ...validatedData,
    user: user?._id || null
  });

  await contactMessage.save();

  return NextResponse.json({
    success: true,
    message: 'Message sent successfully',
    data: { contactMessage }
  }, { status: 201 });
});

export const GET = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  const user = await authenticateUser(req as any);
  if (!user || !user.isAdmin) {
    return NextResponse.json({
      success: false,
      message: 'Admin access required'
    }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');

  const query: any = {};
  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [messages, totalCount] = await Promise.all([
    ContactMessage.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ContactMessage.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return NextResponse.json({
    success: true,
    data: {
      messages,
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
