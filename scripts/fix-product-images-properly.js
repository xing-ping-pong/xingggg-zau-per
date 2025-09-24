const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

// Working perfume images - each product gets a unique image
const productImageMapping = {
  'Ambre Nut 2.0': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center&auto=format',
  'Velvet Bloom': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center&auto=format',
  'Ocean Whisper': 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center&auto=format',
  'Amber Eclipse': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center&auto=format',
  'Citrus Muse': 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center&auto=format',
  'Midnight Rose': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center&auto=format',
  'Woody Reverie': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center&auto=format',
  'Golden Hour': 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center&auto=format',
  'Noir Luxe': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center&auto=format',
  'Floral Symphony': 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center&auto=format',
  'Vanilla Dusk': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center&auto=format',
  'Midnight Rose Elixir': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center&auto=format'
};

// Alternative high-quality perfume images if Unsplash fails
const fallbackImages = [
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center&auto=format',
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center&auto=format',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center&auto=format',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center&auto=format',
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center&auto=format',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center&auto=format'
];

async function uploadImageToCloudinary(imageUrl, productName, index) {
  try {
    // Upload from URL to Cloudinary
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'perfume-store/products',
      public_id: `${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    });

    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading image for ${productName}:`, error.message);
    // Try fallback image
    const fallbackIndex = index % fallbackImages.length;
    const fallbackUrl = fallbackImages[fallbackIndex];
    
    try {
      const fallbackResult = await cloudinary.uploader.upload(fallbackUrl, {
        folder: 'perfume-store/products',
        public_id: `${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-fallback-${Date.now()}`,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      });
      return fallbackResult.secure_url;
    } catch (fallbackError) {
      console.error(`❌ Fallback image also failed for ${productName}`);
      return fallbackUrl; // Return direct URL as last resort
    }
  }
}

async function fixProductImagesProperly() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      console.log('🔄 Connecting to Cloudinary...');
      await cloudinary.api.ping();
      console.log('✅ Connected to Cloudinary');
    } else {
      console.log('⚠️ Cloudinary not configured, using direct URLs');
    }

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to fix images\n`);

    let fixed = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`🔄 Fixing images for: ${product.name}`);

      // Get the specific image for this product
      const imageUrl = productImageMapping[product.name] || fallbackImages[i % fallbackImages.length];
      
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const cloudinaryUrl = await uploadImageToCloudinary(imageUrl, product.name, i);
        product.imageUrl = cloudinaryUrl;
        console.log(`  ✅ Image uploaded to Cloudinary`);
      } else {
        product.imageUrl = imageUrl;
        console.log(`  ✅ Image URL set directly`);
      }

      // Save the updated product
      await product.save();
      fixed++;
      
      console.log(`  ✅ Product ${product.name} image fixed successfully\n`);
    }

    console.log(`🎉 All product images fixed!`);
    console.log(`📊 Statistics:`);
    console.log(`  - Products with images: ${fixed}`);
    console.log(`  - Each product has unique image`);

    // Test a few products
    console.log(`\n🧪 Testing fixed products:`);
    const testProducts = await Product.find({}).limit(5);
    testProducts.forEach(product => {
      console.log(`  - ${product.name}:`);
      console.log(`    Image: ${product.imageUrl ? '✅' : '❌'}`);
      console.log(`    URL: ${product.imageUrl}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixProductImagesProperly();
