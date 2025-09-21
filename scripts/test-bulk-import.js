const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3000/api';

const testBulkImport = async () => {
  console.log('--- Starting Bulk Import Test ---');

  // Create test CSV files
  const reviewsCSV = `productId,name,email,rating,title,comment
"652a7107c1d4f8e7a9b0c1d2","John Doe","john@example.com","5","Amazing product!","This perfume is absolutely fantastic. Great longevity and beautiful scent."
"652a7107c1d4f8e7a9b0c1d2","Jane Smith","jane@example.com","4","Good quality","Nice fragrance, good value for money. Would recommend."
"652a7107c1d4f8e7a9b0c1d2","Mike Johnson","mike@example.com","5","Excellent!","Perfect scent for special occasions. Highly recommended!"`;

  const commentsCSV = `blogId,name,email,content
"652a7107c1d4f8e7a9b0c1d3","Alice Johnson","alice@example.com","Great article! Very informative and well-written."
"652a7107c1d4f8e7a9b0c1d3","Bob Wilson","bob@example.com","Thanks for sharing this valuable content. Learned a lot!"
"652a7107c1d4f8e7a9b0c1d3","Sarah Davis","sarah@example.com","Excellent post! Looking forward to more content like this."`;

  // Write CSV files
  fs.writeFileSync('test-reviews.csv', reviewsCSV);
  fs.writeFileSync('test-comments.csv', commentsCSV);

  try {
    // Test bulk import for reviews
    console.log('\n=== Testing Bulk Import for Reviews ===');
    
    const reviewsFormData = new FormData();
    reviewsFormData.append('file', fs.createReadStream('test-reviews.csv'));
    reviewsFormData.append('type', 'reviews');

    console.log('Uploading reviews CSV...');
    const reviewsResponse = await fetch(`${API_BASE_URL}/admin/bulk-import`, {
      method: 'POST',
      body: reviewsFormData
    });

    const reviewsData = await reviewsResponse.json();
    console.log('Reviews Import Result:', JSON.stringify(reviewsData, null, 2));

    // Test bulk import for comments
    console.log('\n=== Testing Bulk Import for Comments ===');
    
    const commentsFormData = new FormData();
    commentsFormData.append('file', fs.createReadStream('test-comments.csv'));
    commentsFormData.append('type', 'comments');

    console.log('Uploading comments CSV...');
    const commentsResponse = await fetch(`${API_BASE_URL}/admin/bulk-import`, {
      method: 'POST',
      body: commentsFormData
    });

    const commentsData = await commentsResponse.json();
    console.log('Comments Import Result:', JSON.stringify(commentsData, null, 2));

    // Test error handling with invalid CSV
    console.log('\n=== Testing Error Handling ===');
    
    const invalidCSV = `invalid,headers
"wrong","data"`;

    fs.writeFileSync('test-invalid.csv', invalidCSV);
    
    const invalidFormData = new FormData();
    invalidFormData.append('file', fs.createReadStream('test-invalid.csv'));
    invalidFormData.append('type', 'reviews');

    console.log('Uploading invalid CSV...');
    const invalidResponse = await fetch(`${API_BASE_URL}/admin/bulk-import`, {
      method: 'POST',
      body: invalidFormData
    });

    const invalidData = await invalidResponse.json();
    console.log('Invalid CSV Result:', JSON.stringify(invalidData, null, 2));

    console.log('\n--- Bulk Import Test Complete ---');

  } catch (error) {
    console.error('Error during bulk import test:', error);
  } finally {
    // Clean up test files
    try {
      fs.unlinkSync('test-reviews.csv');
      fs.unlinkSync('test-comments.csv');
      fs.unlinkSync('test-invalid.csv');
      console.log('Test files cleaned up');
    } catch (cleanupError) {
      console.log('Could not clean up test files:', cleanupError.message);
    }
  }
};

testBulkImport().catch(console.error);
