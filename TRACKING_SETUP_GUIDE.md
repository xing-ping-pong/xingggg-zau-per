# 📦 Tracking Number & Notification Setup Guide

## 🚀 Overview

This guide will help you set up tracking number notifications via email and WhatsApp for your ROSIA Perfumes e-commerce site.

## 📧 Email Setup (Gmail Example)

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication

### 2. Generate App Password
- Go to Google Account → Security → App passwords
- Generate a new app password for "Mail"
- Copy the 16-character password

### 3. Add to Environment Variables
Create a `.env.local` file in your project root:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM_NAME=ROSIA Perfumes
```

## 📱 WhatsApp Business API Setup

### 1. Create Facebook Developer Account
- Go to [developers.facebook.com](https://developers.facebook.com)
- Create a new app
- Add WhatsApp Business API product

### 2. Get Access Token
- Go to WhatsApp → API Setup
- Copy your access token
- Copy your phone number ID

### 3. Add to Environment Variables
```env
# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
```

## 🔧 Tracking Configuration

### 1. Set Up Tracking URL
```env
# Tracking Configuration
TRACKING_BASE_URL=https://your-tracking-provider.com
```

### 2. Install Required Packages
```bash
npm install nodemailer @types/nodemailer
```

## 🎯 How to Use

### 1. Send Order Confirmation
- Go to Admin Panel → Orders
- Click on any order to view details
- In the "Order Confirmation Notifications" section
- Click "Send Order Confirmation"
- This sends both email and WhatsApp notifications

### 2. Send Tracking Notification
- When order is ready to ship:
- Enter tracking number
- Select carrier
- Set estimated delivery date
- Click "Send Tracking Notification"
- Customer receives tracking info via email and WhatsApp

## 📋 Features Included

### ✅ Email Notifications
- **Order Confirmation**: Beautiful HTML email with order details
- **Tracking Notification**: Professional email with tracking info
- **Responsive Design**: Works on all devices
- **Brand Styling**: Matches your luxury perfume brand

### ✅ WhatsApp Notifications
- **Order Confirmation**: Text message with order details
- **Tracking Notification**: Text message with tracking info
- **Template Support**: Can use WhatsApp templates
- **Rich Formatting**: Bold text and emojis

### ✅ Admin Panel Features
- **Notification Status**: See what's been sent
- **Send History**: Track when notifications were sent
- **Bulk Actions**: Send to multiple orders
- **Error Handling**: Clear error messages

## 🔍 Testing

### 1. Test Email
```bash
# Test email service
curl -X POST http://localhost:3000/api/admin/orders/ORDER_ID/notify/confirmation \
  -H "Content-Type: application/json" \
  -d '{"sendEmail": true, "sendWhatsapp": false}'
```

### 2. Test WhatsApp
```bash
# Test WhatsApp service
curl -X POST http://localhost:3000/api/admin/orders/ORDER_ID/notify \
  -H "Content-Type: application/json" \
  -d '{"trackingNumber": "TEST123", "sendEmail": false, "sendWhatsapp": true}'
```

## 🛠️ Customization

### 1. Email Templates
- Edit `lib/services/email-service.ts`
- Modify HTML templates
- Add your branding colors
- Customize email content

### 2. WhatsApp Messages
- Edit `lib/services/whatsapp-service.ts`
- Modify message templates
- Add emojis and formatting
- Customize message content

### 3. Tracking Providers
- Update tracking URL format
- Add new carriers
- Integrate with shipping APIs
- Add real-time tracking

## 🚨 Troubleshooting

### Email Issues
- Check app password is correct
- Verify 2FA is enabled
- Check Gmail security settings
- Test with different email providers

### WhatsApp Issues
- Verify access token is valid
- Check phone number ID
- Ensure WhatsApp Business API is approved
- Test with WhatsApp Business Manager

### General Issues
- Check environment variables
- Verify database connection
- Check API endpoints
- Review error logs

## 📞 Support

If you need help setting up notifications:

1. Check the error logs in your terminal
2. Verify all environment variables are set
3. Test with a simple email first
4. Contact support if issues persist

## 🎉 Success!

Once set up, you'll be able to:
- ✅ Send beautiful order confirmations
- ✅ Notify customers when orders ship
- ✅ Provide tracking information
- ✅ Keep customers updated via email and WhatsApp
- ✅ Manage all notifications from admin panel

Your customers will love the professional communication! 🌹✨
