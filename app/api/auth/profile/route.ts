import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await authenticateUser(req as any);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Error in GET /api/auth/profile:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const user = await authenticateUser(req as any);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const body = await req.json();
    const { username, email } = body;

    // Update user profile
    const updatedUser = await user.updateOne({
      username: username || user.username,
      email: email || user.email
    }, { new: true });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: username || user.username,
          email: email || user.email,
          isAdmin: user.isAdmin
        }
      }
    });
  } catch (error) {
    console.error('Error in PUT /api/auth/profile:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
