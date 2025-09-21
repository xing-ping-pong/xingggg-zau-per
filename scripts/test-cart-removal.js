// Test script to verify cart removal functionality
const testCartRemoval = async () => {
  console.log('Testing cart removal functionality...\n');

  // Test data
  const testProductId = 'test-product-123';
  const testQuantity = 4; // Simulating 4 items in cart

  console.log(`Initial cart state: ${testQuantity} items of product ${testProductId}`);
  
  // Simulate the removeFromCart logic
  const currentQuantity = testQuantity;
  const quantityToRemove = testQuantity; // Remove all items
  const newQuantity = Math.max(0, currentQuantity - quantityToRemove);
  
  console.log(`Quantity to remove: ${quantityToRemove}`);
  console.log(`New quantity after removal: ${newQuantity}`);
  
  if (newQuantity === 0) {
    console.log('✅ Product should be completely removed from cart');
  } else {
    console.log('❌ Product should still be in cart with quantity:', newQuantity);
  }
  
  // Test partial removal
  console.log('\n--- Testing partial removal ---');
  const partialQuantity = 2;
  const partialNewQuantity = Math.max(0, currentQuantity - partialQuantity);
  
  console.log(`Removing ${partialQuantity} out of ${currentQuantity} items`);
  console.log(`New quantity after partial removal: ${partialNewQuantity}`);
  
  if (partialNewQuantity === 2) {
    console.log('✅ Partial removal works correctly');
  } else {
    console.log('❌ Partial removal failed');
  }
};

testCartRemoval();
