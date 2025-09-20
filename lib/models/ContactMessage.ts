import mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  user?: mongoose.Types.ObjectId;
  adminReply?: string;
  replyDate?: Date;
  status: 'new' | 'read' | 'replied';
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminReply: {
    type: String,
    trim: true,
    maxlength: [2000, 'Admin reply cannot exceed 2000 characters']
  },
  replyDate: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['new', 'read', 'replied'],
    default: 'new'
  }
}, {
  timestamps: true
});

// Index for better query performance
ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ user: 1 });
ContactMessageSchema.index({ email: 1 });

export default mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
