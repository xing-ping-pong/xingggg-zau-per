# Email Configuration Guide

## Overview
This guide explains how to configure the email system for automatic order confirmations and tracking notifications.

## Environment Variables

Add these variables to your `.env.local` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=ZAU Perfumes

# Base URL for assets (logo, etc.)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
# OR for Vercel deployment:
# VERCEL_URL=your-app.vercel.app
```

## Logo Configuration

The email templates automatically include the ZAU Perfumes logo. The logo URL is configured in `lib/config/email.ts` and will use:

1. `NEXT_PUBLIC_BASE_URL` if set
2. `VERCEL_URL` if deployed on Vercel
3. Fallback to `https://your-domain.com`

Make sure your logo is accessible at: `{BASE_URL}/logo/ZAU_PERFUMES%20LOGO.png`

## Email Templates

### Order Confirmation Email
- Sent automatically when a customer places an order
- Includes order details, items, and shipping address
- Uses PKR currency throughout

### Tracking Email
- Sent manually by admin when order ships
- Includes tracking number and delivery information
- Uses PKR currency throughout

## Testing

To test email functionality:

1. Set up your environment variables
2. Place a test order
3. Check that the confirmation email is sent automatically
4. Verify the logo displays correctly
5. Check that all prices show as PKR (not $)

## Troubleshooting

### Logo Not Displaying
- Check that `NEXT_PUBLIC_BASE_URL` is set correctly
- Verify the logo file exists at the specified path
- Ensure the URL is accessible from external email clients

### Currency Issues
- All templates have been updated to use PKR
- Check both HTML and text versions of emails

### Email Not Sending
- Verify email credentials are correct
- Check SMTP settings
- Ensure `EMAIL_USER` and `EMAIL_PASS` are set
- Check email service logs for errors

## Customization

To customize email templates:

1. Edit `lib/services/email-service.ts`
2. Modify the HTML and text generation methods
3. Update styling in the CSS sections
4. Test with sample data

## Support

For issues with email configuration:
1. Check environment variables
2. Verify SMTP settings
3. Test with a simple email first
4. Check server logs for errors
