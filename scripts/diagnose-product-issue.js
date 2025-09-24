const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Current database connection
const CURRENT_DB_URI = process.env.MONGODB_URI;

async function diagnoseProductIssue() {
  let connection;
  
  try {
    console.log('🔍 Diagnosing product issue...\n');
    
    // Connect to current database
    console.log('📡 Connecting to database...');
    connection = await mongoose.createConnection(CURRENT_DB_URI);
    await new Promise(resolve => connection.once('open', resolve));
    console.log('✅ Connected to database successfully\n');
    
    const productId = '68cff80a9e92b25d0eb13924';
    
    console.log('🔍 Testing different query methods...\n');
    
    // Method 1: Direct findOne
    console.log('1. Direct findOne query:');
    const product1 = await connection.db.collection('products').findOne({ 
      _id: new mongoose.Types.ObjectId(productId) 
    });
    console.log(`   Result: ${product1 ? 'Found' : 'Not found'}`);
    if (product1) {
      console.log(`   Name: ${product1.name}`);
      console.log(`   ID type: ${typeof product1._id}`);
      console.log(`   ID value: ${product1._id}`);
    }
    console.log('');
    
    // Method 2: String ID
    console.log('2. String ID query:');
    const product2 = await connection.db.collection('products').findOne({ 
      _id: productId 
    });
    console.log(`   Result: ${product2 ? 'Found' : 'Not found'}`);
    console.log('');
    
    // Method 3: $in query with ObjectId
    console.log('3. $in query with ObjectId:');
    const products3 = await connection.db.collection('products').find({ 
      _id: { $in: [new mongoose.Types.ObjectId(productId)] } 
    }).toArray();
    console.log(`   Result: ${products3.length} products found`);
    console.log('');
    
    // Method 4: $in query with string
    console.log('4. $in query with string:');
    const products4 = await connection.db.collection('products').find({ 
      _id: { $in: [productId] } 
    }).toArray();
    console.log(`   Result: ${products4.length} products found`);
    console.log('');
    
    // Method 5: Check all products and their IDs
    console.log('5. All products in database:');
    const allProducts = await connection.db.collection('products').find({}).toArray();
    console.log(`   Total products: ${allProducts.length}`);
    allProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ID: ${product._id} (${typeof product._id}) - Name: ${product.name}`);
    });
    console.log('');
    
    // Method 6: Check if the specific ID exists in any form
    console.log('6. Searching for similar IDs:');
    const similarProducts = await connection.db.collection('products').find({
      $or: [
        { _id: productId },
        { _id: new mongoose.Types.ObjectId(productId) },
        { name: { $regex: 'Midnight Rose Elixir', $options: 'i' } }
      ]
    }).toArray();
    console.log(`   Found ${similarProducts.length} similar products:`);
    similarProducts.forEach(product => {
      console.log(`     - ID: ${product._id} (${typeof product._id}) - Name: ${product.name}`);
    });
    console.log('');
    
    // Method 7: Test the exact query from the API
    console.log('7. Testing exact API query:');
    const productIds = [productId];
    const products7 = await connection.db.collection('products').find({ 
      _id: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) } 
    }).toArray();
    console.log(`   Result: ${products7.length} products found`);
    if (products7.length > 0) {
      products7.forEach(product => {
        console.log(`     - ${product._id}: ${product.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error diagnosing product issue:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.close();
    }
    console.log('🔌 Disconnected from database');
  }
}

// Run the diagnosis
diagnoseProductIssue();
