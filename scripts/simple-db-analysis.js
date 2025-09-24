const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Old database connection string
const OLD_DB_URI = 'mongodb+srv://alimahesar04_db_user:3sGVbHa8F6Jb3k5e@cluster0.pajnty3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Current database connection
const CURRENT_DB_URI = process.env.MONGODB_URI;

async function analyzeDatabases() {
  let oldConnection, currentConnection;
  
  try {
    console.log('🔍 Analyzing databases...\n');
    
    // Connect to old database
    console.log('📡 Connecting to OLD database...');
    oldConnection = await mongoose.createConnection(OLD_DB_URI);
    await new Promise(resolve => oldConnection.once('open', resolve));
    console.log('✅ Connected to OLD database successfully\n');
    
    // Connect to current database
    console.log('📡 Connecting to CURRENT database...');
    currentConnection = await mongoose.createConnection(CURRENT_DB_URI);
    await new Promise(resolve => currentConnection.once('open', resolve));
    console.log('✅ Connected to CURRENT database successfully\n');
    
    // Check Products collection in old database
    console.log('🛍️  OLD Database Products:');
    const oldProducts = await oldConnection.db.collection('products').find({}).toArray();
    console.log(`  Total products: ${oldProducts.length}`);
    
    if (oldProducts.length > 0) {
      console.log('  Sample products:');
      oldProducts.slice(0, 5).forEach(product => {
        console.log(`    - ${product._id}: ${product.name}`);
        console.log(`      Price: $${product.price}, Stock: ${product.stockQuantity}`);
        console.log(`      Image: ${product.imageUrl}`);
      });
    }
    console.log('');
    
    // Check for the specific problematic product IDs
    const problematicIds = [
      '68cff80a9e92b25d0eb13924',
      '68ce868656aa64bc967c5903'
    ];
    
    console.log('🔍 Checking problematic product IDs in OLD database:');
    for (const id of problematicIds) {
      try {
        const product = await oldConnection.db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (product) {
          console.log(`  ✅ ${id}: Found - ${product.name}`);
          console.log(`     - Price: $${product.price}`);
          console.log(`     - Stock: ${product.stockQuantity}`);
          console.log(`     - Image: ${product.imageUrl}`);
        } else {
          console.log(`  ❌ ${id}: Not found`);
        }
      } catch (error) {
        console.log(`  ❌ ${id}: Invalid ObjectId format`);
      }
    }
    console.log('');
    
    // Check current database products
    console.log('🛍️  CURRENT Database Products:');
    const currentProducts = await currentConnection.db.collection('products').find({}).toArray();
    console.log(`  Total products: ${currentProducts.length}`);
    
    if (currentProducts.length > 0) {
      console.log('  Sample products:');
      currentProducts.slice(0, 5).forEach(product => {
        console.log(`    - ${product._id}: ${product.name}`);
        console.log(`      Price: $${product.price}, Stock: ${product.stockQuantity}`);
        console.log(`      Image: ${product.imageUrl}`);
      });
    }
    console.log('');
    
    // Compare product counts
    console.log('📊 COMPARISON:');
    console.log(`  OLD database products: ${oldProducts.length}`);
    console.log(`  CURRENT database products: ${currentProducts.length}`);
    console.log(`  Missing products: ${oldProducts.length - currentProducts.length}`);
    console.log('');
    
    // Find missing products
    const oldProductIds = oldProducts.map(p => p._id.toString());
    const currentProductIds = currentProducts.map(p => p._id.toString());
    const missingProductIds = oldProductIds.filter(id => !currentProductIds.includes(id));
    
    if (missingProductIds.length > 0) {
      console.log('❌ MISSING PRODUCTS:');
      missingProductIds.forEach(id => {
        const product = oldProducts.find(p => p._id.toString() === id);
        console.log(`  - ${id}: ${product.name}`);
      });
      console.log('');
      
      console.log('💡 SOLUTION:');
      console.log('  These missing products are causing your cart errors.');
      console.log('  You need to either:');
      console.log('  1. Clear your cart and add products again, OR');
      console.log('  2. Restore these missing products to your current database');
    }
    
    // Check Orders collection
    console.log('📦 OLD Database Orders:');
    const oldOrders = await oldConnection.db.collection('orders').find({}).toArray();
    console.log(`  Total orders: ${oldOrders.length}`);
    console.log('');
    
    // Check Categories collection
    console.log('📂 OLD Database Categories:');
    const oldCategories = await oldConnection.db.collection('categories').find({}).toArray();
    console.log(`  Total categories: ${oldCategories.length}`);
    if (oldCategories.length > 0) {
      oldCategories.forEach(category => {
        console.log(`    - ${category._id}: ${category.name}`);
      });
    }
    console.log('');
    
    console.log('✅ Analysis completed!');
    
  } catch (error) {
    console.error('❌ Error analyzing databases:', error);
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 TIP: Make sure you have the correct password in the script!');
    }
  } finally {
    if (oldConnection) {
      await oldConnection.close();
    }
    if (currentConnection) {
      await currentConnection.close();
    }
    console.log('🔌 Disconnected from databases');
  }
}

// Run the analysis
analyzeDatabases();
