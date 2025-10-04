const nodemailer = require('nodemailer');

class EmailService {
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

  async sendOrderConfirmation(data) {
    try {
      // Check if email is configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email not configured, skipping email notification');
        return false;
      }

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'ZAU Perfumes'}" <${process.env.EMAIL_USER}>`,
        to: data.customerEmail,
        subject: `🎉 Order Confirmation #${data.orderNumber}`,
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

  async sendTrackingNotification(data) {
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

  generateOrderConfirmationHTML(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { width: 80px; height: 80px; margin: 0 auto 20px; display: block; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 18px; font-weight: bold; color: #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : process.env.NEXTAUTH_URL) || 'https://zauperfumes.com'}/logo/ZAU_PERFUMES%20LOGO.png" alt="ZAU Perfumes" class="logo" />
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your purchase, ${data.customerName}!</p>
          </div>
          <div class="content">
            <div class="order-details">
              <h2>Order Details</h2>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
              
              <h3>Items Ordered:</h3>
              ${data.items.map(item => `
                <div class="item">
                  <span>${item.name} x ${item.quantity}</span>
                  <span>PKR ${item.price.toFixed(2)}</span>
                </div>
              `).join('')}
              
              <div class="total">
                <div class="item">
                  <span>Total Amount:</span>
                  <span>PKR ${data.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <p>We'll send you another email when your order ships!</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing ZAU Perfumes!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateOrderConfirmationText(data) {
    return `
Order Confirmation - ${data.orderNumber}

Dear ${data.customerName},

Thank you for your order! We're excited to prepare your items.

Order Details:
${data.items.map(item => `- ${item.name} x ${item.quantity} - PKR ${item.price.toFixed(2)}`).join('\n')}

Total: PKR ${data.totalAmount.toFixed(2)}

We'll send you another email when your order ships!

Best regards,
ZAU Perfumes Team
    `;
  }

  generateTrackingEmailHTML(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Shipped</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { width: 80px; height: 80px; margin: 0 auto 20px; display: block; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .tracking-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .tracking-number { font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : process.env.NEXTAUTH_URL) || 'https://zauperfumes.com'}/logo/ZAU_PERFUMES%20LOGO.png" alt="ZAU Perfumes" class="logo" />
            <h1>🚚 Your Order Has Shipped!</h1>
            <p>Great news, ${data.customerName}! Your order is on its way.</p>
          </div>
          <div class="content">
            <div class="tracking-info">
              <h2>Tracking Information</h2>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Tracking Number:</strong></p>
              <div class="tracking-number">${data.trackingNumber}</div>
              <p><strong>Carrier:</strong> ${data.carrier}</p>
              ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(data.estimatedDelivery).toLocaleDateString()}</p>` : ''}
              ${data.trackingUrl ? `<p><strong>Track Your Package:</strong> <a href="${data.trackingUrl}" style="color: #667eea; text-decoration: none;">Click Here to Track</a></p>` : ''}
            </div>
            
            <p>You can track your package using the tracking number above.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing ZAU Perfumes!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateTrackingEmailText(data) {
    return `
Your Order Has Shipped! - ${data.orderNumber}

Dear ${data.customerName},

Great news! Your order has been shipped and is on its way.

Tracking Information:
Order Number: ${data.orderNumber}
Tracking Number: ${data.trackingNumber}
Carrier: ${data.carrier}
${data.estimatedDelivery ? `Estimated Delivery: ${new Date(data.estimatedDelivery).toLocaleDateString()}` : ''}
${data.trackingUrl ? `Track Your Package: ${data.trackingUrl}` : ''}

You can track your package using the tracking number above.

Best regards,
ZAU Perfumes Team
    `;
  }
}

const emailService = new EmailService();
module.exports = emailService;
