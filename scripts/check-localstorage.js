// This script will help you check what's in your browser's localStorage
// Run this in your browser's console (F12 -> Console tab)

console.log('🔍 Checking localStorage contents...');

console.log('\n📦 Cart Items:');
const cartItems = localStorage.getItem('cart-items');
if (cartItems) {
  console.log(JSON.parse(cartItems));
} else {
  console.log('No cart items found');
}

console.log('\n👤 User Data:');
const userData = localStorage.getItem('user');
if (userData) {
  console.log(JSON.parse(userData));
} else {
  console.log('No user data found');
}

console.log('\n❤️ Wishlist Items:');
const wishlistItems = localStorage.getItem('wishlist-items');
if (wishlistItems) {
  console.log(JSON.parse(wishlistItems));
} else {
  console.log('No wishlist items found');
}

console.log('\n🔑 All localStorage keys:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`${key}: ${localStorage.getItem(key)}`);
}

console.log('\n💡 To clear everything, run:');
console.log('localStorage.clear();');
console.log('location.reload();');
