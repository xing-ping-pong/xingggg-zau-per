import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { authenticateUser } from '@/lib/auth';
import { asyncHandler } from '@/lib/utils/errorHandler';

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
  const search = searchParams.get('search');
  const isAdmin = searchParams.get('isAdmin');

  const query: any = {};
  
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (isAdmin !== null) {
    query.isAdmin = isAdmin === 'true';
  }

  const skip = (page - 1) * limit;

  const [users, totalCount] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return NextResponse.json({
    success: true,
    data: {
      users,
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

export const PUT = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  const user = await authenticateUser(req as any);
  if (!user || !user.isAdmin) {
    return NextResponse.json({
      success: false,
      message: 'Admin access required'
    }, { status: 403 });
  }

  const { userId, isAdmin } = await req.json();

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isAdmin },
    { new: true }
  ).select('-password');

  if (!updatedUser) {
    return NextResponse.json({
      success: false,
      message: 'User not found'
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'User updated successfully',
    data: { user: updatedUser }
  });
});

export const DELETE = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  const user = await authenticateUser(req as any);
  if (!user || !user.isAdmin) {
    return NextResponse.json({
      success: false,
      message: 'Admin access required'
    }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({
      success: false,
      message: 'User ID is required'
    }, { status: 400 });
  }

  // Prevent admin from deleting themselves
  if (userId === user._id.toString()) {
    return NextResponse.json({
      success: false,
      message: 'Cannot delete your own account'
    }, { status: 400 });
  }

  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    return NextResponse.json({
      success: false,
      message: 'User not found'
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'User deleted successfully'
  });
});
