import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';

// Import email service
const emailService = require('@/lib/services/email-service');
// Import WhatsApp service
const { WhatsAppService } = require('@/lib/services/whatsapp.js');

// PUT /api/admin/orders/[id]/notify/confirmation - Send order confirmation
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await req.json();
    const { sendEmail = true, sendWhatsapp = true } = body;

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

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
      items: productDetails,
      totalAmount: order.pricing.total,
      shippingAddress: {
        street: order.guestInfo.address,
        city: order.guestInfo.city,
        state: order.guestInfo.zipCode,
        zipCode: order.guestInfo.zipCode,
        country: order.guestInfo.country
      }
    };

    const results = {
      emailSent: false,
      whatsappSent: false,
      errors: [] as string[]
    };

    // Send email confirmation
    if (sendEmail) {
      try {
        const emailSent = await emailService.sendOrderConfirmation(notificationData);
        results.emailSent = emailSent;
        
        if (emailSent) {
          await Order.findByIdAndUpdate(id, {
            'notifications.emailSent': true,
            'notifications.emailSentAt': new Date()
          });
        } else {
          results.errors.push('Failed to send email confirmation');
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        results.errors.push('Email confirmation failed');
      }
    }

    // Send WhatsApp confirmation
    if (sendWhatsapp && notificationData.customerPhone) {
      try {
        const whatsappData = {
          orderNumber: notificationData.orderNumber,
          customerName: notificationData.customerName,
          total: notificationData.totalAmount,
          items: notificationData.items
        };
        
        const whatsappResult = await WhatsAppService.sendOrderConfirmation(
          whatsappData, 
          notificationData.customerPhone
        );
        
        results.whatsappSent = whatsappResult.success;
        
        if (!whatsappResult.success) {
          results.errors.push('Failed to send WhatsApp confirmation');
        }
      } catch (error) {
        console.error('WhatsApp confirmation error:', error);
        results.errors.push('WhatsApp confirmation failed');
      }
    } else if (sendWhatsapp && !notificationData.customerPhone) {
      results.errors.push('Customer phone number not available for WhatsApp');
    }

    // Update notification status
    await Order.findByIdAndUpdate(id, {
      'notifications.emailSent': results.emailSent,
      'notifications.whatsappSent': results.whatsappSent,
      'notifications.emailSentAt': results.emailSent ? new Date() : undefined,
      'notifications.whatsappSentAt': results.whatsappSent ? new Date() : undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Order confirmation sent successfully',
      data: {
        order,
        notifications: results
      }
    });

  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send order confirmation',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
