// Update Product Images Script
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

// Better image mapping based on product names and descriptions
const imageMapping = {
  'Ambre Nut 2.0': '/luxury-amber-perfume.jpg',
  'Velvet Bloom': '/luxury-perfume-bottle-midnight-rose-dark-elegant.jpg',
  'Ocean Whisper': '/luxury-perfume-bottle-ocean-blue-fresh-modern.jpg',
  'Amber Eclipse': '/luxury-perfume-bottle-golden-amber-warm-tones.jpg',
  'Citrus Muse': '/luxury-perfume-bottle-citrus-yellow-bright-fresh.jpg',
  'Midnight Rose': '/luxury-perfume-bottle-midnight-rose-dark-elegant.jpg',
  'Woody Reverie': '/luxury-perfume-bottle-woods-forest-green.jpg',
  'Golden Hour': '/luxury-perfume-bottle-golden-amber-warm-tones.jpg',
  'Noir Luxe': '/luxury-perfume-bottle-black-velvet-sophisticated.jpg',
  'Floral Symphony': '/luxury-perfume-bottle-garden-floral-elegant.jpg',
  'Vanilla Dusk': '/luxury-perfume-bottle-crystal-clear-modern.jpg'
};

async function updateProductImages() {
  try {
    console.log('🖼️ Updating product images...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all products
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products`);
    
    let updated = 0;
    
    // Update each product with better image
    for (const product of products) {
      const newImageUrl = imageMapping[product.name] || '/luxury-perfume-bottle-crystal-clear-modern.jpg';
      
      if (newImageUrl !== product.imageUrl) {
        await Product.findByIdAndUpdate(product._id, { imageUrl: newImageUrl });
        updated++;
        console.log(`✅ Updated ${product.name} -> ${newImageUrl}`);
      } else {
        console.log(`⏭️ ${product.name} already has correct image`);
      }
    }
    
    console.log(`\n🎉 Updated ${updated} products with better images`);
    
    // Test the updates
    console.log('\n🧪 Testing updated products:');
    const testProducts = await Product.find().limit(3);
    testProducts.forEach(product => {
      console.log(`   - ${product.name} -> ${product.imageUrl}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating product images:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateProductImages();
