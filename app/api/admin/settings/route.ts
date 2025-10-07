import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';
import { z } from 'zod';
import Settings from '@/lib/models/Settings';

const settingsSchema = z.object({
  siteName: z.string().min(1).max(100),
  siteDescription: z.string().min(1).max(500),
  contactEmail: z.string().email(),
  supportEmail: z.string().email(),
  currency: z.string().min(1).max(10),
  taxRate: z.string().regex(/^\d+(\.\d+)?$/),
  shippingFee: z.string().regex(/^\d+(\.\d+)?$/),
  freeShippingThreshold: z.string().regex(/^\d+(\.\d+)?$/),
  maintenanceMode: z.boolean(),
  emailNotifications: z.boolean(),
  orderNotifications: z.boolean(),
  lowStockAlerts: z.boolean(),
  newUserRegistration: z.boolean(),
  guestCheckout: z.boolean(),
  productReviews: z.boolean(),
  blogComments: z.boolean(),
  socialLogin: z.boolean(),
  twoFactorAuth: z.boolean(),
  apiKey: z.string().optional(),
  webhookUrl: z.string().url().optional().or(z.literal('')),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']),
  maxFileSize: z.string().regex(/^\d+$/),
  allowedFileTypes: z.string(),
  heroImageUrl: z.string().url().optional().or(z.literal('')),
});
// POST /api/admin/settings/hero-image - Upload hero image to Cloudinary
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await authenticateUser(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Expect multipart/form-data with image file
    const formData = await req.formData();
    const file = formData.get('image');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, message: 'No image file provided' }, { status: 400 });
    }

    // Upload to Cloudinary
    const imageUrl = await uploadImage(file, 'hero-images');

    // Save URL to settings
    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { heroImageUrl: imageUrl },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, imageUrl, data: updatedSettings });
  } catch (error) {
    console.error('Error uploading hero image:', error);
    return NextResponse.json({ success: false, message: 'Failed to upload hero image' }, { status: 500 });
  }
}

// GET /api/admin/settings - Get current settings
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Fetch settings from database or create default if none exist
    let settings = await Settings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({
        siteName: "ZAU",
        siteDescription: "Luxury Perfume Collection",
        contactEmail: "contact@zauperfumes.com.pk",
        supportEmail: "support@zauperfumes.com.pk",
        currency: "PKR",
        taxRate: "17.0",
        shippingFee: "500.00",
        freeShippingThreshold: "5000.00",
        maintenanceMode: false,
        emailNotifications: true,
        orderNotifications: true,
        lowStockAlerts: true,
        newUserRegistration: true,
        guestCheckout: true,
        productReviews: true,
        blogComments: false,
        socialLogin: true,
        twoFactorAuth: false,
        apiKey: "sk_live_51234567890abcdef",
        webhookUrl: "https://zauperfumes.com.pk/api/webhooks",
        backupFrequency: "daily",
        maxFileSize: "10",
        allowedFileTypes: "jpg,png,webp,pdf",
      });
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update settings
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate admin user
    const user = await authenticateUser(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate settings data
    const validatedSettings = settingsSchema.parse(body);

    // Save settings to database
    const updatedSettings = await Settings.findOneAndUpdate(
      {}, // Find any settings document (there should only be one)
      validatedSettings,
      { 
        new: true, // Return updated document
        upsert: true, // Create if doesn't exist
        runValidators: true // Run schema validations
      }
    );

    console.log('Settings updated:', updatedSettings);

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid settings data',
          errors: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
