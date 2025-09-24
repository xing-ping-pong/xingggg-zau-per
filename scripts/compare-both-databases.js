const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Old database connection string
const OLD_DB_URI = 'mongodb+srv://alimahesar04_db_user:3sGVbHa8F6Jb3k5e@cluster0.pajnty3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Current database connection
const CURRENT_DB_URI = process.env.MONGODB_URI;

async function compareDatabases() {
  let oldConnection, currentConnection;
  
  try {
    console.log('🔍 Comparing OLD vs NEW databases...\n');
    
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
    
    // Compare Products
    console.log('🛍️  COMPARING PRODUCTS:');
    const oldProducts = await oldConnection.db.collection('products').find({}).toArray();
    const currentProducts = await currentConnection.db.collection('products').find({}).toArray();
    
    console.log(`   OLD database: ${oldProducts.length} products`);
    console.log(`   NEW database: ${currentProducts.length} products`);
    console.log('');
    
    // Check the specific problematic products
    const problematicIds = [
      '68cff80a9e92b25d0eb13924', // Midnight Rose Elixir
      '68ce868656aa64bc967c5903'  // Floral Symphony
    ];
    
    console.log('🔍 Checking problematic products in BOTH databases:');
    for (const id of problematicIds) {
      console.log(`\n   Product ID: ${id}`);
      
      // Check in OLD database
      const oldProduct = await oldConnection.db.collection('products').findOne({ 
        _id: new mongoose.Types.ObjectId(id) 
      });
      
      // Check in NEW database
      const newProduct = await currentConnection.db.collection('products').findOne({ 
        _id: new mongoose.Types.ObjectId(id) 
      });
      
      console.log(`   OLD DB: ${oldProduct ? `✅ Found - ${oldProduct.name}` : '❌ Not found'}`);
      console.log(`   NEW DB: ${newProduct ? `✅ Found - ${newProduct.name}` : '❌ Not found'}`);
      
      if (oldProduct && newProduct) {
        console.log('   📊 COMPARISON:');
        console.log(`     Name: OLD="${oldProduct.name}" vs NEW="${newProduct.name}"`);
        console.log(`     Price: OLD=$${oldProduct.price} vs NEW=$${newProduct.price}`);
        console.log(`     Stock: OLD=${oldProduct.stockQuantity} vs NEW=${newProduct.stockQuantity}`);
        console.log(`     Image: OLD="${oldProduct.imageUrl}" vs NEW="${newProduct.imageUrl}"`);
        console.log(`     Active: OLD=${oldProduct.isActive} vs NEW=${newProduct.isActive}`);
        
        // Check if they're identical
        const isIdentical = (
          oldProduct.name === newProduct.name &&
          oldProduct.price === newProduct.price &&
          oldProduct.stockQuantity === newProduct.stockQuantity &&
          oldProduct.imageUrl === newProduct.imageUrl &&
          oldProduct.isActive === newProduct.isActive
        );
        
        console.log(`     Identical: ${isIdentical ? '✅ Yes' : '❌ No'}`);
      }
    }
    
    // Compare all products by name
    console.log('\n📋 COMPARING ALL PRODUCTS BY NAME:');
    const oldProductNames = oldProducts.map(p => p.name);
    const newProductNames = currentProducts.map(p => p.name);
    
    console.log('   Products in OLD but not in NEW:');
    const missingInNew = oldProductNames.filter(name => !newProductNames.includes(name));
    if (missingInNew.length > 0) {
      missingInNew.forEach(name => console.log(`     - ${name}`));
    } else {
      console.log('     None');
    }
    
    console.log('   Products in NEW but not in OLD:');
    const missingInOld = newProductNames.filter(name => !oldProductNames.includes(name));
    if (missingInOld.length > 0) {
      missingInOld.forEach(name => console.log(`     - ${name}`));
    } else {
      console.log('     None');
    }
    
    // Compare Orders
    console.log('\n📦 COMPARING ORDERS:');
    const oldOrders = await oldConnection.db.collection('orders').find({}).toArray();
    const currentOrders = await currentConnection.db.collection('orders').find({}).toArray();
    
    console.log(`   OLD database: ${oldOrders.length} orders`);
    console.log(`   NEW database: ${currentOrders.length} orders`);
    
    // Compare Categories
    console.log('\n📂 COMPARING CATEGORIES:');
    const oldCategories = await oldConnection.db.collection('categories').find({}).toArray();
    const currentCategories = await currentConnection.db.collection('categories').find({}).toArray();
    
    console.log(`   OLD database: ${oldCategories.length} categories`);
    console.log(`   NEW database: ${currentCategories.length} categories`);
    
    if (oldCategories.length > 0 && currentCategories.length > 0) {
      console.log('   OLD categories:');
      oldCategories.forEach(cat => console.log(`     - ${cat._id}: ${cat.name}`));
      console.log('   NEW categories:');
      currentCategories.forEach(cat => console.log(`     - ${cat._id}: ${cat.name}`));
    }
    
    // Check database names
    console.log('\n🗄️  DATABASE INFO:');
    console.log(`   OLD database name: ${oldConnection.db.databaseName}`);
    console.log(`   NEW database name: ${currentConnection.db.databaseName}`);
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Products: OLD=${oldProducts.length}, NEW=${currentProducts.length}`);
    console.log(`   Orders: OLD=${oldOrders.length}, NEW=${currentOrders.length}`);
    console.log(`   Categories: OLD=${oldCategories.length}, NEW=${currentCategories.length}`);
    
    if (oldProducts.length === currentProducts.length && 
        oldOrders.length === currentOrders.length && 
        oldCategories.length === currentCategories.length) {
      console.log('   ✅ Databases appear to have the same data structure');
    } else {
      console.log('   ⚠️  Databases have different data counts');
    }
    
  } catch (error) {
    console.error('❌ Error comparing databases:', error);
    console.error('Stack trace:', error.stack);
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

// Run the comparison
compareDatabases();
