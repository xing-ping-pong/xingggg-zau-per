// Test script to check API endpoints
const testEndpoints = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  console.log('Testing API endpoints...');
  
  // Test cart endpoint
  try {
    console.log('\n1. Testing /api/cart...');
    const cartResponse = await fetch(`${baseUrl}/api/cart?userId=68ce78d700db156113e3576a&isGuest=false`);
    console.log('Cart Status:', cartResponse.status);
    if (!cartResponse.ok) {
      const errorText = await cartResponse.text();
      console.log('Cart Error:', errorText);
    } else {
      const cartData = await cartResponse.json();
      console.log('Cart Success:', cartData);
    }
  } catch (error) {
    console.error('Cart Error:', error.message);
  }
  
  // Test admin reviews endpoint
  try {
    console.log('\n2. Testing /api/admin/reviews...');
    const reviewsResponse = await fetch(`${baseUrl}/api/admin/reviews?page=1&limit=10&status=&search=`);
    console.log('Reviews Status:', reviewsResponse.status);
    if (!reviewsResponse.ok) {
      const errorText = await reviewsResponse.text();
      console.log('Reviews Error:', errorText);
    } else {
      const reviewsData = await reviewsResponse.json();
      console.log('Reviews Success:', reviewsData);
    }
  } catch (error) {
    console.error('Reviews Error:', error.message);
  }
  
  // Test MongoDB connection
  try {
    console.log('\n3. Testing MongoDB connection...');
    const mongoResponse = await fetch(`${baseUrl}/api/admin/stats`);
    console.log('MongoDB Status:', mongoResponse.status);
    if (!mongoResponse.ok) {
      const errorText = await mongoResponse.text();
      console.log('MongoDB Error:', errorText);
    } else {
      const mongoData = await mongoResponse.json();
      console.log('MongoDB Success:', mongoData);
    }
  } catch (error) {
    console.error('MongoDB Error:', error.message);
  }
};

testEndpoints();
