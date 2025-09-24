const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models using the same approach as other scripts
const Product = require('../lib/models/Product').default;

async function checkSpecificProducts() {
  try {
    console.log('🔍 Checking specific products mentioned in error...\n');
    
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      return;
    }
    
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');
    
    // Check for specific product IDs mentioned in the error
    const problematicIds = [
      '68cff80a9e92b25d0eb13924',
      '68ce868656aa64bc967c5903'
    ];
    
    console.log('🔍 Checking problematic product IDs:');
    for (const id of problematicIds) {
      try {
        const product = await Product.findById(id);
        if (product) {
          console.log(`  ✅ ${id}: Found - ${product.name}`);
          console.log(`     - Price: $${product.price}`);
          console.log(`     - Stock: ${product.stockQuantity}`);
          console.log(`     - Image: ${product.imageUrl}`);
          console.log(`     - Active: ${product.isActive}`);
        } else {
          console.log(`  ❌ ${id}: Not found`);
        }
      } catch (error) {
        console.log(`  ❌ ${id}: Invalid ObjectId format - ${error.message}`);
      }
    }
    console.log('');
    
    // Get all product IDs for comparison
    console.log('📋 All available product IDs:');
    const allProducts = await Product.find().select('_id name');
    allProducts.forEach(product => {
      console.log(`  - ${product._id}: ${product.name}`);
    });
    console.log('');
    
    // Check if there are any products with missing or broken image URLs
    console.log('🖼️  Checking for image issues:');
    const productsWithCloudinaryImages = await Product.find({
      imageUrl: { $regex: /cloudinary\.com/ }
    });
    
    console.log(`Products with Cloudinary images: ${productsWithCloudinaryImages.length}`);
    productsWithCloudinaryImages.forEach(product => {
      console.log(`  - ${product._id}: ${product.name}`);
      console.log(`    Image: ${product.imageUrl}`);
    });
    
    console.log('\n✅ Product check completed!');
    
  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkSpecificProducts();
