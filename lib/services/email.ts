import nodemailer, { SentMessageInfo } from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      const config: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      };

      // Only create transporter if we have valid credentials
      if (config.auth.user && config.auth.pass) {
        this.transporter = nodemailer.createTransport(config);
        console.log('Email service initialized successfully');
      } else {
        console.warn('Email service not configured - SMTP credentials missing');
      }
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not available - skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendContactReply(
    customerEmail: string,
    customerName: string,
    originalSubject: string,
    adminReply: string,
    adminName: string = 'ZAU Support Team'
  ): Promise<boolean> {
    const subject = `Re: ${originalSubject}`;
    
    const html = this.generateContactReplyTemplate(
      customerName,
      originalSubject,
      adminReply,
      adminName
    );

    const text = this.generateContactReplyText(
      customerName,
      originalSubject,
      adminReply,
      adminName
    );

    return this.sendEmail({
      from: `"${adminName}" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject,
      html,
      text,
    });
  }

  private generateContactReplyTemplate(
    customerName: string,
    originalSubject: string,
    adminReply: string,
    adminName: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reply from ZAU Perfumes</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #d4af37;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #d4af37;
            margin-bottom: 10px;
          }
          .tagline {
            color: #666;
            font-style: italic;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
          }
          .original-subject {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #d4af37;
            margin: 20px 0;
            border-radius: 0 5px 5px 0;
          }
          .reply-content {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            white-space: pre-wrap;
          }
          .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          .contact-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ZAU</div>
            <div class="tagline">Luxury Perfumes</div>
          </div>
          
          <div class="greeting">
            Dear ${customerName},
          </div>
          
          <p>Thank you for contacting ZAU Perfumes. We have received your message and our team has prepared a response for you.</p>
          
          <div class="original-subject">
            <strong>Your Original Message:</strong><br>
            <em>${originalSubject}</em>
          </div>
          
          <div class="reply-content">
            ${adminReply}
          </div>
          
          <div class="signature">
            <p>Best regards,<br>
            <strong>${adminName}</strong><br>
            ZAU Perfumes Support Team</p>
          </div>
          
          <div class="contact-info">
            <p><strong>Need further assistance?</strong></p>
            <p>📧 Email: hello@zauperfumes.com.pk<br>
            📞 Phone: +92 300 1234567<br>
            🌐 Website: <a href="https://zauperfumes.com.pk">zauperfumes.com.pk</a></p>
          </div>
          
          <div class="footer">
            <p>This email was sent in response to your inquiry. Please do not reply directly to this email.</p>
            <p>&copy; 2024 ZAU Perfumes. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateContactReplyText(
    customerName: string,
    originalSubject: string,
    adminReply: string,
    adminName: string
  ): string {
    return `
Dear ${customerName},

Thank you for contacting ROSIA Perfumes. We have received your message and our team has prepared a response for you.

Your Original Message: ${originalSubject}

Our Reply:
${adminReply}

Best regards,
${adminName}
ZAU Perfumes Support Team

Need further assistance?
Email: hello@zauperfumes.com.pk
Phone: +92 300 1234567
Website: https://zauperfumes.com.pk

This email was sent in response to your inquiry. Please do not reply directly to this email.

© 2024 ZAU Perfumes. All rights reserved.
    `.trim();
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
