# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image storage and fix your product images.

## 🚀 Quick Setup

### 1. Create Cloudinary Account
1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Go to your [Dashboard](https://cloudinary.com/console)

### 2. Get Your Credentials
From your Cloudinary dashboard, copy:
- **Cloud Name**
- **API Key** 
- **API Secret**

### 3. Add to Environment Variables
Add these to your `.env.local` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Run Image Migration
```bash
npm run migrate:images
```

This will:
- Upload all your product images to Cloudinary
- Update your database with new Cloudinary URLs
- Fix broken image links

## 📋 What Gets Fixed

### ✅ **Image Issues Resolved:**
- ❌ Broken local image paths (`/luxury-amber-perfume.jpg`)
- ✅ Working Cloudinary URLs (`https://res.cloudinary.com/...`)
- ❌ Missing featured product images
- ✅ All images optimized and CDN-delivered

### ✅ **CRUD Operations Fixed:**
- ✅ Product creation with image upload
- ✅ Product editing with image updates
- ✅ Image deletion from Cloudinary
- ✅ Multiple image support

## 🛠️ Features Added

### **Image Upload API**
- **Endpoint:** `/api/upload`
- **Method:** POST
- **Authentication:** Admin required
- **File Types:** JPEG, PNG, WebP
- **Max Size:** 10MB

### **Image Optimization**
- Automatic format conversion (WebP)
- Quality optimization
- Responsive image sizes
- CDN delivery

### **Admin Features**
- Drag & drop image upload
- Image preview
- Multiple image support
- Image deletion

## 🔧 Manual Setup (if needed)

### **Step 1: Install Dependencies**
```bash
npm install cloudinary multer
```

### **Step 2: Configure Cloudinary**
The configuration is already set up in `lib/cloudinary.ts`

### **Step 3: Update Admin Forms**
The admin forms will automatically use the new upload system.

## 📊 Migration Process

The migration script will:

1. **Connect to MongoDB** and Cloudinary
2. **Find all products** with local image paths
3. **Upload images** to Cloudinary with proper naming
4. **Update database** with new Cloudinary URLs
5. **Verify migration** success

### **Sample Migration Output:**
```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB
🔄 Connecting to Cloudinary...
✅ Connected to Cloudinary
📦 Found 12 products to migrate

🔄 Processing: Ambre Nut 2.0
  ✅ Main image migrated: https://res.cloudinary.com/your-cloud/image/upload/v1234567890/perfume-store/products/ambre-nut-2-0-1234567890.jpg
  ✅ Product Ambre Nut 2.0 updated successfully

🎉 Migration completed!
📊 Statistics:
  - Products migrated: 12
  - Products skipped: 0
  - Total products: 12
```

## 🎯 Benefits

### **Performance:**
- ⚡ **Faster loading** - CDN delivery
- 🖼️ **Optimized images** - Auto WebP conversion
- 📱 **Responsive** - Multiple sizes available

### **Reliability:**
- 🔒 **Secure storage** - Professional cloud storage
- 🔄 **Backup** - Automatic backups
- 🌐 **Global CDN** - Fast worldwide delivery

### **Management:**
- 🎛️ **Easy uploads** - Drag & drop interface
- 🗑️ **Easy deletion** - Automatic cleanup
- 📊 **Analytics** - Usage statistics

## 🚨 Troubleshooting

### **Common Issues:**

#### 1. **"Cloudinary credentials not found"**
**Solution:** Make sure you've added the credentials to `.env.local`

#### 2. **"Failed to upload image"**
**Solution:** Check your Cloudinary account limits and API key permissions

#### 3. **"Images still not showing"**
**Solution:** Clear your browser cache and redeploy your Vercel app

### **Verification:**
After migration, check:
1. **Admin panel** - Can you upload new images?
2. **Product pages** - Are images loading?
3. **Featured products** - Are they showing correctly?

## 🎉 Post-Migration

After successful migration:

1. **Test image uploads** in admin panel
2. **Verify all products** show images correctly
3. **Check featured products** are displaying
4. **Test CRUD operations** work properly

Your luxury perfume store will now have:
- ✅ Working product images
- ✅ Featured products displaying
- ✅ Full CRUD functionality
- ✅ Professional image management

---

**Need help?** Check the migration logs for specific error messages and ensure your Cloudinary credentials are correct.
