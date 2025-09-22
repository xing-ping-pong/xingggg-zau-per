import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export class WhatsAppService {
  static async sendMessage(to: string, message: string) {
    try {
      const result = await client.messages.create({
        body: message,
        from: `whatsapp:${process.env.WHATSAPP_FROM_NUMBER}`,
        to: `whatsapp:${to}`
      });
      
      console.log('WhatsApp message sent:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('WhatsApp error:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendOrderConfirmation(orderData: any, customerNumber: string) {
    const message = `🛍️ *Order Confirmation - ROSIA Perfumes*

Order #${orderData.orderNumber}
Customer: ${orderData.customerName}
Total: $${orderData.total}

Items:
${orderData.items.map(item => `• ${item.name} x${item.quantity}`).join('\n')}

Thank you for your order! We'll notify you when it ships.

Best regards,
ROSIA Team`;

    return this.sendMessage(customerNumber, message);
  }

  static async sendTrackingNotification(trackingData: any, customerNumber: string) {
    const message = `📦 *Tracking Update - ROSIA Perfumes*

Order #${trackingData.orderNumber}
Tracking Number: ${trackingData.trackingNumber}
Carrier: ${trackingData.carrier}
Estimated Delivery: ${trackingData.estimatedDelivery}

Track your order: ${trackingData.trackingUrl}

Your order is on its way! 🚚

Best regards,
ROSIA Team`;

    return this.sendMessage(customerNumber, message);
  }

  static async sendContactFormNotification(contactData: any) {
    const message = `📧 *New Contact Form - ROSIA Perfumes*

From: ${contactData.name}
Email: ${contactData.email}
Subject: ${contactData.subject}
Category: ${contactData.category}

Message: ${contactData.message}

Reply at: ${process.env.NEXTAUTH_URL}/admin/messages`;

    return this.sendMessage(process.env.WHATSAPP_ADMIN_NUMBER!, message);
  }
}
