import mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }]
}, {
  timestamps: true
});

// Index for better performance - removed duplicate index

export default mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);