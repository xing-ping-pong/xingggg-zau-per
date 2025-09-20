import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/lib/models/Cart';
import Product from '@/lib/models/Product';
import { authenticateUser } from '@/lib/auth';
import { asyncHandler } from '@/lib/utils/errorHandler';

export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { productId: string } }) => {
  await connectDB();

  const user = await authenticateUser(req as any);
  if (!user) {
    return NextResponse.json({
      success: false,
      message: 'Authentication required'
    }, { status: 401 });
  }

  const { quantity } = await req.json();

  if (quantity < 1) {
    return NextResponse.json({
      success: false,
      message: 'Quantity must be at least 1'
    }, { status: 400 });
  }

  // Validate product exists and is active
  const product = await Product.findById(params.productId);
  if (!product || !product.isActive) {
    return NextResponse.json({
      success: false,
      message: 'Product not found or not available'
    }, { status: 404 });
  }

  // Check stock availability
  if (product.stockQuantity < quantity) {
    return NextResponse.json({
      success: false,
      message: 'Insufficient stock'
    }, { status: 400 });
  }

  // Find cart
  const cart = await Cart.findOne({ user: user._id });
  if (!cart) {
    return NextResponse.json({
      success: false,
      message: 'Cart not found'
    }, { status: 404 });
  }

  // Update item quantity
  const itemIndex = cart.items.findIndex(
    (item: any) => item.product.toString() === params.productId
  );

  if (itemIndex === -1) {
    return NextResponse.json({
      success: false,
      message: 'Product not found in cart'
    }, { status: 404 });
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  await cart.populate('items.product', 'name price imageUrl stockQuantity isActive');

  return NextResponse.json({
    success: true,
    message: 'Cart updated successfully',
    data: { cart }
  });
});

export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { productId: string } }) => {
  await connectDB();

  const user = await authenticateUser(req as any);
  if (!user) {
    return NextResponse.json({
      success: false,
      message: 'Authentication required'
    }, { status: 401 });
  }

  // Find cart
  const cart = await Cart.findOne({ user: user._id });
  if (!cart) {
    return NextResponse.json({
      success: false,
      message: 'Cart not found'
    }, { status: 404 });
  }

  // Remove item from cart
  cart.items = cart.items.filter(
    (item: any) => item.product.toString() !== params.productId
  );

  await cart.save();
  await cart.populate('items.product', 'name price imageUrl stockQuantity isActive');

  return NextResponse.json({
    success: true,
    message: 'Product removed from cart',
    data: { cart }
  });
});
