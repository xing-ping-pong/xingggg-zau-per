const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Old database connection string (you'll need to update the password)
const OLD_DB_URI = 'mongodb+srv://alimahesar04_db_user:3sGVbHa8F6Jb3k5e@cluster0.pajnty3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Current database connection
const CURRENT_DB_URI = process.env.MONGODB_URI;

async function analyzeOldDatabase() {
  try {
    console.log('🔍 Analyzing old database...\n');
    
    // Connect to old database
    console.log('📡 Connecting to OLD database...');
    const oldConnection = await mongoose.createConnection(OLD_DB_URI);
    console.log('✅ Connected to OLD database successfully\n');
    
    // Connect to current database
    console.log('📡 Connecting to CURRENT database...');
    const currentConnection = await mongoose.createConnection(CURRENT_DB_URI);
    console.log('✅ Connected to CURRENT database successfully\n');
    
    // Get collections from both databases
    const oldDb = oldConnection.db;
    const currentDb = currentConnection.db;
    
    console.log('📋 OLD Database Collections:');
    const oldCollections = await oldDb.listCollections().toArray();
    oldCollections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    console.log('');
    
    console.log('📋 CURRENT Database Collections:');
    const currentCollections = await currentDb.listCollections().toArray();
    currentCollections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    console.log('');
    
    // Check Products collection in old database
    console.log('🛍️  OLD Database Products:');
    const oldProducts = await oldDb.collection('products').find({}).toArray();
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
        const product = await oldDb.collection('products').findOne({ _id: new mongoose.Types.ObjectId(id) });
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
    
    // Check Orders collection
    console.log('📦 OLD Database Orders:');
    const oldOrders = await oldDb.collection('orders').find({}).toArray();
    console.log(`  Total orders: ${oldOrders.length}`);
    console.log('');
    
    // Check Categories collection
    console.log('📂 OLD Database Categories:');
    const oldCategories = await oldDb.collection('categories').find({}).toArray();
    console.log(`  Total categories: ${oldCategories.length}`);
    if (oldCategories.length > 0) {
      oldCategories.forEach(category => {
        console.log(`    - ${category._id}: ${category.name}`);
      });
    }
    console.log('');
    
    // Compare product counts
    const currentProducts = await currentDb.collection('products').find({}).toArray();
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
    }
    
    console.log('\n✅ Analysis completed!');
    
  } catch (error) {
    console.error('❌ Error analyzing databases:', error);
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 TIP: Make sure you have updated the password in the script!');
      console.log('   Update line 6 with your new MongoDB Atlas password.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from databases');
  }
}

// Run the analysis
analyzeOldDatabase();
