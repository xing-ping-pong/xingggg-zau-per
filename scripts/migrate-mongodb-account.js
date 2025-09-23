const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Source and destination MongoDB URIs
const SOURCE_MONGODB_URI = process.env.SOURCE_MONGODB_URI || process.env.MONGODB_URI;
const DEST_MONGODB_URI = process.env.DEST_MONGODB_URI;

if (!SOURCE_MONGODB_URI) {
  console.error('❌ SOURCE_MONGODB_URI not found in environment variables');
  process.exit(1);
}

if (!DEST_MONGODB_URI) {
  console.error('❌ DEST_MONGODB_URI not found in environment variables');
  console.log('Please add DEST_MONGODB_URI to your .env.local file');
  process.exit(1);
}

// Define schemas directly instead of importing TypeScript files
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  avatar: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  preferences: {
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: String,
  size: String,
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  tags: [String],
  specifications: mongoose.Schema.Types.Mixed,
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductReview' }],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  image: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: String,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  trackingNumber: String,
  notes: String
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }]
}, { timestamps: true });

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  excerpt: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: String,
  tags: [String],
  featuredImage: String,
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  excerpt: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: String,
  tags: [String],
  featuredImage: String,
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

const blogReviewSchema = new mongoose.Schema({
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String
}, { timestamps: true });

const blogViewSchema = new mongoose.Schema({
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: String,
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  repliedAt: Date
}, { timestamps: true });

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: String,
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: Number,
  maxDiscountAmount: Number,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  validFrom: Date,
  validUntil: Date
}, { timestamps: true });

const guestUserSchema = new mongoose.Schema({
  email: String,
  name: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  }
}, { timestamps: true });

const productQuestionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question: { type: String, required: true },
  answer: String,
  answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answeredAt: Date,
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

const productReviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: String,
  comment: String,
  isApproved: { type: Boolean, default: false },
  helpful: { type: Number, default: 0 }
}, { timestamps: true });

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  description: String
}, { timestamps: true });

// Collection mapping
const collections = [
  { name: 'users', schema: userSchema },
  { name: 'products', schema: productSchema },
  { name: 'categories', schema: categorySchema },
  { name: 'orders', schema: orderSchema },
  { name: 'carts', schema: cartSchema },
  { name: 'wishlists', schema: wishlistSchema },
  { name: 'blogs', schema: blogSchema },
  { name: 'blogposts', schema: blogPostSchema },
  { name: 'blogreviews', schema: blogReviewSchema },
  { name: 'blogviews', schema: blogViewSchema },
  { name: 'comments', schema: commentSchema },
  { name: 'contactmessages', schema: contactMessageSchema },
  { name: 'coupons', schema: couponSchema },
  { name: 'guestusers', schema: guestUserSchema },
  { name: 'productquestions', schema: productQuestionSchema },
  { name: 'productreviews', schema: productReviewSchema },
  { name: 'settings', schema: settingsSchema }
];

class MongoDBMigrator {
  constructor() {
    this.sourceConnection = null;
    this.destConnection = null;
    this.migrationStats = {
      totalCollections: collections.length,
      successful: 0,
      failed: 0,
      totalDocuments: 0,
      errors: []
    };
  }

  async connect() {
    try {
      console.log('🔄 Connecting to source MongoDB...');
      this.sourceConnection = await mongoose.createConnection(SOURCE_MONGODB_URI, {
        bufferCommands: true, // Changed to true to allow queuing
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      });
      
      // Wait for connection to be ready
      await this.sourceConnection.asPromise();
      console.log('✅ Connected to source MongoDB');

      console.log('🔄 Connecting to destination MongoDB...');
      this.destConnection = await mongoose.createConnection(DEST_MONGODB_URI, {
        bufferCommands: true, // Changed to true to allow queuing
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      });
      
      // Wait for connection to be ready
      await this.destConnection.asPromise();
      console.log('✅ Connected to destination MongoDB');

    } catch (error) {
      console.error('❌ Connection error:', error);
      throw error;
    }
  }

  async migrateCollection(collection) {
    try {
      console.log(`\n🔄 Migrating ${collection.name}...`);
      
      // Get source model
      const SourceModel = this.sourceConnection.model(collection.name, collection.schema);
      
      // Get destination model
      const DestModel = this.destConnection.model(collection.name, collection.schema);

      // Count documents in source
      const sourceCount = await SourceModel.countDocuments();
      console.log(`📊 Found ${sourceCount} documents in source ${collection.name}`);

      if (sourceCount === 0) {
        console.log(`⏭️  Skipping ${collection.name} - no documents to migrate`);
        return { success: true, count: 0 };
      }

      // Clear destination collection (optional - comment out if you want to keep existing data)
      const destCount = await DestModel.countDocuments();
      if (destCount > 0) {
        console.log(`⚠️  Destination ${collection.name} has ${destCount} documents. Clearing...`);
        await DestModel.deleteMany({});
      }

      // Migrate documents in batches
      const batchSize = 1000;
      let migratedCount = 0;
      let skip = 0;

      while (skip < sourceCount) {
        const documents = await SourceModel.find({}).skip(skip).limit(batchSize).lean();
        
        if (documents.length === 0) break;

        // Insert documents into destination
        await DestModel.insertMany(documents, { ordered: false });
        migratedCount += documents.length;
        skip += batchSize;

        console.log(`📈 Migrated ${migratedCount}/${sourceCount} documents from ${collection.name}`);
      }

      // Verify migration
      const finalCount = await DestModel.countDocuments();
      console.log(`✅ ${collection.name} migration completed: ${finalCount} documents`);

      this.migrationStats.successful++;
      this.migrationStats.totalDocuments += finalCount;

      return { success: true, count: finalCount };

    } catch (error) {
      console.error(`❌ Error migrating ${collection.name}:`, error.message);
      this.migrationStats.failed++;
      this.migrationStats.errors.push({
        collection: collection.name,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  async migrateAll() {
    console.log('🚀 Starting MongoDB migration...');
    console.log(`📋 Will migrate ${collections.length} collections`);
    
    const startTime = Date.now();

    for (const collection of collections) {
      await this.migrateCollection(collection);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    this.printSummary(duration);
  }

  printSummary(duration) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📦 Total Collections: ${this.migrationStats.totalCollections}`);
    console.log(`✅ Successful: ${this.migrationStats.successful}`);
    console.log(`❌ Failed: ${this.migrationStats.failed}`);
    console.log(`📄 Total Documents Migrated: ${this.migrationStats.totalDocuments}`);

    if (this.migrationStats.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.migrationStats.errors.forEach(error => {
        console.log(`  - ${error.collection}: ${error.error}`);
      });
    }

    console.log('\n' + '='.repeat(60));
  }

  async createBackup() {
    console.log('💾 Creating backup of source data...');
    const backupData = {};
    
    for (const collection of collections) {
      try {
        const SourceModel = this.sourceConnection.model(collection.name, collection.schema);
        const documents = await SourceModel.find({}).lean();
        backupData[collection.name] = documents;
        console.log(`📦 Backed up ${documents.length} documents from ${collection.name}`);
      } catch (error) {
        console.error(`❌ Error backing up ${collection.name}:`, error.message);
      }
    }

    const backupFile = `backup-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`💾 Backup saved to: ${backupFile}`);
  }

  async verifyMigration() {
    console.log('\n🔍 Verifying migration...');
    let allVerified = true;

    for (const collection of collections) {
      try {
        const SourceModel = this.sourceConnection.model(collection.name, collection.schema);
        const DestModel = this.destConnection.model(collection.name, collection.schema);
        
        const sourceCount = await SourceModel.countDocuments();
        const destCount = await DestModel.countDocuments();
        
        if (sourceCount === destCount) {
          console.log(`✅ ${collection.name}: ${destCount} documents (verified)`);
        } else {
          console.log(`❌ ${collection.name}: Source=${sourceCount}, Dest=${destCount} (MISMATCH)`);
          allVerified = false;
        }
      } catch (error) {
        console.error(`❌ Error verifying ${collection.name}:`, error.message);
        allVerified = false;
      }
    }

    if (allVerified) {
      console.log('\n🎉 All collections verified successfully!');
    } else {
      console.log('\n⚠️  Some collections have verification issues. Please check the logs above.');
    }

    return allVerified;
  }

  async disconnect() {
    if (this.sourceConnection) {
      await this.sourceConnection.close();
      console.log('🔌 Disconnected from source MongoDB');
    }
    if (this.destConnection) {
      await this.destConnection.close();
      console.log('🔌 Disconnected from destination MongoDB');
    }
  }
}

// Main execution
async function main() {
  const migrator = new MongoDBMigrator();
  
  try {
    await migrator.connect();
    
    // Ask user what they want to do
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'backup':
        await migrator.createBackup();
        break;
      case 'migrate':
        await migrator.migrateAll();
        break;
      case 'verify':
        await migrator.verifyMigration();
        break;
      case 'full':
        await migrator.createBackup();
        await migrator.migrateAll();
        await migrator.verifyMigration();
        break;
      default:
        console.log('Usage: node migrate-mongodb-account.js [backup|migrate|verify|full]');
        console.log('  backup  - Create backup of source data');
        console.log('  migrate - Migrate data from source to destination');
        console.log('  verify  - Verify migration was successful');
        console.log('  full    - Run backup, migrate, and verify');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrator.disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Migration interrupted by user');
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = MongoDBMigrator;
