# Email Setup Guide for ROSIA Perfumes

This guide explains how to set up email notifications for contact form replies.

## 📧 Email Service Configuration

The system uses Nodemailer to send email notifications when admins reply to contact form messages.

### Environment Variables Required

Add these variables to your `.env.local` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASS`

3. **Configure Environment Variables**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

### Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
```

## 🚀 How It Works

### Contact Form Flow:
1. **Customer submits** contact form → Message stored in database
2. **Admin views** message in admin panel (`/admin/messages`)
3. **Admin replies** → Reply stored in database + Email sent to customer
4. **Customer receives** professional email with the reply

### Email Features:
- **Professional HTML Template** with ROSIA branding
- **Original Message Context** included
- **Contact Information** for follow-up
- **Responsive Design** for all devices
- **Fallback Text Version** for email clients that don't support HTML

## 📧 Email Template Features

### HTML Email Includes:
- **ROSIA Logo & Branding**
- **Customer's Original Subject**
- **Admin's Reply** (formatted nicely)
- **Contact Information** (email, phone, website)
- **Professional Signature**
- **Responsive Design**

### Text Email Includes:
- **Plain text version** for compatibility
- **Same information** as HTML version
- **Clean formatting** for all email clients

## 🔧 Testing Email Setup

### Test Email Sending:
1. Set up environment variables
2. Submit a contact form
3. Reply to the message in admin panel
4. Check customer's email inbox

### Debugging:
- Check server logs for email sending status
- Verify SMTP credentials are correct
- Ensure firewall allows SMTP connections
- Check spam folder if emails don't arrive

## 🛡️ Security Considerations

### Best Practices:
- **Use App Passwords** instead of main account passwords
- **Enable 2FA** on email accounts
- **Rotate passwords** regularly
- **Monitor email usage** for unusual activity

### Production Setup:
- **Use dedicated email service** (SendGrid, Mailgun, etc.)
- **Set up SPF/DKIM records** for better deliverability
- **Monitor bounce rates** and spam complaints
- **Implement rate limiting** for email sending

## 📊 Email Analytics (Future Enhancement)

Consider adding:
- **Email open tracking**
- **Click tracking**
- **Delivery status monitoring**
- **Bounce handling**
- **Unsubscribe functionality**

## 🆘 Troubleshooting

### Common Issues:

1. **"Email service not configured"**
   - Check environment variables are set
   - Verify SMTP credentials are correct

2. **"Authentication failed"**
   - Use app password instead of account password
   - Enable 2FA on email account

3. **"Connection timeout"**
   - Check firewall settings
   - Verify SMTP host and port
   - Try different SMTP port (465 for SSL)

4. **Emails not received**
   - Check spam folder
   - Verify email address is correct
   - Check email provider's security settings

### Support:
- Check server logs for detailed error messages
- Test with different email providers
- Use email testing tools (Mailtrap, etc.)

---

**Note**: The email service gracefully handles failures - if email sending fails, the reply is still saved to the database, ensuring no data loss.
