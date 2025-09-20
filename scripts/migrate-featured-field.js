// Migrate featured field to isFeatured
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define product schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  featured: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  stockQuantity: { type: Number, default: 0 },
  imageUrl: { type: String, default: '/placeholder.jpg' },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

async function migrateFeaturedField() {
  try {
    console.log('🔄 Migrating featured field to isFeatured...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all products that have 'featured' but no 'isFeatured' or different values
    const products = await Product.find({
      featured: { $exists: true }
    });
    
    console.log(`📦 Found ${products.length} products to check`);
    
    let updated = 0;
    
    // Update each product
    for (const product of products) {
      const needsUpdate = !product.isFeatured && product.featured;
      const needsCleanup = product.isFeatured !== undefined && product.featured !== undefined;
      
      if (needsUpdate) {
        await Product.findByIdAndUpdate(
          product._id,
          { 
            $set: { isFeatured: product.featured },
            $unset: { featured: 1 }
          }
        );
        updated++;
        console.log(`✅ Updated ${product.name}: featured=${product.featured} → isFeatured=${product.featured}`);
      } else if (needsCleanup) {
        // Just remove the old featured field
        await Product.findByIdAndUpdate(
          product._id,
          { $unset: { featured: 1 } }
        );
        updated++;
        console.log(`🧹 Cleaned up ${product.name}: removed old featured field`);
      } else {
        console.log(`⏭️ ${product.name}: already has isFeatured=${product.isFeatured}`);
      }
    }
    
    console.log(`\n🎉 Migrated ${updated} products`);
    
    // Verify the migration
    console.log('\n🧪 Verifying migration:');
    const testProducts = await Product.find().limit(3);
    testProducts.forEach(product => {
      console.log(`   - ${product.name}: isFeatured=${product.isFeatured}, featured=${product.featured}`);
    });
    
  } catch (error) {
    console.error('❌ Error migrating featured field:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrateFeaturedField();
