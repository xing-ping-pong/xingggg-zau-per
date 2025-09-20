import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/lib/models/Cart';
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

    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .lean();

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
    const { userId, productId, quantity = 1 } = body;

    if (!userId || !productId) {
      return NextResponse.json({
        success: false,
        message: 'User ID and Product ID are required'
      }, { status: 400 });
    }

    // Find or create cart for user
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
    const { userId, productId, quantity } = body;

    if (!userId || !productId || quantity === undefined) {
      return NextResponse.json({
        success: false,
        message: 'User ID, Product ID, and quantity are required'
      }, { status: 400 });
    }

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
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json({
        success: false,
        message: 'User ID and Product ID are required'
      }, { status: 400 });
    }

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
  } catch (error) {
    console.error('Error in DELETE /api/cart:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}