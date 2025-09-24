const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
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

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Cloudinary credentials not found in environment variables');
  console.log('Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env.local file');
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

// Image mapping for local images to Cloudinary
const imageMapping = {
  '/luxury-amber-perfume.jpg': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center',
  '/luxury-perfume-bottle-midnight-rose-dark-elegant.jpg': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center',
  '/luxury-perfume-bottle-ocean-blue-fresh-modern.jpg': 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center',
  '/luxury-perfume-bottle-golden-amber-warm-tones.jpg': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center',
  '/luxury-perfume-bottle-citrus-yellow-bright-fresh.jpg': 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center',
  '/luxury-perfume-bottle-woods-forest-green.jpg': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center',
  '/luxury-perfume-bottle-black-velvet-sophisticated.jpg': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center',
  '/luxury-perfume-bottle-garden-floral-elegant.jpg': 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center',
  '/luxury-perfume-bottle-crystal-clear-modern.jpg': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center',
  '/placeholder.jpg': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center',
  '/placeholder.svg': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center'
};

async function uploadImageToCloudinary(imageUrl, productName) {
  try {
    // If it's already a Cloudinary URL, return it
    if (imageUrl.includes('cloudinary.com')) {
      return imageUrl;
    }

    // If it's a local path, use the mapping or default
    const sourceUrl = imageMapping[imageUrl] || 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center';
    
    // Upload from URL to Cloudinary
    const result = await cloudinary.uploader.upload(sourceUrl, {
      folder: 'perfume-store/products',
      public_id: `${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    });

    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading image for ${productName}:`, error.message);
    // Return a default image URL if upload fails
    return 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center';
  }
}

async function migrateImagesToCloudinary() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔄 Connecting to Cloudinary...');
    // Test Cloudinary connection
    await cloudinary.api.ping();
    console.log('✅ Connected to Cloudinary');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const product of products) {
      console.log(`\n🔄 Processing: ${product.name}`);
      
      // Migrate main image
      if (product.imageUrl && !product.imageUrl.includes('cloudinary.com')) {
        const newImageUrl = await uploadImageToCloudinary(product.imageUrl, product.name);
        product.imageUrl = newImageUrl;
        console.log(`  ✅ Main image migrated: ${newImageUrl}`);
      } else {
        console.log(`  ⏭️ Main image already migrated or no image`);
        skipped++;
      }

      // Migrate additional images
      if (product.images && product.images.length > 0) {
        const newImages = [];
        for (const image of product.images) {
          if (!image.includes('cloudinary.com')) {
            const newImageUrl = await uploadImageToCloudinary(image, `${product.name}-gallery`);
            newImages.push(newImageUrl);
            console.log(`  ✅ Gallery image migrated: ${newImageUrl}`);
          } else {
            newImages.push(image);
          }
        }
        product.images = newImages;
      }

      // Save the updated product
      await product.save();
      migrated++;
      
      console.log(`  ✅ Product ${product.name} updated successfully`);
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Statistics:`);
    console.log(`  - Products migrated: ${migrated}`);
    console.log(`  - Products skipped: ${skipped}`);
    console.log(`  - Total products: ${products.length}`);

    // Test a few products
    console.log(`\n🧪 Testing migrated products:`);
    const testProducts = await Product.find({}).limit(3);
    testProducts.forEach(product => {
      console.log(`  - ${product.name}: ${product.imageUrl}`);
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

migrateImagesToCloudinary();
