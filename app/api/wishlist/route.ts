import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/lib/models/Wishlist';
import GuestUser from '@/lib/models/GuestUser';
import { addPerformanceHeaders } from '@/lib/utils/performance';
import { getClientIP, getClientUserAgent } from '@/lib/utils/getClientIP';

export async function GET(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const isGuest = searchParams.get('isGuest') === 'true';

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    let wishlist;
    if (isGuest) {
      // Handle guest user by IP
      const ipAddress = getClientIP(req);
      const guestUser = await GuestUser.findOne({ ipAddress })
        .populate('wishlistItems')
        .lean();
      
      wishlist = guestUser ? { products: guestUser.wishlistItems } : { products: [] };
    } else {
      // Handle registered user
      wishlist = await Wishlist.findOne({ user: userId })
        .lean();
    }

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
    const { userId, productId, isGuest = false } = body;

    if (!userId || !productId) {
      return NextResponse.json({
        success: false,
        message: 'User ID and Product ID are required'
      }, { status: 400 });
    }

    if (isGuest) {
      // Handle guest user by IP
      const ipAddress = getClientIP(req);
      const userAgent = getClientUserAgent(req);
      
      let guestUser = await GuestUser.findOne({ ipAddress });
      
      if (!guestUser) {
        guestUser = new GuestUser({ 
          ipAddress, 
          userAgent, 
          cartItems: [],
          wishlistItems: []
        });
      }

      // Ensure wishlistItems array exists
      if (!guestUser.wishlistItems) {
        guestUser.wishlistItems = [];
      }

      // Check if product is already in wishlist
      if (guestUser.wishlistItems.includes(productId)) {
        return NextResponse.json({
          success: true,
          message: 'Product already in wishlist',
          data: { wishlist: { products: guestUser.wishlistItems } }
        });
      }

      // Add product to wishlist
      guestUser.wishlistItems.push(productId);
      await guestUser.save();

      const response = NextResponse.json({
        success: true,
        message: 'Product added to wishlist',
        data: { wishlist: { products: guestUser.wishlistItems } }
      });

      return addPerformanceHeaders(response, startTime);
    } else {
      // Handle registered user
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
    }
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
    const { userId, productId, isGuest = false } = body;

    if (!userId || !productId) {
      return NextResponse.json({
        success: false,
        message: 'User ID and Product ID are required'
      }, { status: 400 });
    }

    if (isGuest) {
      // Handle guest user by IP
      const ipAddress = getClientIP(req);
      const guestUser = await GuestUser.findOne({ ipAddress });
      
      if (!guestUser) {
        return NextResponse.json({
          success: false,
          message: 'Guest wishlist not found'
        }, { status: 404 });
      }

      // Remove product from wishlist
      guestUser.wishlistItems = (guestUser.wishlistItems || []).filter(id => id.toString() !== productId);
      await guestUser.save();

      const response = NextResponse.json({
        success: true,
        message: 'Product removed from wishlist',
        data: { wishlist: { products: guestUser.wishlistItems } }
      });

      return addPerformanceHeaders(response, startTime);
    } else {
      // Handle registered user
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
    }
  } catch (error) {
    console.error('Error in DELETE /api/wishlist:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}