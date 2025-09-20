// Performance Test Script
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  const start = performance.now();
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    const end = performance.now();
    
    const duration = end - start;
    const responseTime = response.headers.get('X-Response-Time');
    
    console.log(`⚡ ${method} ${endpoint}: ${duration.toFixed(2)}ms`);
    if (responseTime) {
      console.log(`   Server response time: ${responseTime}`);
    }
    
    return {
      success: response.ok,
      duration,
      data,
      status: response.status
    };
  } catch (error) {
    const end = performance.now();
    console.log(`❌ ${method} ${endpoint}: ${(end - start).toFixed(2)}ms - ERROR: ${error.message}`);
    return {
      success: false,
      duration: end - start,
      error: error.message
    };
  }
}

async function runPerformanceTests() {
  console.log('🚀 Starting Performance Tests...\n');
  
  // Test 1: Products API
  console.log('📦 Testing Products API:');
  await testEndpoint('/api/products');
  
  // Test 2: Categories API
  console.log('\n📂 Testing Categories API:');
  await testEndpoint('/api/categories');
  
  // Test 3: Login API
  console.log('\n🔐 Testing Login API:');
  await testEndpoint('/api/auth/login', 'POST', {
    email: 'admin@example.com',
    password: 'password123'
  });
  
  // Test 4: Multiple concurrent requests
  console.log('\n🔄 Testing Concurrent Requests:');
  const concurrentTests = [
    testEndpoint('/api/products'),
    testEndpoint('/api/categories'),
    testEndpoint('/api/products?page=1&limit=5'),
  ];
  
  const results = await Promise.all(concurrentTests);
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  console.log(`   Average concurrent request time: ${avgDuration.toFixed(2)}ms`);
  
  // Test 5: Multiple sequential requests (simulating user behavior)
  console.log('\n👤 Testing Sequential User Flow:');
  const userFlow = [
    () => testEndpoint('/api/products'),
    () => testEndpoint('/api/categories'),
    () => testEndpoint('/api/products?featured=true'),
  ];
  
  let totalFlowTime = 0;
  for (const test of userFlow) {
    const result = await test();
    totalFlowTime += result.duration;
  }
  
  console.log(`   Total user flow time: ${totalFlowTime.toFixed(2)}ms`);
  
  console.log('\n✅ Performance tests completed!');
  console.log('\n📊 Performance Guidelines:');
  console.log('   - Good: < 200ms');
  console.log('   - Acceptable: 200-500ms');
  console.log('   - Poor: > 500ms');
}

// Run tests
runPerformanceTests().catch(console.error);
