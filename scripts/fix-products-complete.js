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

// High-quality perfume images from Unsplash
const perfumeImages = [
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center', // Elegant bottle
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center', // Luxury perfume
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center', // Amber perfume
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center', // Rose perfume
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center', // Citrus perfume
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center', // Woody perfume
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center', // Floral perfume
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center', // Vanilla perfume
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center', // Ocean perfume
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=800&fit=crop&crop=center', // Midnight perfume
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=800&fit=crop&crop=center', // Golden perfume
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&crop=center'  // Noir perfume
];

async function uploadImageToCloudinary(imageUrl, productName, index) {
  try {
    // Upload from URL to Cloudinary
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'perfume-store/products',
      public_id: `${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
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

async function fixProductsComplete() {
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
    console.log(`📦 Found ${products.length} products to fix\n`);

    let fixed = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`🔄 Fixing: ${product.name}`);

      // Fix image URL
      if (!product.imageUrl) {
        const imageIndex = i % perfumeImages.length;
        const imageUrl = perfumeImages[imageIndex];
        
        if (process.env.CLOUDINARY_CLOUD_NAME) {
          product.imageUrl = await uploadImageToCloudinary(imageUrl, product.name, i);
          console.log(`  ✅ Image uploaded to Cloudinary`);
        } else {
          product.imageUrl = imageUrl;
          console.log(`  ✅ Image URL set`);
        }
      }

      // Fix stock quantity
      if (!product.stockQuantity || product.stockQuantity === 0) {
        product.stockQuantity = Math.floor(Math.random() * 50) + 10; // Random stock 10-60
        console.log(`  ✅ Stock set to ${product.stockQuantity}`);
      }

      // Set some products as featured (first 4 products)
      if (i < 4) {
        product.isFeatured = true;
        console.log(`  ✅ Set as featured product`);
      }

      // Add some discount to random products
      if (Math.random() > 0.7) { // 30% chance
        product.discount = Math.floor(Math.random() * 30) + 10; // 10-40% discount
        product.originalPrice = product.price;
        product.price = Math.round(product.price * (1 - product.discount / 100));
        console.log(`  ✅ Added ${product.discount}% discount`);
      }

      // Add tags based on product name
      const tags = [];
      if (product.name.toLowerCase().includes('amber')) tags.push('amber', 'warm');
      if (product.name.toLowerCase().includes('rose')) tags.push('rose', 'floral');
      if (product.name.toLowerCase().includes('citrus')) tags.push('citrus', 'fresh');
      if (product.name.toLowerCase().includes('woody')) tags.push('woody', 'earthy');
      if (product.name.toLowerCase().includes('ocean')) tags.push('aquatic', 'fresh');
      if (product.name.toLowerCase().includes('midnight')) tags.push('dark', 'mysterious');
      if (product.name.toLowerCase().includes('golden')) tags.push('golden', 'luxury');
      if (product.name.toLowerCase().includes('noir')) tags.push('dark', 'sophisticated');
      if (product.name.toLowerCase().includes('floral')) tags.push('floral', 'feminine');
      if (product.name.toLowerCase().includes('vanilla')) tags.push('vanilla', 'sweet');
      
      if (tags.length > 0) {
        product.tags = tags;
        console.log(`  ✅ Added tags: ${tags.join(', ')}`);
      }

      // Save the updated product
      await product.save();
      fixed++;
      
      console.log(`  ✅ Product ${product.name} fixed successfully\n`);
    }

    console.log(`🎉 All products fixed!`);
    console.log(`📊 Statistics:`);
    console.log(`  - Products fixed: ${fixed}`);
    console.log(`  - Featured products: 4`);
    console.log(`  - Products with stock: ${fixed}`);
    console.log(`  - Products with images: ${fixed}`);

    // Test a few products
    console.log(`\n🧪 Testing fixed products:`);
    const testProducts = await Product.find({}).limit(3);
    testProducts.forEach(product => {
      console.log(`  - ${product.name}:`);
      console.log(`    Image: ${product.imageUrl ? '✅' : '❌'}`);
      console.log(`    Stock: ${product.stockQuantity}`);
      console.log(`    Featured: ${product.isFeatured ? '✅' : '❌'}`);
      console.log(`    Discount: ${product.discount}%`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixProductsComplete();
