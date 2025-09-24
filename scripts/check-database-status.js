const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models
const { Product, Order, Category } = require('../lib/models');

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Checking database status...\n');
    
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      return;
    }
    
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    console.log('');
    
    // Check Products collection
    console.log('🛍️  Products Collection:');
    const productCount = await Product.countDocuments();
    console.log(`  Total products: ${productCount}`);
    
    if (productCount > 0) {
      const sampleProducts = await Product.find().limit(3).select('_id name price stockQuantity');
      console.log('  Sample products:');
      sampleProducts.forEach(product => {
        console.log(`    - ${product._id}: ${product.name} (Stock: ${product.stockQuantity})`);
      });
    }
    console.log('');
    
    // Check Categories collection
    console.log('📂 Categories Collection:');
    const categoryCount = await Category.countDocuments();
    console.log(`  Total categories: ${categoryCount}`);
    
    if (categoryCount > 0) {
      const sampleCategories = await Category.find().limit(3).select('_id name');
      console.log('  Sample categories:');
      sampleCategories.forEach(category => {
        console.log(`    - ${category._id}: ${category.name}`);
      });
    }
    console.log('');
    
    // Check Orders collection
    console.log('📦 Orders Collection:');
    const orderCount = await Order.countDocuments();
    console.log(`  Total orders: ${orderCount}`);
    console.log('');
    
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
        } else {
          console.log(`  ❌ ${id}: Not found`);
        }
      } catch (error) {
        console.log(`  ❌ ${id}: Invalid ObjectId format`);
      }
    }
    console.log('');
    
    // Check for products with missing images
    console.log('🖼️  Checking products with missing images:');
    const productsWithImages = await Product.find({ imageUrl: { $exists: true, $ne: null, $ne: '' } });
    const productsWithoutImages = await Product.find({ 
      $or: [
        { imageUrl: { $exists: false } },
        { imageUrl: null },
        { imageUrl: '' }
      ]
    });
    
    console.log(`  Products with images: ${productsWithImages.length}`);
    console.log(`  Products without images: ${productsWithoutImages.length}`);
    
    if (productsWithoutImages.length > 0) {
      console.log('  Products missing images:');
      productsWithoutImages.forEach(product => {
        console.log(`    - ${product._id}: ${product.name}`);
      });
    }
    console.log('');
    
    // Check database indexes
    console.log('📊 Database Indexes:');
    const productIndexes = await Product.collection.getIndexes();
    console.log('  Product indexes:', Object.keys(productIndexes));
    
    const orderIndexes = await Order.collection.getIndexes();
    console.log('  Order indexes:', Object.keys(orderIndexes));
    console.log('');
    
    console.log('✅ Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkDatabaseStatus();
