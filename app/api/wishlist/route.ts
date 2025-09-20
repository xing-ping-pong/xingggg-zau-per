import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/lib/models/Wishlist';
import { addPerformanceHeaders } from '@/lib/utils/performance';

export async function GET(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    const wishlist = await Wishlist.findOne({ user: userId })
      .lean();

    const response = NextResponse.json({
      success: true,
      data: { 
        wishlist: wishlist || { products: [] },
        count: wishlist?.products?.length || 0
      }
    });

    return addPerformanceHeaders(response, startTime);
  } catch (error) {
    console.error('Error in GET /api/wishlist:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    await connectDB();

    const body = await req.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json({
        success: false,
        message: 'User ID and Product ID are required'
      }, { status: 400 });
    }

    // Find or create wishlist for user
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    } else {
      // Ensure products array exists
      if (!wishlist.products) {
        wishlist.products = [];
      }
    }

    // Check if product is already in wishlist
    if (wishlist.products && wishlist.products.includes(productId)) {
      // Return success instead of error to avoid sync issues
      return NextResponse.json({
        success: true,
        message: 'Product already in wishlist',
        data: { wishlist }
      });
    }

    // Add product to wishlist
    if (!wishlist.products) {
      wishlist.products = [];
    }
    wishlist.products.push(productId);
    await wishlist.save();

    const response = NextResponse.json({
      success: true,
      message: 'Product added to wishlist',
      data: { wishlist }
    });

    return addPerformanceHeaders(response, startTime);
  } catch (error) {
    console.error('Error in POST /api/wishlist:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    await connectDB();

    const body = await req.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json({
        success: false,
        message: 'User ID and Product ID are required'
      }, { status: 400 });
    }

    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return NextResponse.json({
        success: false,
        message: 'Wishlist not found'
      }, { status: 404 });
    }

    // Remove product from wishlist
    wishlist.products = (wishlist.products || []).filter(id => id.toString() !== productId);
    await wishlist.save();

    const response = NextResponse.json({
      success: true,
      message: 'Product removed from wishlist',
      data: { wishlist }
    });

    return addPerformanceHeaders(response, startTime);
  } catch (error) {
    console.error('Error in DELETE /api/wishlist:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}