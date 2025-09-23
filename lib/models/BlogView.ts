import mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface IBlogView extends Document {
  blog: mongoose.Types.ObjectId;
  ipAddress: string;
  userAgent?: string;
  viewedAt: Date;
}

const BlogViewSchema = new Schema<IBlogView>({
  blog: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: [true, 'Blog reference is required'],
    index: true
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
    trim: true,
    index: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  viewedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique views per blog per IP
BlogViewSchema.index({ blog: 1, ipAddress: 1 }, { unique: true });

// Cleanup old views (older than 30 days) - this can be run periodically
BlogViewSchema.statics.cleanupOldViews = async function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.deleteMany({ viewedAt: { $lt: thirtyDaysAgo } });
};

const BlogView = mongoose.models.BlogView || mongoose.model<IBlogView>('BlogView', BlogViewSchema);

export default BlogView;
