import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
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
  const status = searchParams.get('status');
  const paymentStatus = searchParams.get('paymentStatus');
  const search = searchParams.get('search');

  const query: any = {};
  
  if (status) {
    query.status = status;
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.email': { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [orders, totalCount] = await Promise.all([
    Order.find(query)
      .populate('user', 'username email')
      .populate('items.product', 'name imageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return NextResponse.json({
    success: true,
    data: {
      orders,
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

  const { orderId, status, trackingNumber, notes } = await req.json();

  const updateData: any = {};
  if (status) updateData.status = status;
  if (trackingNumber) updateData.trackingNumber = trackingNumber;
  if (notes) updateData.notes = notes;

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    updateData,
    { new: true }
  )
    .populate('user', 'username email')
    .populate('items.product', 'name imageUrl');

  if (!updatedOrder) {
    return NextResponse.json({
      success: false,
      message: 'Order not found'
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'Order updated successfully',
    data: { order: updatedOrder }
  });
});
