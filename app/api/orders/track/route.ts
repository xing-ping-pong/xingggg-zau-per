import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';

// POST /api/orders/track - Track an order by order number and email
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/orders/track - Starting request');
    await connectDB();
    console.log('POST /api/orders/track - Database connected');

    const { orderNumber, email } = await req.json();
    
    console.log('POST /api/orders/track - Request data:', { orderNumber, email });

    if (!orderNumber || !email) {
      console.log('POST /api/orders/track - Missing required fields');
      return NextResponse.json({
        success: false,
        message: 'Order number and email are required'
      }, { status: 400 });
    }

    // Find order by order number and email
    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase(),
      'guestInfo.email': email.toLowerCase()
    }).lean();

    console.log('POST /api/orders/track - Order found:', !!order);

    if (!order) {
      console.log('POST /api/orders/track - Order not found');
      return NextResponse.json({
        success: false,
        message: 'Order not found. Please check your order number and email.'
      }, { status: 404 });
    }

    // Generate status history based on order status and dates
    const statusHistory = generateStatusHistory(order);

    // Format order data for frontend
    const orderData = {
      orderNumber: order.orderNumber,
      status: order.status,
      orderDate: order.createdAt,
      estimatedDelivery: order.estimatedDelivery || calculateEstimatedDelivery(order.createdAt),
      trackingNumber: order.trackingNumber || 'Not yet assigned',
      items: order.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.totalPrice
      })),
      total: order.pricing.total,
      shippingAddress: formatShippingAddress(order.guestInfo),
      statusHistory: statusHistory
    };

    console.log('POST /api/orders/track - Order data formatted successfully');

    return NextResponse.json({
      success: true,
      data: orderData
    });

  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to generate status history
function generateStatusHistory(order: any) {
  const history = [];
  const now = new Date();
  
  // Order Placed
  history.push({
    id: '1',
    status: 'Order Placed',
    date: order.createdAt,
    description: 'Your order has been received and is being processed',
    completed: true
  });

  // Processing
  if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)) {
    history.push({
      id: '2',
      status: 'Processing',
      date: new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000), // 1 day later
      description: 'Your order is being prepared for shipment',
      completed: true
    });
  }

  // Shipped
  if (['shipped', 'delivered'].includes(order.status)) {
    history.push({
      id: '3',
      status: 'Shipped',
      date: order.updatedAt || new Date(order.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days later
      description: 'Your order has been shipped and is on its way',
      completed: true
    });
  }

  // Out for Delivery
  if (order.status === 'delivered') {
    history.push({
      id: '4',
      status: 'Out for Delivery',
      date: order.deliveredAt || new Date(order.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days later
      description: 'Your order is out for delivery',
      completed: true
    });
  }

  // Delivered
  if (order.status === 'delivered') {
    history.push({
      id: '5',
      status: 'Delivered',
      date: order.deliveredAt || new Date(order.createdAt.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days later
      description: 'Your order has been delivered',
      completed: true
    });
  } else if (order.status === 'shipped') {
    // If shipped but not delivered, show out for delivery as pending
    history.push({
      id: '4',
      status: 'Out for Delivery',
      date: order.estimatedDelivery || new Date(order.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000),
      description: 'Your order is out for delivery',
      completed: false
    });
    
    history.push({
      id: '5',
      status: 'Delivered',
      date: order.estimatedDelivery || new Date(order.createdAt.getTime() + 4 * 24 * 60 * 60 * 1000),
      description: 'Your order has been delivered',
      completed: false
    });
  } else {
    // For pending/confirmed/processing orders, show upcoming statuses as pending
    history.push({
      id: '3',
      status: 'Shipped',
      date: order.estimatedDelivery || new Date(order.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
      description: 'Your order will be shipped soon',
      completed: false
    });
    
    history.push({
      id: '4',
      status: 'Out for Delivery',
      date: order.estimatedDelivery || new Date(order.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000),
      description: 'Your order will be out for delivery',
      completed: false
    });
    
    history.push({
      id: '5',
      status: 'Delivered',
      date: order.estimatedDelivery || new Date(order.createdAt.getTime() + 4 * 24 * 60 * 60 * 1000),
      description: 'Your order will be delivered',
      completed: false
    });
  }

  return history;
}

// Helper function to calculate estimated delivery
function calculateEstimatedDelivery(orderDate: Date) {
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days from order date
  return deliveryDate;
}

// Helper function to format shipping address
function formatShippingAddress(guestInfo: any) {
  return `${guestInfo.address}, ${guestInfo.city}, ${guestInfo.zipCode}, ${guestInfo.country}`;
}
