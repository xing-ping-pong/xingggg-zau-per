// Check specific product in database
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define product schema
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

const Product = mongoose.model('Product', productSchema);

async function checkProduct() {
  try {
    console.log('🔍 Checking product in database...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check the specific product that was being updated
    const productId = '68ce868656aa64bc967c5906'; // Vanilla Dusk
    const product = await Product.findById(productId);
    
    if (product) {
      console.log('📦 Product found:');
      console.log(JSON.stringify(product, null, 2));
    } else {
      console.log('❌ Product not found');
    }
    
    // Also check a few other products
    console.log('\n📦 All products:');
    const allProducts = await Product.find().limit(3);
    allProducts.forEach(p => {
      console.log(`- ${p.name}: stock=${p.stock}, discount=${p.discount}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking product:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkProduct();
