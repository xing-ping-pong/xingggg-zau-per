import mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  images?: string[];
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  views: number;
  likes: number;
  likesBy: mongoose.Types.ObjectId[];
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Blog slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    trim: true
  },
  excerpt: {
    type: String,
    required: [true, 'Blog excerpt is required'],
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  featuredImage: {
    type: String,
    required: [true, 'Featured image is required']
  },
  images: [{
    type: String
  }],
  author: {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Author email is required'],
      trim: true,
      lowercase: true
    },
    avatar: {
      type: String,
      trim: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: [true, 'Blog category is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  likesBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
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
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate slug from title
BlogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Set publishedAt when status changes to published
BlogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Indexes for better performance
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ category: 1, status: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ featured: 1, status: 1 });
BlogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
