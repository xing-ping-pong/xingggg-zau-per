const fs = require('fs');

// Sample data for testing bulk import
const generateSampleData = () => {
  console.log('--- Generating Sample CSV Data ---');

  // Sample product reviews
  const reviewsCSV = `productId,name,email,rating,title,comment
"652a7107c1d4f8e7a9b0c1d2","John Doe","john@example.com","5","Amazing fragrance!","This perfume is absolutely fantastic. Great longevity and beautiful scent. I get compliments everywhere I go!"
"652a7107c1d4f8e7a9b0c1d2","Jane Smith","jane@example.com","4","Good quality","Nice fragrance, good value for money. Would recommend to others."
"652a7107c1d4f8e7a9b0c1d2","Mike Johnson","mike@example.com","5","Excellent product!","Perfect scent for special occasions. Highly recommended!"
"652a7107c1d4f8e7a9b0c1d2","Sarah Davis","sarah@example.com","4","Love it!","Beautiful scent with great longevity. The packaging is also very elegant."
"652a7107c1d4f8e7a9b0c1d2","David Wilson","david@example.com","5","Outstanding!","This is now my signature scent. Absolutely love everything about it."
"652a7107c1d4f8e7a9b0c1d2","Emma Brown","emma@example.com","3","Decent product","Good fragrance but the longevity could be better. Overall satisfied."
"652a7107c1d4f8e7a9b0c1d2","Alex Taylor","alex@example.com","4","Great value","Nice scent for the price. Would buy again."
"652a7107c1d4f8e7a9b0c1d2","Lisa Anderson","lisa@example.com","5","Perfect!","Exactly what I was looking for. Amazing scent and great quality."`;

  // Sample blog comments
  const commentsCSV = `blogId,name,email,content
"652a7107c1d4f8e7a9b0c1d3","Alice Johnson","alice@example.com","Great article! Very informative and well-written. Learned a lot from this post."
"652a7107c1d4f8e7a9b0c1d3","Bob Wilson","bob@example.com","Thanks for sharing this valuable content. Looking forward to more posts like this!"
"652a7107c1d4f8e7a9b0c1d3","Sarah Davis","sarah@example.com","Excellent post! The information was very helpful and easy to understand."
"652a7107c1d4f8e7a9b0c1d3","Michael Chen","michael@example.com","Really enjoyed reading this. Great insights and practical advice."
"652a7107c1d4f8e7a9b0c1d3","Jennifer Lee","jennifer@example.com","This was exactly what I needed to know. Thank you for the detailed explanation!"
"652a7107c1d4f8e7a9b0c1d3","Robert Garcia","robert@example.com","Fantastic article! Very well structured and informative."
"652a7107c1d4f8e7a9b0c1d3","Amanda White","amanda@example.com","Love your writing style! This post was both entertaining and educational."
"652a7107c1d4f8e7a9b0c1d3","Daniel Martinez","daniel@example.com","Great content as always. Keep up the excellent work!"`;

  // Write CSV files
  fs.writeFileSync('sample-reviews.csv', reviewsCSV);
  fs.writeFileSync('sample-comments.csv', commentsCSV);

  console.log('✅ Sample CSV files generated:');
  console.log('   - sample-reviews.csv (8 product reviews)');
  console.log('   - sample-comments.csv (8 blog comments)');
  console.log('');
  console.log('📝 Instructions:');
  console.log('   1. Replace the product/blog IDs with actual IDs from your database');
  console.log('   2. Modify the sample data as needed');
  console.log('   3. Use these files to test the bulk import feature');
  console.log('');
  console.log('🔧 To get actual IDs, you can:');
  console.log('   - Check your MongoDB database');
  console.log('   - Use the admin panel to view products/blogs');
  console.log('   - Check the browser network tab when loading product/blog pages');
};

generateSampleData();
