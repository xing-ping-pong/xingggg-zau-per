import mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount: number;
  discountEndDate?: Date;
  imageUrl: string;
  images?: string[];
  category: mongoose.Types.ObjectId;
  stockQuantity: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  fragranceNotes?: {
    top?: string[];
    middle?: string[];
    base?: string[];
  };
  features?: string[];
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  discountEndDate: {
    type: Date,
    default: null
  },
  imageUrl: {
    type: String,
    required: [true, 'Product image is required']
  },
  images: [{
    type: String
  }],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  fragranceNotes: {
    top: [{ type: String, trim: true }],
    middle: [{ type: String, trim: true }],
    base: [{ type: String, trim: true }],
  },
  features: [{ type: String, trim: true }]
}, {
  timestamps: true
});

// Generate SKU if not provided
ProductSchema.pre('save', function(next) {
  if (!this.sku && this.name) {
    const timestamp = Date.now().toString().slice(-6);
    const nameSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 6);
    this.sku = `${nameSlug}-${timestamp}`;
  }
  next();
});

// Index for better search performance
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
