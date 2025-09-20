// Fix Product Categories Script
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define schemas
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

const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);

async function fixProductCategories() {
  try {
    console.log('🔧 Fixing product categories...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all categories
    const categories = await Category.find();
    console.log(`📂 Found ${categories.length} categories`);
    
    // Get all products
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products`);
    
    // Create category mapping based on common patterns
    const categoryMap = {
      'Designer Perfumes': categories.find(c => c.name === 'Designer Perfumes')?._id,
      'Women\'s Perfume': categories.find(c => c.name === 'Women\'s Perfume')?._id,
      'Dior': categories.find(c => c.name === 'Dior')?._id,
    };
    
    let updated = 0;
    
    // Update products with category references
    for (const product of products) {
      // Assign categories based on product name patterns or default to Designer Perfumes
      let categoryId = categoryMap['Designer Perfumes']; // Default
      
      if (product.name.toLowerCase().includes('dior')) {
        categoryId = categoryMap['Dior'];
      } else if (product.name.toLowerCase().includes('women') || 
                 product.name.toLowerCase().includes('floral') ||
                 product.name.toLowerCase().includes('rose') ||
                 product.name.toLowerCase().includes('bloom')) {
        categoryId = categoryMap['Women\'s Perfume'];
      }
      
      if (categoryId) {
        await Product.findByIdAndUpdate(product._id, { category: categoryId });
        updated++;
        console.log(`✅ Updated ${product.name} -> ${categories.find(c => c._id.equals(categoryId))?.name}`);
      }
    }
    
    console.log(`\n🎉 Fixed ${updated} products with category references`);
    
    // Test the fix
    console.log('\n🧪 Testing fixed products:');
    const testProducts = await Product.find().populate('category').limit(3);
    testProducts.forEach(product => {
      console.log(`   - ${product.name} - Category: ${product.category?.name || 'None'}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing product categories:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixProductCategories();
