import mongoose, { Document, Schema } from 'mongoose'

export interface IPage extends Document {
  slug: string
  title: string
  content: string
  metaTitle?: string
  metaDescription?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PageSchema = new Schema<IPage>({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index for faster queries
PageSchema.index({ slug: 1, isActive: 1 })

export default mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema)
