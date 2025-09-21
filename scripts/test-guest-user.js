// Test script for guest user functionality
const testGuestUser = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Guest User Functionality...\n');
  
  try {
    // Test 1: Add product to cart as guest
    console.log('1. Testing add to cart as guest...');
    const addToCartResponse = await fetch(`${baseUrl}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'guest',
        productId: '507f1f77bcf86cd799439011', // Sample product ID
        quantity: 2,
        isGuest: true
      })
    });
    
    const addToCartData = await addToCartResponse.json();
    console.log('✅ Add to cart result:', addToCartData.success ? 'SUCCESS' : 'FAILED');
    if (!addToCartData.success) console.log('   Error:', addToCartData.message);
    
    // Test 2: Get cart as guest
    console.log('\n2. Testing get cart as guest...');
    const getCartResponse = await fetch(`${baseUrl}/api/cart?userId=guest&isGuest=true`);
    const getCartData = await getCartResponse.json();
    console.log('✅ Get cart result:', getCartData.success ? 'SUCCESS' : 'FAILED');
    if (getCartData.success) {
      console.log('   Cart items count:', getCartData.data.count);
    }
    
    // Test 3: Add product to wishlist as guest
    console.log('\n3. Testing add to wishlist as guest...');
    const addToWishlistResponse = await fetch(`${baseUrl}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'guest',
        productId: '507f1f77bcf86cd799439012', // Sample product ID
        isGuest: true
      })
    });
    
    const addToWishlistData = await addToWishlistResponse.json();
    console.log('✅ Add to wishlist result:', addToWishlistData.success ? 'SUCCESS' : 'FAILED');
    if (!addToWishlistData.success) console.log('   Error:', addToWishlistData.message);
    
    // Test 4: Get wishlist as guest
    console.log('\n4. Testing get wishlist as guest...');
    const getWishlistResponse = await fetch(`${baseUrl}/api/wishlist?userId=guest&isGuest=true`);
    const getWishlistData = await getWishlistResponse.json();
    console.log('✅ Get wishlist result:', getWishlistData.success ? 'SUCCESS' : 'FAILED');
    if (getWishlistData.success) {
      console.log('   Wishlist items count:', getWishlistData.data.count);
    }
    
    console.log('\n🎉 Guest user functionality test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

// Run the test if this script is executed directly
if (require.main === module) {
  testGuestUser();
}

module.exports = { testGuestUser };
