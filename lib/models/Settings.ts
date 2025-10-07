import mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  currency: string;
  taxRate: string;
  shippingFee: string;
  freeShippingThreshold: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
  newUserRegistration: boolean;
  guestCheckout: boolean;
  productReviews: boolean;
  blogComments: boolean;
  socialLogin: boolean;
  twoFactorAuth: boolean;
  apiKey?: string;
  webhookUrl?: string;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  maxFileSize: string;
  allowedFileTypes: string;
  createdAt: Date;
  updatedAt: Date;
  heroImageUrl?: string;
}

const SettingsSchema = new Schema<ISettings>({
  siteName: {
    type: String,
    required: [true, 'Site name is required'],
    trim: true,
    maxlength: [100, 'Site name cannot exceed 100 characters'],
    default: 'ZAU'
  },
  siteDescription: {
    type: String,
    required: [true, 'Site description is required'],
    trim: true,
    maxlength: [500, 'Site description cannot exceed 500 characters'],
    default: 'Luxury Perfume Collection'
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    default: 'contact@zauperfumes.com.pk'
  },
  supportEmail: {
    type: String,
    required: [true, 'Support email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    default: 'support@zauperfumes.com.pk'
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    trim: true,
    maxlength: [10, 'Currency code cannot exceed 10 characters'],
    default: 'PKR'
  },
  taxRate: {
    type: String,
    required: [true, 'Tax rate is required'],
    match: [/^\d+(\.\d+)?$/, 'Tax rate must be a valid number'],
    default: '17.0'
  },
  shippingFee: {
    type: String,
    required: [true, 'Shipping fee is required'],
    match: [/^\d+(\.\d+)?$/, 'Shipping fee must be a valid number'],
    default: '500.00'
  },
  freeShippingThreshold: {
    type: String,
    required: [true, 'Free shipping threshold is required'],
    match: [/^\d+(\.\d+)?$/, 'Free shipping threshold must be a valid number'],
    default: '5000.00'
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  orderNotifications: {
    type: Boolean,
    default: true
  },
  lowStockAlerts: {
    type: Boolean,
    default: true
  },
  newUserRegistration: {
    type: Boolean,
    default: true
  },
  guestCheckout: {
    type: Boolean,
    default: true
  },
  productReviews: {
    type: Boolean,
    default: true
  },
  blogComments: {
    type: Boolean,
    default: false
  },
  socialLogin: {
    type: Boolean,
    default: true
  },
  twoFactorAuth: {
    type: Boolean,
    default: false
  },
  apiKey: {
    type: String,
    trim: true
  },
  webhookUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty string
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Webhook URL must be a valid URL'
    }
  },
  backupFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  maxFileSize: {
    type: String,
    required: [true, 'Max file size is required'],
    match: [/^\d+$/, 'Max file size must be a valid number'],
    default: '10'
  },
  allowedFileTypes: {
    type: String,
    required: [true, 'Allowed file types are required'],
    trim: true,
    default: 'jpg,png,webp,pdf'
  }
  ,
  heroImageUrl: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
SettingsSchema.index({}, { unique: true });

const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
