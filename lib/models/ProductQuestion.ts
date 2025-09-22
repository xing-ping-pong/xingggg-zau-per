import mongoose from 'mongoose';

const ProductQuestionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  answer: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  answeredAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'rejected'],
    default: 'pending'
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
ProductQuestionSchema.index({ product: 1, status: 1, createdAt: -1 });
ProductQuestionSchema.index({ email: 1 });

const ProductQuestion = mongoose.models.ProductQuestion || mongoose.model('ProductQuestion', ProductQuestionSchema);

export default ProductQuestion;
