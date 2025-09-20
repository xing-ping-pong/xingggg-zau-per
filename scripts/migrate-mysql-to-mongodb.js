// MySQL to MongoDB Migration Script
// This script will help migrate your existing MySQL data to MongoDB

const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const config = require('./migrate-config');
require('dotenv').config({ path: '.env.local' });

// MongoDB Models - Define schemas directly to avoid module resolution issues

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  slug: { type: String, unique: true, sparse: true }, // Allow null values but ensure uniqueness when present
  createdAt: { type: Date, default: Date.now }
});

// Product Schema
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

// Blog Post Schema
const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, default: '' },
  author: { type: String, default: 'Admin' },
  featuredImage: { type: String, default: '/placeholder.jpg' },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// MySQL Configuration from config file
const mysqlConfig = config.mysql;

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI;

async function connectDatabases() {
  // Connect to MySQL
  const mysqlConnection = await mysql.createConnection(mysqlConfig);
  console.log('✅ Connected to MySQL');

  // Connect to MongoDB
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  return { mysqlConnection, mongoose };
}

async function migrateUsers(mysqlConnection) {
  console.log('🔄 Migrating users...');
  
  try {
    const [users] = await mysqlConnection.execute(`
      SELECT user_id, username, email, password_hash, is_admin, registration_date 
      FROM users 
      ORDER BY user_id
    `);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      try {
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            username: user.username,
            email: user.email,
            password: user.password_hash, // Already hashed
            isAdmin: user.is_admin === 1,
            createdAt: new Date(user.registration_date)
          });
          migrated++;
          console.log(`✅ [${i+1}/${users.length}] Migrated user: ${user.username}`);
        } else {
          skipped++;
          if (!config.migration.skipExisting) {
            console.log(`⏭️  [${i+1}/${users.length}] User already exists: ${user.username}`);
          }
        }
      } catch (error) {
        errors++;
        console.error(`❌ [${i+1}/${users.length}] Error migrating user ${user.username}:`, error.message);
      }
    }
    
    console.log(`✅ Users migration completed. Migrated: ${migrated}, Skipped: ${skipped}, Errors: ${errors}`);
  } catch (error) {
    console.error('❌ Error fetching users from MySQL:', error.message);
  }
}

async function migrateCategories(mysqlConnection) {
  console.log('🔄 Migrating categories...');
  
  try {
    const [categories] = await mysqlConnection.execute(`
      SELECT category_id, category_name, description 
      FROM categories 
      ORDER BY category_id
    `);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      try {
        const existingCategory = await Category.findOne({ name: category.category_name });
        if (!existingCategory) {
          await Category.create({
            name: category.category_name,
            description: category.description || '',
            createdAt: new Date()
          });
          migrated++;
          console.log(`✅ [${i+1}/${categories.length}] Migrated category: ${category.category_name}`);
        } else {
          skipped++;
          if (!config.migration.skipExisting) {
            console.log(`⏭️  [${i+1}/${categories.length}] Category already exists: ${category.category_name}`);
          }
        }
      } catch (error) {
        errors++;
        console.error(`❌ [${i+1}/${categories.length}] Error migrating category ${category.category_name}:`, error.message);
      }
    }
    
    console.log(`✅ Categories migration completed. Migrated: ${migrated}, Skipped: ${skipped}, Errors: ${errors}`);
  } catch (error) {
    console.error('❌ Error fetching categories from MySQL:', error.message);
  }
}

async function migrateProducts(mysqlConnection) {
  console.log('🔄 Migrating products...');
  
  try {
    const [products] = await mysqlConnection.execute(`
      SELECT p.product_id, p.product_name, p.description, p.price, p.category_id, p.is_featured, 
             p.discount_percent, p.stock_quantity, p.image_url, p.created_at,
             c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.product_id
    `);

    // Get category mapping
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        const existingProduct = await Product.findOne({ name: product.product_name });
        if (!existingProduct) {
          // Use existing images from your public folder
          const imageUrl = product.image_url ? `/img/${product.image_url}` : `/placeholder.jpg`;
          
          await Product.create({
            name: product.product_name,
            description: product.description || '',
            price: parseFloat(product.price),
            category: categoryMap[product.category_name] || null,
            featured: product.is_featured === 1,
            discount: parseFloat(product.discount_percent) || 0,
            stock: parseInt(product.stock_quantity) || 0,
            imageUrl: imageUrl,
            createdAt: new Date(product.created_at)
          });
          migrated++;
          console.log(`✅ [${i+1}/${products.length}] Migrated product: ${product.product_name}`);
        } else {
          skipped++;
          if (!config.migration.skipExisting) {
            console.log(`⏭️  [${i+1}/${products.length}] Product already exists: ${product.product_name}`);
          }
        }
      } catch (error) {
        errors++;
        console.error(`❌ [${i+1}/${products.length}] Error migrating product ${product.product_name}:`, error.message);
      }
    }
    
    console.log(`✅ Products migration completed. Migrated: ${migrated}, Skipped: ${skipped}, Errors: ${errors}`);
  } catch (error) {
    console.error('❌ Error fetching products from MySQL:', error.message);
  }
}

async function migrateBlogPosts(mysqlConnection) {
  console.log('🔄 Migrating blog posts...');
  
  try {
    const [posts] = await mysqlConnection.execute(`
      SELECT post_id, title, content, author_id, publish_date, featured_image
      FROM blog_posts 
      WHERE publish_date IS NOT NULL
      ORDER BY post_id
    `);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      try {
        const existingPost = await BlogPost.findOne({ title: post.title });
        if (!existingPost) {
          // Create excerpt from content (first 150 characters)
          const excerpt = post.content ? post.content.substring(0, 150) + '...' : '';
          
          await BlogPost.create({
            title: post.title,
            content: post.content,
            excerpt: excerpt,
            author: 'Admin', // You can map author_id to actual names if needed
            featuredImage: post.featured_image ? `/img/${post.featured_image}` : '/placeholder.jpg',
            published: true,
            createdAt: new Date(post.publish_date),
            updatedAt: new Date(post.publish_date)
          });
          migrated++;
          console.log(`✅ [${i+1}/${posts.length}] Migrated blog post: ${post.title}`);
        } else {
          skipped++;
          if (!config.migration.skipExisting) {
            console.log(`⏭️  [${i+1}/${posts.length}] Blog post already exists: ${post.title}`);
          }
        }
      } catch (error) {
        errors++;
        console.error(`❌ [${i+1}/${posts.length}] Error migrating blog post ${post.title}:`, error.message);
      }
    }
    
    console.log(`✅ Blog posts migration completed. Migrated: ${migrated}, Skipped: ${skipped}, Errors: ${errors}`);
  } catch (error) {
    console.error('❌ Error fetching blog posts from MySQL:', error.message);
  }
}

async function main() {
  try {
    const { mysqlConnection } = await connectDatabases();
    
    console.log('🚀 Starting MySQL to MongoDB migration...\n');
    
    // Migrate data in order
    await migrateUsers(mysqlConnection);
    await migrateCategories(mysqlConnection);
    await migrateProducts(mysqlConnection);
    await migrateBlogPosts(mysqlConnection);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Users migrated');
    console.log('- Categories migrated');
    console.log('- Products migrated (using existing images)');
    console.log('- Blog posts migrated');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run migration
main();
