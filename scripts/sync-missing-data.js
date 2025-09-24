const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Old database connection string
const OLD_DB_URI = 'mongodb+srv://alimahesar04_db_user:3sGVbHa8F6Jb3k5e@cluster0.pajnty3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Current database connection
const CURRENT_DB_URI = process.env.MONGODB_URI;

async function syncMissingData() {
  let oldConnection, currentConnection;
  
  try {
    console.log('🔄 Syncing missing data from old to new database...\n');
    
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
    
    // 1. Sync Missing Orders
    console.log('📦 SYNCING ORDERS:');
    const oldOrders = await oldConnection.db.collection('orders').find({}).toArray();
    const currentOrders = await currentConnection.db.collection('orders').find({}).toArray();
    
    console.log(`   OLD database: ${oldOrders.length} orders`);
    console.log(`   NEW database: ${currentOrders.length} orders`);
    
    const oldOrderIds = oldOrders.map(o => o._id.toString());
    const currentOrderIds = currentOrders.map(o => o._id.toString());
    const missingOrderIds = oldOrderIds.filter(id => !currentOrderIds.includes(id));
    
    if (missingOrderIds.length > 0) {
      console.log(`   Missing orders: ${missingOrderIds.length}`);
      
      for (const orderId of missingOrderIds) {
        const oldOrder = oldOrders.find(o => o._id.toString() === orderId);
        if (oldOrder) {
          // Remove _id to let MongoDB generate a new one
          const { _id, ...orderData } = oldOrder;
          
          // Check if order number already exists
          const existingOrder = await currentConnection.db.collection('orders').findOne({ 
            orderNumber: oldOrder.orderNumber 
          });
          
          if (!existingOrder) {
            await currentConnection.db.collection('orders').insertOne(orderData);
            console.log(`     ✅ Restored order: ${oldOrder.orderNumber}`);
          } else {
            console.log(`     ⚠️  Order number ${oldOrder.orderNumber} already exists, skipping`);
          }
        }
      }
    } else {
      console.log('   ✅ No missing orders found');
    }
    console.log('');
    
    // 2. Sync Product Data Differences
    console.log('🛍️  SYNCING PRODUCT DATA:');
    const oldProducts = await oldConnection.db.collection('products').find({}).toArray();
    const currentProducts = await currentConnection.db.collection('products').find({}).toArray();
    
    console.log(`   OLD database: ${oldProducts.length} products`);
    console.log(`   NEW database: ${currentProducts.length} products`);
    
    // Create maps for easy lookup
    const oldProductMap = new Map(oldProducts.map(p => [p._id.toString(), p]));
    const currentProductMap = new Map(currentProducts.map(p => [p._id.toString(), p]));
    
    let updatedProducts = 0;
    
    for (const [productId, oldProduct] of oldProductMap) {
      const currentProduct = currentProductMap.get(productId);
      
      if (currentProduct) {
        // Check for differences and update if needed
        const needsUpdate = 
          oldProduct.stockQuantity !== currentProduct.stockQuantity ||
          oldProduct.imageUrl !== currentProduct.imageUrl ||
          oldProduct.isActive !== currentProduct.isActive ||
          oldProduct.price !== currentProduct.price;
        
        if (needsUpdate) {
          const updateData = {};
          
          // Update stock if old database has more (preserve higher stock)
          if (oldProduct.stockQuantity > currentProduct.stockQuantity) {
            updateData.stockQuantity = oldProduct.stockQuantity;
          }
          
          // Update image if old database has a different (possibly better) image
          if (oldProduct.imageUrl && oldProduct.imageUrl !== currentProduct.imageUrl) {
            updateData.imageUrl = oldProduct.imageUrl;
          }
          
          // Update active status
          if (oldProduct.isActive !== undefined && oldProduct.isActive !== currentProduct.isActive) {
            updateData.isActive = oldProduct.isActive;
          }
          
          // Update price if different
          if (oldProduct.price !== currentProduct.price) {
            updateData.price = oldProduct.price;
          }
          
          if (Object.keys(updateData).length > 0) {
            await currentConnection.db.collection('products').updateOne(
              { _id: new mongoose.Types.ObjectId(productId) },
              { $set: updateData }
            );
            console.log(`     ✅ Updated product: ${oldProduct.name}`);
            console.log(`        Changes: ${Object.keys(updateData).join(', ')}`);
            updatedProducts++;
          }
        }
      } else {
        // Product exists in old but not in new - restore it
        const { _id, ...productData } = oldProduct;
        await currentConnection.db.collection('products').insertOne(productData);
        console.log(`     ✅ Restored missing product: ${oldProduct.name}`);
        updatedProducts++;
      }
    }
    
    if (updatedProducts === 0) {
      console.log('   ✅ No product updates needed');
    }
    console.log('');
    
    // 3. Verify Final State
    console.log('🔍 VERIFICATION:');
    const finalOrders = await currentConnection.db.collection('orders').find({}).toArray();
    const finalProducts = await currentConnection.db.collection('products').find({}).toArray();
    
    console.log(`   Final orders: ${finalOrders.length}`);
    console.log(`   Final products: ${finalProducts.length}`);
    console.log('');
    
    // 4. Summary
    console.log('📊 SYNC SUMMARY:');
    console.log(`   Orders: ${oldOrders.length} → ${finalOrders.length}`);
    console.log(`   Products: ${oldProducts.length} → ${finalProducts.length}`);
    console.log(`   Products updated: ${updatedProducts}`);
    console.log('');
    
    console.log('✅ Data sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Error syncing data:', error);
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

// Run the sync
syncMissingData();
