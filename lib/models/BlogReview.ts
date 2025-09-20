import mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface IBlogReview extends Document {
  blog: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId; // Optional for guest reviews
  name: string;
  email: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  helpfulBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogReviewSchema = new Schema<IBlogReview>({
  blog: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: [true, 'Blog reference is required']
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
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },
  helpfulBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes for better performance
BlogReviewSchema.index({ blog: 1, status: 1 });
BlogReviewSchema.index({ user: 1 });
BlogReviewSchema.index({ rating: 1 });
BlogReviewSchema.index({ createdAt: -1 });

// Note: Removed unique index temporarily to fix guest review issues
// TODO: Re-implement proper duplicate prevention for logged-in users only

export default mongoose.models.BlogReview || mongoose.model<IBlogReview>('BlogReview', BlogReviewSchema);
