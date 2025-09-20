import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/lib/models/Wishlist';
import { authenticateUser } from '@/lib/auth';
import { asyncHandler } from '@/lib/utils/errorHandler';

export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { productId: string } }) => {
  await connectDB();

  const user = await authenticateUser(req as any);
  if (!user) {
    return NextResponse.json({
      success: false,
      message: 'Authentication required'
    }, { status: 401 });
  }

  // Find wishlist
  const wishlist = await Wishlist.findOne({ user: user._id });
  if (!wishlist) {
    return NextResponse.json({
      success: false,
      message: 'Wishlist not found'
    }, { status: 404 });
  }

  // Remove item from wishlist
  wishlist.items = wishlist.items.filter(
    (item: any) => item.product.toString() !== params.productId
  );

  await wishlist.save();
  await wishlist.populate('items.product', 'name price imageUrl stockQuantity isActive');

  return NextResponse.json({
    success: true,
    message: 'Product removed from wishlist',
    data: { wishlist }
  });
});
