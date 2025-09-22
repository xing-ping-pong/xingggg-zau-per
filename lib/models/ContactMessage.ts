import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: mongoose.Types.ObjectId; // Admin user who is handling this message
  reply?: string;
  repliedAt?: Date;
  repliedBy?: mongoose.Types.ObjectId; // Admin user who replied
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'order', 'product', 'shipping', 'return', 'wholesale', 'other'],
    default: 'general'
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reply: {
    type: String,
    trim: true
  },
  repliedAt: {
    type: Date
  },
  repliedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ category: 1 });
ContactMessageSchema.index({ priority: 1 });
ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ email: 1 });

// Auto-set priority based on category
ContactMessageSchema.pre('save', function(next) {
  if (this.isNew) {
    switch (this.category) {
      case 'order':
      case 'shipping':
        this.priority = 'high';
        break;
      case 'return':
        this.priority = 'medium';
        break;
      case 'wholesale':
        this.priority = 'high';
        break;
      default:
        this.priority = 'medium';
    }
  }
  next();
});

const ContactMessage = mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
export default ContactMessage;