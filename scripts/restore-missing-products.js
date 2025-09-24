const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Old database connection string
const OLD_DB_URI = 'mongodb+srv://alimahesar04_db_user:3sGVbHa8F6Jb3k5e@cluster0.pajnty3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Current database connection
const CURRENT_DB_URI = process.env.MONGODB_URI;

async function restoreMissingProducts() {
  let oldConnection, currentConnection;
  
  try {
    console.log('🔧 Restoring missing products...\n');
    
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
    
    // The specific missing product IDs from your cart
    const missingProductIds = [
      '68cff80a9e92b25d0eb13924', // Midnight Rose Elixir
      '68ce868656aa64bc967c5903'  // Floral Symphony
    ];
    
    console.log('🔍 Finding missing products in OLD database...');
    
    for (const productId of missingProductIds) {
      try {
        // Find the product in the old database
        const oldProduct = await oldConnection.db.collection('products').findOne({ 
          _id: new mongoose.Types.ObjectId(productId) 
        });
        
        if (oldProduct) {
          console.log(`\n📦 Found product: ${oldProduct.name}`);
          console.log(`   Old ID: ${productId}`);
          console.log(`   Price: $${oldProduct.price}`);
          console.log(`   Stock: ${oldProduct.stockQuantity}`);
          
          // Check if this product already exists in current database with different ID
          const existingProduct = await currentConnection.db.collection('products').findOne({
            name: oldProduct.name
          });
          
          if (existingProduct) {
            console.log(`   ✅ Product already exists in current DB with ID: ${existingProduct._id}`);
            console.log(`   💡 Your cart should use ID: ${existingProduct._id} instead of ${productId}`);
          } else {
            // Create the product in current database with the same ID
            const newProduct = {
              _id: new mongoose.Types.ObjectId(productId),
              name: oldProduct.name,
              description: oldProduct.description || 'Luxury perfume',
              price: oldProduct.price,
              originalPrice: oldProduct.originalPrice,
              discount: oldProduct.discount || 0,
              discountEndDate: oldProduct.discountEndDate,
              imageUrl: oldProduct.imageUrl,
              images: oldProduct.images || [],
              category: oldProduct.category,
              stockQuantity: oldProduct.stockQuantity,
              sku: oldProduct.sku,
              weight: oldProduct.weight,
              dimensions: oldProduct.dimensions,
              tags: oldProduct.tags || [],
              isActive: oldProduct.isActive !== undefined ? oldProduct.isActive : true,
              isFeatured: oldProduct.isFeatured || false,
              metaTitle: oldProduct.metaTitle,
              metaDescription: oldProduct.metaDescription,
              createdAt: oldProduct.createdAt || new Date(),
              updatedAt: new Date()
            };
            
            // Insert the product
            await currentConnection.db.collection('products').insertOne(newProduct);
            console.log(`   ✅ Restored product with ID: ${productId}`);
          }
        } else {
          console.log(`   ❌ Product not found in old database: ${productId}`);
        }
      } catch (error) {
        console.log(`   ❌ Error processing product ${productId}: ${error.message}`);
      }
    }
    
    console.log('\n🔍 Verifying restoration...');
    
    // Check if the products now exist in current database
    for (const productId of missingProductIds) {
      const product = await currentConnection.db.collection('products').findOne({ 
        _id: new mongoose.Types.ObjectId(productId) 
      });
      
      if (product) {
        console.log(`   ✅ ${productId}: ${product.name} - RESTORED`);
      } else {
        console.log(`   ❌ ${productId}: Still missing`);
      }
    }
    
    console.log('\n✅ Restoration completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Your cart should now work with the restored products');
    console.log('   2. Try placing an order again');
    console.log('   3. If you still have issues, clear your cart and add products again');
    
  } catch (error) {
    console.error('❌ Error restoring products:', error);
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

// Run the restoration
restoreMissingProducts();
