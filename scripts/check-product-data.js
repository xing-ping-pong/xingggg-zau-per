const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  discount: { type: Number, default: 0 },
  discountEndDate: Date,
  imageUrl: String,
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  stockQuantity: { type: Number, default: 0 },
  sku: String,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  metaTitle: String,
  metaDescription: String
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

async function checkProductData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);

    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - Image URL: ${product.imageUrl || 'NOT SET'}`);
      console.log(`   - Images: ${product.images ? product.images.length : 0} images`);
      console.log(`   - Price: $${product.price || 'NOT SET'}`);
      console.log(`   - Featured: ${product.isFeatured}`);
      console.log(`   - Active: ${product.isActive}`);
      console.log(`   - Stock: ${product.stockQuantity || 0}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

checkProductData();
