const fetch = require('node-fetch');

async function testOrderTracking() {
  console.log('🧪 Testing Order Tracking API...\n');

  const testCases = [
    {
      name: 'Valid Order - ORD-000008',
      orderNumber: 'ORD-000008',
      email: 'ali.mahesar04@gmail.com',
      expectedSuccess: true
    },
    {
      name: 'Invalid Order Number',
      orderNumber: 'ORD-999999',
      email: 'ali.mahesar04@gmail.com',
      expectedSuccess: false
    },
    {
      name: 'Invalid Email',
      orderNumber: 'ORD-000008',
      email: 'wrong@email.com',
      expectedSuccess: false
    },
    {
      name: 'Missing Order Number',
      orderNumber: '',
      email: 'ali.mahesar04@gmail.com',
      expectedSuccess: false
    },
    {
      name: 'Missing Email',
      orderNumber: 'ORD-000008',
      email: '',
      expectedSuccess: false
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    console.log(`   Order Number: ${testCase.orderNumber}`);
    console.log(`   Email: ${testCase.email}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/orders/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: testCase.orderNumber,
          email: testCase.email
        })
      });

      const data = await response.json();
      
      if (testCase.expectedSuccess) {
        if (data.success) {
          console.log('   ✅ SUCCESS: Order found');
          console.log(`   📦 Order Status: ${data.data.status}`);
          console.log(`   💰 Total: $${data.data.total}`);
          console.log(`   📅 Order Date: ${new Date(data.data.orderDate).toLocaleDateString()}`);
          console.log(`   📍 Items: ${data.data.items.length} item(s)`);
          console.log(`   🚚 Tracking: ${data.data.trackingNumber}`);
        } else {
          console.log('   ❌ FAILED: Expected success but got error');
          console.log(`   Error: ${data.message}`);
        }
      } else {
        if (!data.success) {
          console.log('   ✅ SUCCESS: Correctly rejected invalid data');
          console.log(`   Error: ${data.message}`);
        } else {
          console.log('   ❌ FAILED: Expected rejection but got success');
        }
      }
    } catch (error) {
      console.log('   ❌ ERROR: Network or server error');
      console.log(`   Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🎯 Order Tracking Test Complete!');
}

// Run the test
testOrderTracking().catch(console.error);
