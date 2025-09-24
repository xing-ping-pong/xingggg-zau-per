// Use built-in fetch (Node.js 18+) or https module
const https = require('https');
const http = require('http');

async function testOrderDirectly() {
  try {
    console.log('🧪 Testing order API directly...\n');
    
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
    
    console.log('📤 Sending order data:');
    console.log(JSON.stringify(testOrderData, null, 2));
    console.log('');
    
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData),
    });
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`📥 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`📥 Response Body: ${responseText}`);
    
    if (response.ok) {
      console.log('✅ Order API test PASSED!');
    } else {
      console.log('❌ Order API test FAILED!');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Raw error response:', responseText);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing order API:', error);
  }
}

// Run the test
testOrderDirectly();
