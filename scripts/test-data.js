// Test Data Script
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  slug: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  featured: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  imageUrl: { type: String, default: '/placeholder.jpg' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);

async function testData() {
  try {
    console.log('🧪 Testing migrated data...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Test Users
    const userCount = await User.countDocuments();
    console.log(`👥 Users: ${userCount}`);
    if (userCount > 0) {
      const users = await User.find().limit(3);
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - Admin: ${user.isAdmin}`);
      });
    }
    
    // Test Categories
    const categoryCount = await Category.countDocuments();
    console.log(`\n📂 Categories: ${categoryCount}`);
    if (categoryCount > 0) {
      const categories = await Category.find();
      categories.forEach(cat => {
        console.log(`   - ${cat.name}`);
      });
    }
    
    // Test Products
    const productCount = await Product.countDocuments();
    console.log(`\n📦 Products: ${productCount}`);
    if (productCount > 0) {
      const products = await Product.find().populate('category').limit(3);
      products.forEach(product => {
        console.log(`   - ${product.name} - $${product.price} - Category: ${product.category?.name || 'None'}`);
      });
    }
    
    console.log('\n✅ Data test completed!');
    
    if (userCount === 0) {
      console.log('\n⚠️  No users found. Run migration first.');
    }
    if (categoryCount === 0) {
      console.log('\n⚠️  No categories found. Run: npm run migrate:fix-categories');
    }
    if (productCount === 0) {
      console.log('\n⚠️  No products found. Check migration.');
    }
    
  } catch (error) {
    console.error('❌ Error testing data:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testData();
