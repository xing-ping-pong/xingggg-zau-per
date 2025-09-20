import mongoose, { Schema, Document } from 'mongoose'

export interface ICoupon extends Document {
  code: string
  description: string
  discountPercentage: number
  discountAmount?: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  usageLimit?: number
  usedCount: number
  isActive: boolean
  expiryDate?: Date
  createdAt: Date
  updatedAt: Date
}

const CouponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  discountAmount: {
    type: Number,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    min: 0
  },
  maxDiscountAmount: {
    type: Number,
    min: 0
  },
  usageLimit: {
    type: Number,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date
  }
}, {
  timestamps: true
})

// Index for efficient queries
CouponSchema.index({ code: 1, isActive: 1 })
CouponSchema.index({ expiryDate: 1 })

const Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema)
export default Coupon
