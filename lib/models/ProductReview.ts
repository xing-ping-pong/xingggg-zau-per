import mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface IProductReview extends Document {
  product: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId; // Optional for guest reviews
  name: string;
  email: string;
  rating: number;
  title?: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  helpfulBy: mongoose.Types.ObjectId[];
  verified: boolean; // True if user actually purchased the product
  images?: string[]; // Optional review images
  createdAt: Date;
  updatedAt: Date;
}

const ProductReviewSchema = new Schema<IProductReview>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest reviews
  },
  name: {
    type: String,
    required: [true, 'Reviewer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Reviewer email is required'],
    trim: true,
    lowercase: true,
    maxlength: [255, 'Email cannot exceed 255 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Auto-approve for now, can be changed to 'pending' for moderation
  },
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },
  helpfulBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  verified: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

// Indexes for better performance
ProductReviewSchema.index({ product: 1, status: 1 });
ProductReviewSchema.index({ user: 1 });
ProductReviewSchema.index({ rating: 1 });
ProductReviewSchema.index({ createdAt: -1 });
ProductReviewSchema.index({ helpful: -1 });

// Prevent duplicate reviews from same user for same product (only for logged-in users)
ProductReviewSchema.index({ product: 1, user: 1 }, { 
  unique: true, 
  partialFilterExpression: { user: { $exists: true, $ne: null } }
});

export default mongoose.models.ProductReview || mongoose.model<IProductReview>('ProductReview', ProductReviewSchema);
