// Migrate stock field to stockQuantity
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
  stockQuantity: { type: Number, default: 0 },
  imageUrl: { type: String, default: '/placeholder.jpg' },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

async function migrateStockField() {
  try {
    console.log('🔄 Migrating stock field to stockQuantity...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all products that have 'stock' but no 'stockQuantity'
    const products = await Product.find({
      stock: { $exists: true },
      stockQuantity: { $exists: false }
    });
    
    console.log(`📦 Found ${products.length} products to migrate`);
    
    let updated = 0;
    
    // Update each product
    for (const product of products) {
      await Product.findByIdAndUpdate(
        product._id,
        { 
          $set: { stockQuantity: product.stock },
          $unset: { stock: 1 }
        }
      );
      updated++;
      console.log(`✅ Updated ${product.name}: stock=${product.stock} → stockQuantity=${product.stock}`);
    }
    
    console.log(`\n🎉 Migrated ${updated} products`);
    
    // Verify the migration
    console.log('\n🧪 Verifying migration:');
    const testProducts = await Product.find().limit(3);
    testProducts.forEach(product => {
      console.log(`   - ${product.name}: stockQuantity=${product.stockQuantity}, stock=${product.stock}`);
    });
    
  } catch (error) {
    console.error('❌ Error migrating stock field:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrateStockField();
