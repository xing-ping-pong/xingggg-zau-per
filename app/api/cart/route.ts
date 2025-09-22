import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/lib/models/Cart';
import GuestUser from '@/lib/models/GuestUser';
import { addPerformanceHeaders } from '@/lib/utils/performance';
import { getClientIP, getClientUserAgent } from '@/lib/utils/getClientIP';

export async function GET(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    console.log('GET /api/cart - Starting request');
    await connectDB();
    console.log('GET /api/cart - Database connected');

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const isGuest = searchParams.get('isGuest') === 'true';

    console.log('GET /api/cart - Params:', { userId, isGuest });

    if (!userId) {
      console.log('GET /api/cart - Missing userId');
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    let cart;
    if (isGuest) {
      // Handle guest user by IP
      console.log('GET /api/cart - Handling guest user');
      const ipAddress = getClientIP(req);
      console.log('GET /api/cart - IP Address:', ipAddress);
      
      const guestUser = await GuestUser.findOne({ ipAddress })
        .populate('cartItems.product')
        .lean();
      
      console.log('GET /api/cart - Guest user found:', !!guestUser);
      cart = guestUser ? { items: guestUser.cartItems } : { items: [] };
    } else {
      // Handle registered user
      console.log('GET /api/cart - Handling registered user');
      cart = await Cart.findOne({ user: userId })
        .populate('items.product')
        .lean();
      console.log('GET /api/cart - Cart found:', !!cart);
    }

    const response = NextResponse.json({
      success: true,
      data: { 
        cart: cart || { items: [] },
        count: cart?.items?.length || 0
      }
    });

    return addPerformanceHeaders(response, startTime);
  } catch (error) {
    console.error('Error in GET /api/cart:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    await connectDB();

    const body = await req.json();
    const { userId, productId, quantity = 1, isGuest = false } = body;

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

      // Check if product is already in cart
      const existingItem = guestUser.cartItems.find(item => item.product.toString() === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        guestUser.cartItems.push({ product: productId, quantity });
      }

      await guestUser.save();

      const response = NextResponse.json({
        success: true,
        message: 'Product added to cart',
        data: { cart: { items: guestUser.cartItems } }
      });

      return addPerformanceHeaders(response, startTime);
    } else {
      // Handle registered user
      let cart = await Cart.findOne({ user: userId });
      
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      // Check if product is already in cart
      const existingItem = cart.items.find(item => item.product.toString() === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();

      const response = NextResponse.json({
        success: true,
        message: 'Product added to cart',
        data: { cart }
      });

      return addPerformanceHeaders(response, startTime);
    }
  } catch (error) {
    console.error('Error in POST /api/cart:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    await connectDB();

    const body = await req.json();
    const { userId, productId, quantity, isGuest = false } = body;

    if (!userId || !productId || quantity === undefined) {
      return NextResponse.json({
        success: false,
        message: 'User ID, Product ID, and quantity are required'
      }, { status: 400 });
    }

    if (isGuest) {
      // Handle guest user by IP
      const ipAddress = getClientIP(req);
      const guestUser = await GuestUser.findOne({ ipAddress });
      
      if (!guestUser) {
        return NextResponse.json({
          success: false,
          message: 'Guest cart not found'
        }, { status: 404 });
      }

      const item = guestUser.cartItems.find(item => item.product.toString() === productId);
      
      if (!item) {
        return NextResponse.json({
          success: false,
          message: 'Product not found in cart'
        }, { status: 404 });
      }

      if (quantity <= 0) {
        guestUser.cartItems = guestUser.cartItems.filter(item => item.product.toString() !== productId);
      } else {
        item.quantity = quantity;
      }

      await guestUser.save();

      const response = NextResponse.json({
        success: true,
        message: 'Cart updated',
        data: { cart: { items: guestUser.cartItems } }
      });

      return addPerformanceHeaders(response, startTime);
    } else {
      // Handle registered user
      const cart = await Cart.findOne({ user: userId });
      
      if (!cart) {
        return NextResponse.json({
          success: false,
          message: 'Cart not found'
        }, { status: 404 });
      }

      const item = cart.items.find(item => item.product.toString() === productId);
      
      if (!item) {
        return NextResponse.json({
          success: false,
          message: 'Product not found in cart'
        }, { status: 404 });
      }

      if (quantity <= 0) {
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
      } else {
        item.quantity = quantity;
      }

      await cart.save();

      const response = NextResponse.json({
        success: true,
        message: 'Cart updated',
        data: { cart }
      });

      return addPerformanceHeaders(response, startTime);
    }
  } catch (error) {
    console.error('Error in PUT /api/cart:', error);
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
          message: 'Guest cart not found'
        }, { status: 404 });
      }

      // Remove product from cart
      guestUser.cartItems = guestUser.cartItems.filter(item => item.product.toString() !== productId);
      await guestUser.save();

      const response = NextResponse.json({
        success: true,
        message: 'Product removed from cart',
        data: { cart: { items: guestUser.cartItems } }
      });

      return addPerformanceHeaders(response, startTime);
    } else {
      // Handle registered user
      const cart = await Cart.findOne({ user: userId });
      
      if (!cart) {
        return NextResponse.json({
          success: false,
          message: 'Cart not found'
        }, { status: 404 });
      }

      // Remove product from cart
      cart.items = cart.items.filter(item => item.product.toString() !== productId);
      await cart.save();

      const response = NextResponse.json({
        success: true,
        message: 'Product removed from cart',
        data: { cart }
      });

      return addPerformanceHeaders(response, startTime);
    }
  } catch (error) {
    console.error('Error in DELETE /api/cart:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}