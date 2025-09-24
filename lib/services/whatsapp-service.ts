interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
}

interface TrackingWhatsAppData {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    };
    
    this.baseUrl = 'https://graph.facebook.com/v18.0';
  }

  async sendTrackingNotification(data: TrackingWhatsAppData): Promise<boolean> {
    try {
      const message = this.generateTrackingMessage(data);
      
      const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: data.customerPhone,
          type: 'text',
          text: {
            body: message
          }
        })
      });

      if (response.ok) {
        console.log('WhatsApp tracking notification sent successfully');
        return true;
      } else {
        const error = await response.json();
        console.error('WhatsApp API error:', error);
        return false;
      }
    } catch (error) {
      console.error('Error sending WhatsApp tracking notification:', error);
      return false;
    }
  }

  async sendOrderConfirmation(data: Omit<TrackingWhatsAppData, 'trackingNumber' | 'trackingUrl' | 'estimatedDelivery'>): Promise<boolean> {
    try {
      const message = this.generateOrderConfirmationMessage(data);
      
      const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: data.customerPhone,
          type: 'text',
          text: {
            body: message
          }
        })
      });

      if (response.ok) {
        console.log('WhatsApp order confirmation sent successfully');
        return true;
      } else {
        const error = await response.json();
        console.error('WhatsApp API error:', error);
        return false;
      }
    } catch (error) {
      console.error('Error sending WhatsApp order confirmation:', error);
      return false;
    }
  }

  private generateTrackingMessage(data: TrackingWhatsAppData): string {
    const itemsList = data.items.map(item => 
      `• ${item.name} x${item.quantity} - PKR ${item.price.toFixed(2)}`
    ).join('\n');

    return `🎉 *Your Order Has Been Shipped!*

Dear ${data.customerName},

Your luxury perfume order #${data.orderNumber} has been shipped and is on its way!

📦 *TRACKING INFORMATION:*
Tracking Number: *${data.trackingNumber}*
Estimated Delivery: ${data.estimatedDelivery}

Track your package: ${data.trackingUrl}

📋 *ORDER DETAILS:*
Order Number: #${data.orderNumber}

*Items Ordered:*
${itemsList}

*Total: PKR {data.totalAmount.toFixed(2)}*

🚚 *SHIPPING ADDRESS:*
${data.shippingAddress.street}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
${data.shippingAddress.country}

Thank you for choosing ZAU Perfumes! 🌹

If you have any questions, please contact our customer service.

_© 2024 ZAU Perfumes. All rights reserved._`;
  }

  private generateOrderConfirmationMessage(data: Omit<TrackingWhatsAppData, 'trackingNumber' | 'trackingUrl' | 'estimatedDelivery'>): string {
    const itemsList = data.items.map(item => 
      `• ${item.name} x${item.quantity} - PKR ${item.price.toFixed(2)}`
    ).join('\n');

    return `✅ *Order Confirmed!*

Dear ${data.customerName},

Thank you for your order! We've received your order #${data.orderNumber} and will process it soon.

📋 *ORDER DETAILS:*
Order Number: #${data.orderNumber}

*Items Ordered:*
${itemsList}

*Total: PKR {data.totalAmount.toFixed(2)}*

🚚 *SHIPPING ADDRESS:*
${data.shippingAddress.street}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
${data.shippingAddress.country}

We'll send you a tracking number once your order ships! 🚚

Thank you for choosing ZAU Perfumes! 🌹

_© 2024 ZAU Perfumes. All rights reserved._`;
  }

  // Alternative method using WhatsApp Cloud API with templates
  async sendTemplateMessage(phoneNumber: string, templateName: string, parameters: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'en_US'
            },
            components: [
              {
                type: 'body',
                parameters: parameters.map(param => ({
                  type: 'text',
                  text: param
                }))
              }
            ]
          }
        })
      });

      if (response.ok) {
        console.log('WhatsApp template message sent successfully');
        return true;
      } else {
        const error = await response.json();
        console.error('WhatsApp template API error:', error);
        return false;
      }
    } catch (error) {
      console.error('Error sending WhatsApp template message:', error);
      return false;
    }
  }

  // Method to send tracking notification using template
  async sendTrackingTemplate(data: TrackingWhatsAppData): Promise<boolean> {
    const parameters = [
      data.customerName,
      data.orderNumber,
      data.trackingNumber,
      data.estimatedDelivery,
      data.trackingUrl
    ];

    return await this.sendTemplateMessage(data.customerPhone, 'order_shipped', parameters);
  }
}

export default new WhatsAppService();
