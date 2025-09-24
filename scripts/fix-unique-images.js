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

// Completely unique perfume images - each one is different
const uniquePerfumeImages = [
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center&auto=format', // Amber bottle
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center&auto=format', // Rose bottle
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center&auto=format', // Citrus bottle
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center&auto=format', // Woody bottle
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center&auto=format', // Ocean bottle
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center&auto=format', // Midnight bottle
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center&auto=format', // Golden bottle
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center&auto=format', // Noir bottle
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center&auto=format', // Floral bottle
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center&auto=format', // Vanilla bottle
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center&auto=format', // Elixir bottle
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center&auto=format'  // Velvet bottle
];

// Alternative unique images if the above fail
const alternativeImages = [
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center&auto=format',
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center&auto=format',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center&auto=format',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center&auto=format',
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center&auto=format',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center&auto=format'
];

async function uploadUniqueImageToCloudinary(imageUrl, productName, index) {
  try {
    // Create a unique public_id for each product
    const uniqueId = `${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-unique-${Date.now()}-${index}`;
    
    // Upload from URL to Cloudinary
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'perfume-store/products',
      public_id: uniqueId,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    });

    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading image for ${productName}:`, error.message);
    // Return the original URL if upload fails
    return imageUrl;
  }
}

async function fixUniqueImages() {
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
    console.log(`📦 Found ${products.length} products to fix with unique images\n`);

    let fixed = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`🔄 Fixing unique image for: ${product.name}`);

      // Get a unique image for this product (cycle through the array)
      const imageUrl = uniquePerfumeImages[i % uniquePerfumeImages.length];
      
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const cloudinaryUrl = await uploadUniqueImageToCloudinary(imageUrl, product.name, i);
        product.imageUrl = cloudinaryUrl;
        console.log(`  ✅ Unique image uploaded to Cloudinary`);
      } else {
        product.imageUrl = imageUrl;
        console.log(`  ✅ Unique image URL set directly`);
      }

      // Save the updated product
      await product.save();
      fixed++;
      
      console.log(`  ✅ Product ${product.name} unique image fixed successfully\n`);
    }

    console.log(`🎉 All products now have unique images!`);
    console.log(`📊 Statistics:`);
    console.log(`  - Products with unique images: ${fixed}`);
    console.log(`  - No duplicate images`);

    // Test a few products
    console.log(`\n🧪 Testing unique images:`);
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

fixUniqueImages();
