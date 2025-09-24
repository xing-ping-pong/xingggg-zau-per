const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Current database connection
const CURRENT_DB_URI = process.env.MONGODB_URI;

async function checkExistingOrders() {
  let connection;
  
  try {
    console.log('🔍 Checking existing orders in database...\n');
    
    // Connect to current database
    console.log('📡 Connecting to database...');
    connection = await mongoose.createConnection(CURRENT_DB_URI);
    await new Promise(resolve => connection.once('open', resolve));
    console.log('✅ Connected to database successfully\n');
    
    // Get all orders
    const orders = await connection.db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
    
    console.log(`📦 Total orders in database: ${orders.length}`);
    console.log('');
    
    if (orders.length > 0) {
      console.log('📋 All order numbers:');
      orders.forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.orderNumber} - Created: ${order.createdAt}`);
      });
      console.log('');
      
      // Check for duplicates
      const orderNumbers = orders.map(o => o.orderNumber);
      const uniqueOrderNumbers = [...new Set(orderNumbers)];
      
      if (orderNumbers.length !== uniqueOrderNumbers.length) {
        console.log('❌ DUPLICATE ORDER NUMBERS FOUND:');
        const duplicates = orderNumbers.filter((item, index) => orderNumbers.indexOf(item) !== index);
        duplicates.forEach(dup => {
          console.log(`  - ${dup}`);
        });
      } else {
        console.log('✅ No duplicate order numbers found');
      }
      console.log('');
      
      // Find the highest order number
      const numericOrderNumbers = orderNumbers
        .filter(num => num.startsWith('ORD-'))
        .map(num => parseInt(num.replace('ORD-', '')))
        .filter(num => !isNaN(num));
      
      if (numericOrderNumbers.length > 0) {
        const highestNumber = Math.max(...numericOrderNumbers);
        console.log(`🔢 Highest order number: ORD-${String(highestNumber).padStart(6, '0')}`);
        console.log(`🔢 Next order number should be: ORD-${String(highestNumber + 1).padStart(6, '0')}`);
      }
    } else {
      console.log('📦 No orders found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking orders:', error);
  } finally {
    if (connection) {
      await connection.close();
    }
    console.log('🔌 Disconnected from database');
  }
}

// Run the check
checkExistingOrders();
