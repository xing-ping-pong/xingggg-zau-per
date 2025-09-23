# MongoDB Account Migration Guide

This guide will help you migrate your data from one MongoDB account to another with ease and safety.

## 🚀 Quick Start

### 1. Setup Environment Variables

Copy the example environment file and configure your MongoDB URIs:

```bash
cp .env.migration.example .env.local
```

Edit `.env.local` and add your MongoDB connection strings:

```env
# Source MongoDB URI (your current database with data)
SOURCE_MONGODB_URI=mongodb+srv://username:password@source-cluster.mongodb.net/database-name?retryWrites=true&w=majority

# Destination MongoDB URI (your new fresh database)
DEST_MONGODB_URI=mongodb+srv://username:password@destination-cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

### 2. Run Migration

Choose one of these options:

#### Option A: Full Migration (Recommended)
```bash
npm run migrate:full
```
This will:
- Create a backup of your source data
- Migrate all collections
- Verify the migration was successful

#### Option B: Step-by-Step Migration
```bash
# 1. Create backup first
npm run migrate:backup

# 2. Run migration
npm run migrate:mongodb migrate

# 3. Verify migration
npm run migrate:verify
```

## 📋 What Gets Migrated

The migration script will transfer all your collections:

- **Users** - User accounts and profiles
- **Products** - Product catalog and details
- **Categories** - Product categories
- **Orders** - Order history and details
- **Carts** - Shopping cart data
- **Wishlists** - User wishlists
- **Blogs** - Blog posts and content
- **Comments** - User comments
- **Contact Messages** - Contact form submissions
- **Coupons** - Discount coupons
- **Reviews** - Product and blog reviews
- **Settings** - Application settings
- **And more...**

## 🔧 Migration Features

### ✅ Safety Features
- **Automatic Backup**: Creates JSON backup before migration
- **Batch Processing**: Migrates data in batches to avoid memory issues
- **Error Handling**: Continues migration even if some collections fail
- **Verification**: Compares document counts between source and destination

### ⚡ Performance Features
- **Parallel Processing**: Efficient batch processing
- **Memory Management**: Processes large datasets without memory issues
- **Progress Tracking**: Real-time progress updates
- **Connection Pooling**: Optimized database connections

### 🛡️ Data Integrity
- **Document Preservation**: Maintains all document structure and relationships
- **Index Preservation**: Preserves database indexes
- **Validation**: Ensures all data is properly migrated

## 📊 Migration Commands

| Command | Description |
|---------|-------------|
| `npm run migrate:backup` | Create backup of source data |
| `npm run migrate:mongodb migrate` | Migrate data from source to destination |
| `npm run migrate:verify` | Verify migration was successful |
| `npm run migrate:full` | Run backup, migrate, and verify |

## 🔍 Troubleshooting

### Common Issues

#### 1. Connection Errors
```
❌ Connection error: Authentication failed
```
**Solution**: Check your MongoDB URIs in `.env.local`. Ensure usernames, passwords, and cluster names are correct.

#### 2. Permission Errors
```
❌ Error: not authorized on database
```
**Solution**: Ensure your MongoDB user has read/write permissions on both source and destination databases.

#### 3. Network Timeouts
```
❌ Error: server selection timeout
```
**Solution**: Check your network connection and MongoDB cluster status. The script includes retry logic.

#### 4. Memory Issues
```
❌ Error: JavaScript heap out of memory
```
**Solution**: The script uses batch processing to handle large datasets. If you still encounter issues, you can reduce the batch size in the script.

### Verification Issues

If verification fails:
1. Check the error logs for specific collection issues
2. Compare document counts manually
3. Check for data type mismatches
4. Ensure indexes are properly created

## 📁 Backup Files

Backup files are created in the format: `backup-YYYY-MM-DD.json`

These contain all your data in JSON format and can be used to restore data if needed.

## 🔄 Rollback Plan

If you need to rollback:

1. **Stop your application**
2. **Update your MONGODB_URI** to point back to the source database
3. **Restart your application**

The migration script doesn't modify your source database, so your original data remains intact.

## 📈 Migration Statistics

The script provides detailed statistics:
- Total collections migrated
- Success/failure counts
- Total documents migrated
- Migration duration
- Error details

## 🛠️ Advanced Configuration

### Custom Batch Size
Edit `scripts/migrate-mongodb-account.js` and modify:
```javascript
const batchSize = 1000; // Increase for faster migration, decrease for memory issues
```

### Skip Collections
To skip certain collections, comment them out in the `collections` array:
```javascript
const collections = [
  { name: 'users', model: User },
  // { name: 'logs', model: Log }, // Skip this collection
  { name: 'products', model: Product },
  // ... other collections
];
```

### Preserve Destination Data
To keep existing data in destination, comment out the clear operation:
```javascript
// await DestModel.deleteMany({}); // Comment this line
```

## 📞 Support

If you encounter issues:

1. Check the migration logs for specific errors
2. Verify your MongoDB connection strings
3. Ensure you have proper permissions
4. Check MongoDB Atlas cluster status

## 🎉 Post-Migration

After successful migration:

1. **Update your application's MONGODB_URI** to point to the new database
2. **Test your application** thoroughly
3. **Update your deployment environment variables**
4. **Monitor your application** for any issues
5. **Keep the backup files** for a few days as a safety measure

---

**Note**: This migration script is designed to be safe and non-destructive. Your source database remains unchanged, so you can always rollback if needed.
