import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/utils/validation';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.email },
        { username: validatedData.username }
      ]
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User with this email or username already exists'
      }, { status: 400 });
    }

    // Create new user
    const user = new User(validatedData);
    await user.save();

    // Generate token
    const token = generateToken(user);

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin
        },
        token
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/auth/register:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
