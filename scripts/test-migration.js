// Test Migration Script
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testMigration() {
  try {
    console.log('🧪 Testing migration setup...\n');
    
    // Test MongoDB connection
    console.log('1. Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Test MySQL connection
    console.log('\n2. Testing MySQL connection...');
    const mysql = require('mysql2/promise');
    const config = require('./migrate-config');
    
    const connection = await mysql.createConnection(config.mysql);
    console.log('✅ MySQL connected successfully');
    
    // Test if tables exist
    console.log('\n3. Checking MySQL tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:', tables.map(t => Object.values(t)[0]));
    
    // Test if users table exists and has data
    try {
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Users table: ${users[0].count} records`);
    } catch (error) {
      console.log('⚠️  Users table not found or empty');
    }
    
    // Test if categories table exists and has data
    try {
      const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
      console.log(`📂 Categories table: ${categories[0].count} records`);
    } catch (error) {
      console.log('⚠️  Categories table not found or empty');
    }
    
    // Test if products table exists and has data
    try {
      const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
      console.log(`📦 Products table: ${products[0].count} records`);
    } catch (error) {
      console.log('⚠️  Products table not found or empty');
    }
    
    // Test if blog_posts table exists and has data
    try {
      const [posts] = await connection.execute('SELECT COUNT(*) as count FROM blog_posts');
      console.log(`📝 Blog posts table: ${posts[0].count} records`);
    } catch (error) {
      console.log('⚠️  Blog posts table not found or empty');
    }
    
    console.log('\n✅ Migration test completed successfully!');
    console.log('\n🎯 Ready to run migration: npm run migrate');
    
  } catch (error) {
    console.error('❌ Migration test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if MySQL is running');
    console.log('2. Verify database name and credentials');
    console.log('3. Make sure .sql file was imported correctly');
    console.log('4. Check MongoDB connection string');
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testMigration();
