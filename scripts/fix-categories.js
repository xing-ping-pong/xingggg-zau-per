// Fix Categories Script
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Category Schema with proper slug handling
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  slug: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);

async function fixCategories() {
  try {
    console.log('🔧 Fixing categories...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Drop the existing categories collection to remove the old index
    await Category.collection.drop();
    console.log('🗑️  Dropped existing categories collection');
    
    // Recreate the collection with the new schema
    await Category.createCollection();
    console.log('✅ Recreated categories collection with new schema');
    
    // Now manually add the categories
    const categories = [
      {
        name: 'Designer Perfumes',
        description: 'Luxury fragrances from top fashion houses',
        createdAt: new Date()
      },
      {
        name: 'Women\'s Perfume',
        description: 'Elegant fragrances for women',
        createdAt: new Date()
      },
      {
        name: 'Dior',
        description: 'Luxury fragrances from Dior',
        createdAt: new Date()
      }
    ];
    
    for (const category of categories) {
      await Category.create(category);
      console.log(`✅ Created category: ${category.name}`);
    }
    
    console.log('\n🎉 Categories fixed successfully!');
    console.log('📊 Summary:');
    console.log('- Dropped old categories collection');
    console.log('- Recreated with proper schema');
    console.log('- Added all 3 categories');
    
  } catch (error) {
    console.error('❌ Error fixing categories:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixCategories();
