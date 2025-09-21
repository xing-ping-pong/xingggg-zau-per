import mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface IGuestUser extends Document {
  ipAddress: string;
  userAgent?: string;
  lastActive: Date;
  cartItems: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
  }>;
  wishlistItems: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const GuestUserSchema = new Schema<IGuestUser>({
  ipAddress: {
    type: String,
    required: true,
    unique: true
  },
  userAgent: {
    type: String,
    required: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  cartItems: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }],
  wishlistItems: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Index for better performance
GuestUserSchema.index({ ipAddress: 1 });
GuestUserSchema.index({ lastActive: 1 });

// Auto-update lastActive on save
GuestUserSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

export default mongoose.models.GuestUser || mongoose.model<IGuestUser>('GuestUser', GuestUserSchema);
