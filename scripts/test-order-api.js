const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Current database connection
const CURRENT_DB_URI = process.env.MONGODB_URI;

async function testOrderAPI() {
  let connection;
  
  try {
    console.log('🧪 Testing Order API...\n');
    
    // Connect to current database
    console.log('📡 Connecting to database...');
    connection = await mongoose.createConnection(CURRENT_DB_URI);
    await new Promise(resolve => connection.once('open', resolve));
    console.log('✅ Connected to database successfully\n');
    
    // Test data similar to what the cart would send
    const testOrderData = {
      guestInfo: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Test Street',
        city: 'Test City',
        zipCode: '12345',
        country: 'Test Country'
      },
      items: [
        {
          productId: '68cff80a9e92b25d0eb13924', // Midnight Rose Elixir
          quantity: 1
        }
      ],
      pricing: {
        subtotal: 4041,
        shipping: 0,
        tax: 0,
        couponDiscount: 0,
        total: 4041
      }
    };
    
    console.log('🔍 Testing with order data:');
    console.log(JSON.stringify(testOrderData, null, 2));
    console.log('');
    
    // Check if the product exists
    console.log('🔍 Checking if product exists...');
    const product = await connection.db.collection('products').findOne({ 
      _id: new mongoose.Types.ObjectId('68cff80a9e92b25d0eb13924') 
    });
    
    if (product) {
      console.log('✅ Product found:');
      console.log(`   Name: ${product.name}`);
      console.log(`   Price: $${product.price}`);
      console.log(`   Stock: ${product.stockQuantity}`);
      console.log(`   Active: ${product.isActive}`);
      console.log('');
    } else {
      console.log('❌ Product not found!');
      return;
    }
    
    // Test the order creation logic step by step
    console.log('🔍 Testing order creation logic...');
    
    // 1. Validate guest information
    console.log('1. Validating guest information...');
    const requiredGuestFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode', 'country'];
    for (const field of requiredGuestFields) {
      if (!testOrderData.guestInfo[field]) {
        console.log(`   ❌ Missing field: ${field}`);
        return;
      }
    }
    console.log('   ✅ Guest information valid');
    
    // 2. Validate items
    console.log('2. Validating items...');
    if (!Array.isArray(testOrderData.items) || testOrderData.items.length === 0) {
      console.log('   ❌ No items provided');
      return;
    }
    console.log('   ✅ Items valid');
    
    // 3. Validate pricing
    console.log('3. Validating pricing...');
    if (!testOrderData.pricing || typeof testOrderData.pricing !== 'object') {
      console.log('   ❌ Invalid pricing object');
      return;
    }
    const requiredPricingFields = ['subtotal', 'shipping', 'tax', 'total'];
    for (const field of requiredPricingFields) {
      if (typeof testOrderData.pricing[field] !== 'number' || testOrderData.pricing[field] < 0) {
        console.log(`   ❌ Invalid pricing field: ${field}`);
        return;
      }
    }
    console.log('   ✅ Pricing valid');
    
    // 4. Validate product IDs
    console.log('4. Validating product IDs...');
    const productIds = testOrderData.items.map(item => item.productId);
    const invalidIds = productIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      console.log(`   ❌ Invalid product IDs: ${invalidIds.join(', ')}`);
      return;
    }
    console.log('   ✅ Product IDs valid');
    
    // 5. Check products exist
    console.log('5. Checking products exist...');
    const products = await connection.db.collection('products').find({ _id: { $in: productIds } }).toArray();
    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p._id.toString());
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      console.log(`   ❌ Products not found: ${missingIds.join(', ')}`);
      return;
    }
    console.log('   ✅ All products found');
    
    // 6. Check stock availability
    console.log('6. Checking stock availability...');
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    for (const item of testOrderData.items) {
      const product = productMap.get(item.productId);
      if (product.stockQuantity < item.quantity) {
        console.log(`   ❌ Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`);
        return;
      }
    }
    console.log('   ✅ Stock available');
    
    // 7. Test order creation
    console.log('7. Testing order creation...');
    const orderCount = await connection.db.collection('orders').countDocuments();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;
    console.log(`   Order number: ${orderNumber}`);
    
    // Prepare order items
    const orderItems = testOrderData.items.map(item => {
      const product = productMap.get(item.productId);
      const discountedPrice = product.discount > 0 
        ? product.price - (product.price * product.discount / 100)
        : product.price;
      
      return {
        productId: item.productId,
        productName: product.name,
        productImage: product.imageUrl,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount,
        totalPrice: discountedPrice * item.quantity
      };
    });
    
    console.log('   Order items prepared:');
    orderItems.forEach(item => {
      console.log(`     - ${item.productName}: ${item.quantity} x $${item.price} = $${item.totalPrice}`);
    });
    
    // Create the order
    const order = {
      orderNumber,
      guestInfo: testOrderData.guestInfo,
      items: orderItems,
      pricing: testOrderData.pricing,
      paymentMethod: 'cash_on_delivery',
      status: 'pending',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notifications: {
        emailSent: false,
        whatsappSent: false,
        trackingEmailSent: false,
        trackingWhatsappSent: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('   ✅ Order object created successfully');
    console.log('   ✅ All validations passed!');
    
    console.log('\n🎉 Order creation test PASSED!');
    console.log('   The issue might be in the API route or server configuration.');
    
  } catch (error) {
    console.error('❌ Error testing order API:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.close();
    }
    console.log('🔌 Disconnected from database');
  }
}

// Run the test
testOrderAPI();
