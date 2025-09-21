import mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  blog: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId; // Optional for guest comments
  name: string;
  email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  parent?: mongoose.Types.ObjectId; // For nested comments/replies
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  blog: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: [true, 'Blog reference is required']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest comments
  },
  name: {
    type: String,
    required: [true, 'Commenter name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Commenter email is required'],
    trim: true,
    lowercase: true,
    maxlength: [255, 'Email cannot exceed 255 characters']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Auto-approve for now, can be changed to 'pending' for moderation
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: false // For nested comments/replies
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes for better performance
CommentSchema.index({ blog: 1, status: 1 });
CommentSchema.index({ user: 1 });
CommentSchema.index({ parent: 1 });
CommentSchema.index({ createdAt: -1 });
CommentSchema.index({ likes: -1 });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
