const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';

const testReviewsAndComments = async () => {
  console.log('--- Starting Reviews and Comments Test ---');

  // Test data
  const productId = '652a7107c1d4f8e7a9b0c1d2'; // Replace with a valid product ID
  const blogId = '652a7107c1d4f8e7a9b0c1d3'; // Replace with a valid blog ID

  const headers = {
    'Content-Type': 'application/json',
  };

  // Test Product Reviews
  console.log('\n=== Testing Product Reviews ===');

  // 1. Get initial product reviews
  console.log('\n1. Fetching initial product reviews...');
  let response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, { headers });
  let data = await response.json();
  console.log('Initial Reviews:', JSON.stringify(data.data, null, 2));

  // 2. Add a product review
  console.log('\n2. Adding a product review...');
  const productReview = {
    name: 'John Doe',
    email: 'john@example.com',
    rating: 5,
    title: 'Amazing fragrance!',
    comment: 'This perfume is absolutely fantastic. Great longevity and beautiful scent.',
    userId: 'guest'
  };

  response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
    method: 'POST',
    headers,
    body: JSON.stringify(productReview),
  });
  data = await response.json();
  console.log('Review Added:', JSON.stringify(data, null, 2));

  // 3. Add another product review
  console.log('\n3. Adding another product review...');
  const productReview2 = {
    name: 'Jane Smith',
    email: 'jane@example.com',
    rating: 4,
    title: 'Good quality',
    comment: 'Nice fragrance, good value for money. Would recommend.',
    userId: 'guest'
  };

  response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
    method: 'POST',
    headers,
    body: JSON.stringify(productReview2),
  });
  data = await response.json();
  console.log('Second Review Added:', JSON.stringify(data, null, 2));

  // 4. Get updated product reviews
  console.log('\n4. Fetching updated product reviews...');
  response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, { headers });
  data = await response.json();
  console.log('Updated Reviews:', JSON.stringify(data.data, null, 2));

  // Test Blog Comments
  console.log('\n=== Testing Blog Comments ===');

  // 1. Get initial blog comments
  console.log('\n1. Fetching initial blog comments...');
  response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments`, { headers });
  data = await response.json();
  console.log('Initial Comments:', JSON.stringify(data.data, null, 2));

  // 2. Add a blog comment
  console.log('\n2. Adding a blog comment...');
  const blogComment = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    content: 'Great article! Very informative and well-written.',
    userId: 'guest'
  };

  response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(blogComment),
  });
  data = await response.json();
  console.log('Comment Added:', JSON.stringify(data, null, 2));

  // 3. Add another blog comment
  console.log('\n3. Adding another blog comment...');
  const blogComment2 = {
    name: 'Bob Wilson',
    email: 'bob@example.com',
    content: 'Thanks for sharing this! I learned a lot from this post.',
    userId: 'guest'
  };

  response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(blogComment2),
  });
  data = await response.json();
  console.log('Second Comment Added:', JSON.stringify(data, null, 2));

  // 4. Get updated blog comments
  console.log('\n4. Fetching updated blog comments...');
  response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments`, { headers });
  data = await response.json();
  console.log('Updated Comments:', JSON.stringify(data.data, null, 2));

  console.log('\n--- Reviews and Comments Test Complete ---');
};

testReviewsAndComments().catch(console.error);
