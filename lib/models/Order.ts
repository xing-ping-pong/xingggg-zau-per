import mongoose, { Schema, Document } from 'mongoose'

export interface IOrder extends Document {
  orderNumber: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'on_hold'
  guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    zipCode: string
    country: string
  }
  items: Array<{
    productId: string
    productName: string
    productImage: string
    quantity: number
    price: number
    discount: number
    totalPrice: number
  }>
  pricing: {
    subtotal: number
    shipping: number
    tax: number
    couponDiscount?: number
    couponCode?: string
    total: number
  }
  paymentMethod: 'cash_on_delivery'
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  notes?: string
  deliveryRemarks?: string
  estimatedDelivery?: Date
  deliveredAt?: Date
  cancelledAt?: Date
  cancellationReason?: string
  notifications: {
    emailSent: boolean
    whatsappSent: boolean
    emailSentAt?: Date
    whatsappSentAt?: Date
    trackingEmailSent: boolean
    trackingWhatsappSent: boolean
    trackingEmailSentAt?: Date
    trackingWhatsappSentAt?: Date
  }
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'on_hold'],
    default: 'pending'
  },
  guestInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
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
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    }
  },
  items: [{
    productId: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productImage: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shipping: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      required: true,
      min: 0
    },
    couponDiscount: {
      type: Number,
      default: 0,
      min: 0
    },
    couponCode: {
      type: String,
      trim: true
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery'],
    default: 'cash_on_delivery'
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  trackingUrl: {
    type: String,
    trim: true
  },
  carrier: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  deliveryRemarks: {
    type: String,
    trim: true
  },
  estimatedDelivery: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  notifications: {
    emailSent: {
      type: Boolean,
      default: false
    },
    whatsappSent: {
      type: Boolean,
      default: false
    },
    emailSentAt: {
      type: Date
    },
    whatsappSentAt: {
      type: Date
    },
    trackingEmailSent: {
      type: Boolean,
      default: false
    },
    trackingWhatsappSent: {
      type: Boolean,
      default: false
    },
    trackingEmailSentAt: {
      type: Date
    },
    trackingWhatsappSentAt: {
      type: Date
    }
  }
}, {
  timestamps: true
})

// Indexes for efficient queries (orderNumber and trackingNumber already have unique indexes)
OrderSchema.index({ 'guestInfo.email': 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ createdAt: -1 })

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Always generate a new order number for new orders
      const count = await mongoose.model('Order').countDocuments()
      this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`
    } catch (error) {
      // Fallback to timestamp-based order number
      this.orderNumber = `ORD-${Date.now().toString().slice(-6)}`
    }
  }
  next()
})

// Generate tracking number when status changes to 'shipped'
OrderSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'shipped' && !this.trackingNumber) {
    const count = await mongoose.model('Order').countDocuments({ status: 'shipped' })
    this.trackingNumber = `TRK-${String(count + 1).padStart(8, '0')}`
  }
  next()
})

const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
export default Order