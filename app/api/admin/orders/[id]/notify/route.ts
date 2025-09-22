import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';

// Import email service
const emailService = require('@/lib/services/email-service');
// Import WhatsApp service
const { WhatsAppService } = require('@/lib/services/whatsapp.js');

// POST /api/admin/orders/[id]/notify - Send tracking notification
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await req.json();
    const { 
      trackingNumber, 
      carrier = 'Standard Shipping',
      estimatedDelivery,
      trackingUrl,
      sendEmail = true,
      sendWhatsapp = true 
    } = body;

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order with tracking information
    const updateData: any = {
      status: 'shipped',
      trackingNumber,
      carrier,
      trackingUrl: trackingUrl || `${process.env.TRACKING_BASE_URL || 'https://tracking.example.com'}/${trackingNumber}`
    };

    if (estimatedDelivery) {
      updateData.estimatedDelivery = new Date(estimatedDelivery);
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });

    // Get product details for the notification
    const productDetails = await Promise.all(
      order.items.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          name: product?.name || item.productName,
          quantity: item.quantity,
          price: item.price
        };
      })
    );

    // Prepare notification data
    const notificationData = {
      customerName: `${order.guestInfo.firstName} ${order.guestInfo.lastName}`,
      customerEmail: order.guestInfo.email,
      customerPhone: order.guestInfo.phone,
      orderNumber: order.orderNumber,
      trackingNumber: trackingNumber,
      trackingUrl: updateData.trackingUrl,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString() : '3-5 business days',
      items: productDetails,
      totalAmount: order.pricing.total,
      shippingAddress: {
        street: order.guestInfo.address,
        city: order.guestInfo.city,
        state: order.guestInfo.zipCode, // Using zipCode as state for simplicity
        zipCode: order.guestInfo.zipCode,
        country: order.guestInfo.country
      }
    };

    const results = {
      emailSent: false,
      whatsappSent: false,
      errors: [] as string[]
    };

    // Send email notification
    if (sendEmail) {
      try {
        const emailSent = await emailService.sendTrackingNotification(notificationData);
        results.emailSent = emailSent;
        
        if (emailSent) {
          await Order.findByIdAndUpdate(id, {
            'notifications.trackingEmailSent': true,
            'notifications.trackingEmailSentAt': new Date()
          });
        } else {
          results.errors.push('Failed to send email notification');
        }
      } catch (error) {
        console.error('Email notification error:', error);
        results.errors.push('Email notification failed');
      }
    }

    // Send WhatsApp tracking notification
    if (sendWhatsapp && notificationData.customerPhone) {
      try {
        const whatsappData = {
          orderNumber: notificationData.orderNumber,
          trackingNumber: trackingNumber,
          carrier: carrier,
          estimatedDelivery: estimatedDelivery,
          trackingUrl: updateData.trackingUrl
        };
        
        const whatsappResult = await WhatsAppService.sendTrackingNotification(
          whatsappData, 
          notificationData.customerPhone
        );
        
        results.whatsappSent = whatsappResult.success;
        
        if (!whatsappResult.success) {
          results.errors.push('Failed to send WhatsApp tracking notification');
        }
      } catch (error) {
        console.error('WhatsApp tracking error:', error);
        results.errors.push('WhatsApp tracking notification failed');
      }
    } else if (sendWhatsapp && !notificationData.customerPhone) {
      results.errors.push('Customer phone number not available for WhatsApp');
    }

    // Update notification status
    await Order.findByIdAndUpdate(id, {
      'notifications.trackingEmailSent': results.emailSent,
      'notifications.trackingWhatsappSent': results.whatsappSent,
      'notifications.trackingEmailSentAt': results.emailSent ? new Date() : undefined,
      'notifications.trackingWhatsappSentAt': results.whatsappSent ? new Date() : undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Tracking notification sent successfully',
      data: {
        order: updatedOrder,
        notifications: results
      }
    });

  } catch (error) {
    console.error('Error sending tracking notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send tracking notification',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

