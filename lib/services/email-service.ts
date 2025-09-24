const nodemailer = require('nodemailer');

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface TrackingEmailData {
  customerName: string;
  customerEmail: string;
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

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email service (using Gmail as example)
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    });
  }

  async sendTrackingNotification(data: TrackingEmailData): Promise<boolean> {
    try {
      // Check if email is configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email not configured, skipping email notification');
        return false;
      }

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'ZAU Perfumes'}" <${process.env.EMAIL_USER}>`,
        to: data.customerEmail,
        subject: `🚚 Your Order #${data.orderNumber} Has Been Shipped!`,
        html: this.generateTrackingEmailHTML(data),
        text: this.generateTrackingEmailText(data),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Tracking email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending tracking email:', error);
      return false;
    }
  }

  private generateTrackingEmailHTML(data: TrackingEmailData): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Shipped - ZAU Perfumes</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .tracking-box { background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
        .tracking-number { font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; }
        .order-details { background: white; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; color: #333; margin-top: 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Your Order Has Been Shipped!</h1>
          <p>Dear ${data.customerName}, your luxury perfume order is on its way!</p>
        </div>
        
        <div class="content">
          <div class="tracking-box">
            <h2>📦 Tracking Information</h2>
            <div class="tracking-number">${data.trackingNumber}</div>
            <p>Estimated Delivery: ${data.estimatedDelivery}</p>
            <a href="${data.trackingUrl}" class="button">Track Your Package</a>
          </div>

          <div class="order-details">
            <h3>📋 Order Details</h3>
            <p><strong>Order Number:</strong> #${data.orderNumber}</p>
            
            <h4>Items Ordered:</h4>
            ${data.items.map(item => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>PKR {item.price.toFixed(2)}</span>
              </div>
            `).join('')}
            
            <div class="total">Total: PKR {data.totalAmount.toFixed(2)}</div>
          </div>

          <div class="order-details">
            <h3>🚚 Shipping Address</h3>
            <p>
              ${data.shippingAddress.street}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}<br>
              ${data.shippingAddress.country}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p>Thank you for choosing ZAU Perfumes! 🌹</p>
            <p>If you have any questions, please contact our customer service.</p>
          </div>
        </div>

        <div class="footer">
          <p>© 2024 ZAU Perfumes. All rights reserved.</p>
          <p>This email was sent to ${data.customerEmail}</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private generateTrackingEmailText(data: TrackingEmailData): string {
    return `
🎉 Your Order Has Been Shipped!

Dear ${data.customerName},

Your luxury perfume order #${data.orderNumber} has been shipped and is on its way!

📦 TRACKING INFORMATION:
Tracking Number: ${data.trackingNumber}
Estimated Delivery: ${data.estimatedDelivery}
Track Your Package: ${data.trackingUrl}

📋 ORDER DETAILS:
Order Number: #${data.orderNumber}

Items Ordered:
${data.items.map(item => `- ${item.name} x${item.quantity} - PKR ${item.price.toFixed(2)}`).join('\n')}

Total: PKR {data.totalAmount.toFixed(2)}

🚚 SHIPPING ADDRESS:
${data.shippingAddress.street}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
${data.shippingAddress.country}

Thank you for choosing ZAU Perfumes! 🌹

If you have any questions, please contact our customer service.

© 2024 ZAU Perfumes. All rights reserved.
    `;
  }

  async sendOrderConfirmation(data: Omit<TrackingEmailData, 'trackingNumber' | 'trackingUrl' | 'estimatedDelivery'>): Promise<boolean> {
    try {
      // Check if email is configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email not configured, skipping email notification');
        return false;
      }

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'ZAU Perfumes'}" <${process.env.EMAIL_USER}>`,
        to: data.customerEmail,
        subject: `✅ Order Confirmation #${data.orderNumber}`,
        html: this.generateOrderConfirmationHTML(data),
        text: this.generateOrderConfirmationText(data),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return false;
    }
  }

  private generateOrderConfirmationHTML(data: Omit<TrackingEmailData, 'trackingNumber' | 'trackingUrl' | 'estimatedDelivery'>): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - ZAU Perfumes</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; color: #333; margin-top: 10px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Confirmed!</h1>
          <p>Thank you for your order, ${data.customerName}!</p>
        </div>
        
        <div class="content">
          <div class="order-details">
            <h3>📋 Order Details</h3>
            <p><strong>Order Number:</strong> #${data.orderNumber}</p>
            
            <h4>Items Ordered:</h4>
            ${data.items.map(item => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>PKR {item.price.toFixed(2)}</span>
              </div>
            `).join('')}
            
            <div class="total">Total: PKR {data.totalAmount.toFixed(2)}</div>
          </div>

          <div class="order-details">
            <h3>🚚 Shipping Address</h3>
            <p>
              ${data.shippingAddress.street}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}<br>
              ${data.shippingAddress.country}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p>We'll send you a tracking number once your order ships! 🚚</p>
            <p>Thank you for choosing ZAU Perfumes! 🌹</p>
          </div>
        </div>

        <div class="footer">
          <p>© 2024 ZAU Perfumes. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private generateOrderConfirmationText(data: Omit<TrackingEmailData, 'trackingNumber' | 'trackingUrl' | 'estimatedDelivery'>): string {
    return `
✅ Order Confirmed!

Dear ${data.customerName},

Thank you for your order! We've received your order #${data.orderNumber} and will process it soon.

📋 ORDER DETAILS:
Order Number: #${data.orderNumber}

Items Ordered:
${data.items.map(item => `- ${item.name} x${item.quantity} - PKR ${item.price.toFixed(2)}`).join('\n')}

Total: PKR {data.totalAmount.toFixed(2)}

🚚 SHIPPING ADDRESS:
${data.shippingAddress.street}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
${data.shippingAddress.country}

We'll send you a tracking number once your order ships! 🚚

Thank you for choosing ZAU Perfumes! 🌹

© 2024 ZAU Perfumes. All rights reserved.
    `;
  }
}

export default new EmailService();
