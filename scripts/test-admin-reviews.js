const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';

const testAdminReviews = async () => {
  console.log('--- Starting Admin Reviews Management Test ---');

  const headers = {
    'Content-Type': 'application/json',
  };

  // Test Admin Product Reviews
  console.log('\n=== Testing Admin Product Reviews ===');

  // 1. Get all product reviews
  console.log('\n1. Fetching all product reviews...');
  let response = await fetch(`${API_BASE_URL}/admin/reviews`, { headers });
  let data = await response.json();
  console.log('All Product Reviews:', JSON.stringify(data.data, null, 2));

  // 2. Get reviews with filters
  console.log('\n2. Fetching approved reviews only...');
  response = await fetch(`${API_BASE_URL}/admin/reviews?status=approved&limit=5`, { headers });
  data = await response.json();
  console.log('Approved Reviews:', JSON.stringify(data.data, null, 2));

  // 3. Search reviews
  console.log('\n3. Searching reviews...');
  response = await fetch(`${API_BASE_URL}/admin/reviews?search=john`, { headers });
  data = await response.json();
  console.log('Search Results:', JSON.stringify(data.data, null, 2));

  // Test Admin Blog Comments
  console.log('\n=== Testing Admin Blog Comments ===');

  // 1. Get all blog comments
  console.log('\n1. Fetching all blog comments...');
  response = await fetch(`${API_BASE_URL}/admin/comments`, { headers });
  data = await response.json();
  console.log('All Blog Comments:', JSON.stringify(data.data, null, 2));

  // 2. Get comments with filters
  console.log('\n2. Fetching pending comments only...');
  response = await fetch(`${API_BASE_URL}/admin/comments?status=pending&limit=5`, { headers });
  data = await response.json();
  console.log('Pending Comments:', JSON.stringify(data.data, null, 2));

  // 3. Search comments
  console.log('\n3. Searching comments...');
  response = await fetch(`${API_BASE_URL}/admin/comments?search=great`, { headers });
  data = await response.json();
  console.log('Search Results:', JSON.stringify(data.data, null, 2));

  // Test Review Status Updates (if we have reviews)
  if (data.data && data.data.comments && data.data.comments.length > 0) {
    const firstComment = data.data.comments[0];
    console.log('\n=== Testing Review Status Updates ===');

    // 4. Update comment status to approved
    console.log(`\n4. Updating comment ${firstComment._id} status to approved...`);
    response = await fetch(`${API_BASE_URL}/admin/comments/${firstComment._id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: 'approved' })
    });
    data = await response.json();
    console.log('Update Result:', JSON.stringify(data, null, 2));

    // 5. Update comment status to rejected
    console.log(`\n5. Updating comment ${firstComment._id} status to rejected...`);
    response = await fetch(`${API_BASE_URL}/admin/comments/${firstComment._id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: 'rejected' })
    });
    data = await response.json();
    console.log('Update Result:', JSON.stringify(data, null, 2));
  }

  console.log('\n--- Admin Reviews Management Test Complete ---');
};

testAdminReviews().catch(console.error);
