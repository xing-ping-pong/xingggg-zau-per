const twilio = require('twilio');

// Production-ready WhatsApp service with template support
class WhatsAppProductionService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    // Check if we're in production or sandbox
    this.isProduction = process.env.NODE_ENV === 'production' && 
                       process.env.WHATSAPP_ENVIRONMENT === 'production';
    
    this.fromNumber = process.env.WHATSAPP_FROM_NUMBER;
    this.adminNumber = process.env.WHATSAPP_ADMIN_NUMBER;
  }

  // Generic message sending with template support
  async sendMessage(to, message, templateName = null, templateParams = {}) {
    try {
      const messageConfig = {
        body: message,
        from: `whatsapp:${this.fromNumber}`,
        to: `whatsapp:${to}`
      };

      // In production, use approved templates
      if (this.isProduction && templateName) {
        messageConfig.templateName = templateName;
        messageConfig.templateParams = templateParams;
        delete messageConfig.body; // Remove body when using templates
      }

      const result = await this.client.messages.create(messageConfig);
      
      console.log('WhatsApp message sent:', {
        sid: result.sid,
        to: to,
        template: templateName,
        production: this.isProduction
      });
      
      return { 
        success: true, 
        messageId: result.sid,
        templateUsed: templateName || false
      };
    } catch (error) {
      console.error('WhatsApp error:', {
        error: error.message,
        code: error.code,
        to: to,
        template: templateName,
        production: this.isProduction
      });
      
      return { 
        success: false, 
        error: error.message,
        code: error.code
      };
    }
  }

  // Order confirmation with template support
  async sendOrderConfirmation(orderData, customerNumber) {
    const message = `🛍️ *Order Confirmation - ZAU Perfumes*

Order #${orderData.orderNumber}
Customer: ${orderData.customerName}
Total: PKR ${orderData.total}

Items:
${orderData.items.map(item => `• ${item.name} x${item.quantity}`).join('\n')}

Thank you for your order! We'll notify you when it ships.

Best regards,
ZAU Team`;

    // Template parameters for production
    const templateParams = {
      order_number: orderData.orderNumber,
      customer_name: orderData.customerName,
      total_amount: `PKR ${orderData.total}`,
      items_list: orderData.items.map(item => `${item.name} x${item.quantity}`).join(', ')
    };

    return this.sendMessage(
      customerNumber, 
      message, 
      'order_confirmation', // Template name for production
      templateParams
    );
  }

  // Tracking notification with template support
  async sendTrackingNotification(trackingData, customerNumber) {
    const message = `📦 *Tracking Update - ZAU Perfumes*

Order #${trackingData.orderNumber}
Tracking Number: ${trackingData.trackingNumber}
Carrier: ${trackingData.carrier}
Estimated Delivery: ${trackingData.estimatedDelivery}

Track your order: ${trackingData.trackingUrl}

Your order is on its way! 🚚

Best regards,
ZAU Team`;

    // Template parameters for production
    const templateParams = {
      order_number: trackingData.orderNumber,
      tracking_number: trackingData.trackingNumber,
      carrier: trackingData.carrier,
      estimated_delivery: trackingData.estimatedDelivery,
      tracking_url: trackingData.trackingUrl
    };

    return this.sendMessage(
      customerNumber, 
      message, 
      'tracking_update', // Template name for production
      templateParams
    );
  }

  // Contact form notification to admin
  async sendContactFormNotification(contactData) {
    const message = `📧 *New Contact Form - ZAU Perfumes*

From: ${contactData.name}
Email: ${contactData.email}
Subject: ${contactData.subject}
Category: ${contactData.category}

Message: ${contactData.message}

Reply at: ${process.env.NEXTAUTH_URL}/admin/messages`;

    // Template parameters for production
    const templateParams = {
      customer_name: contactData.name,
      customer_email: contactData.email,
      subject: contactData.subject,
      category: contactData.category,
      message: contactData.message,
      admin_url: `${process.env.NEXTAUTH_URL}/admin/messages`
    };

    return this.sendMessage(
      this.adminNumber, 
      message, 
      'contact_form_notification', // Template name for production
      templateParams
    );
  }

  // Delivery confirmation
  async sendDeliveryConfirmation(deliveryData, customerNumber) {
    const message = `✅ *Delivery Confirmation - ZAU Perfumes*

Order #${deliveryData.orderNumber} has been delivered!

Delivery Date: ${deliveryData.deliveryDate}
Delivery Address: ${deliveryData.deliveryAddress}

Thank you for choosing ZAU Perfumes! We hope you love your purchase.

Best regards,
ZAU Team`;

    const templateParams = {
      order_number: deliveryData.orderNumber,
      delivery_date: deliveryData.deliveryDate,
      delivery_address: deliveryData.deliveryAddress
    };

    return this.sendMessage(
      customerNumber, 
      message, 
      'delivery_confirmation',
      templateParams
    );
  }

  // Payment confirmation
  async sendPaymentConfirmation(paymentData, customerNumber) {
    const message = `💳 *Payment Confirmed - ZAU Perfumes*

Order #${paymentData.orderNumber}
Payment Method: ${paymentData.paymentMethod}
Amount: PKR ${paymentData.amount}
Transaction ID: ${paymentData.transactionId}

Your payment has been successfully processed!

Best regards,
ZAU Team`;

    const templateParams = {
      order_number: paymentData.orderNumber,
      payment_method: paymentData.paymentMethod,
      amount: `PKR ${paymentData.amount}`,
      transaction_id: paymentData.transactionId
    };

    return this.sendMessage(
      customerNumber, 
      message, 
      'payment_confirmation',
      templateParams
    );
  }

  // Get service status
  getServiceStatus() {
    return {
      isProduction: this.isProduction,
      fromNumber: this.fromNumber,
      adminNumber: this.adminNumber,
      environment: process.env.WHATSAPP_ENVIRONMENT || 'sandbox'
    };
  }

  // Validate phone number format
  validatePhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid format (basic validation)
    if (cleaned.length < 10 || cleaned.length > 15) {
      return false;
    }
    
    // Ensure it starts with country code
    return cleaned.startsWith('92') || cleaned.startsWith('1') || cleaned.startsWith('44');
  }

  // Format phone number for WhatsApp
  formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add + if not present
    if (!cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    
    return cleaned;
  }
}

module.exports = { WhatsAppProductionService };
