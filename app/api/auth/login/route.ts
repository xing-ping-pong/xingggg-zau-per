import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/utils/validation';
import { addPerformanceHeaders } from '@/lib/utils/performance';

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    await connectDB();

    const body = await req.json();
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    // Generate token
    const token = generateToken(user);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin
        },
        token
      }
    });

    // Add performance headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return addPerformanceHeaders(response, startTime);
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
