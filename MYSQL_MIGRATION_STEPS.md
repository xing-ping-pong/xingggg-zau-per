# 📊 MySQL to MongoDB Migration Steps

## 🎯 Quick Start Guide

### Step 1: Set up MySQL Database

#### Option A: Using XAMPP (Recommended for Windows)
1. **Download and install XAMPP** from https://www.apachefriends.org/
2. **Start XAMPP Control Panel**
3. **Start MySQL service** (click Start next to MySQL)
4. **Open phpMyAdmin** (http://localhost/phpmyadmin)
5. **Create new database**:
   - Click "New" in the left sidebar
   - Database name: `luxury_perfume_old` (or any name you prefer)
   - Click "Create"
6. **Import your .sql file**:
   - Select your new database
   - Click "Import" tab
   - Choose your .sql file
   - Click "Go"

#### Option B: Using MySQL Command Line
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE luxury_perfume_old;"

# Import your .sql file
mysql -u root -p luxury_perfume_old < your_file.sql
```

### Step 2: Configure Migration Script

Run the interactive setup:
```bash
npm run migrate:setup
```

This will ask you for:
- MySQL Host (default: localhost)
- MySQL Username (default: root)
- MySQL Password
- Database Name
- MySQL Port (default: 3306)

### Step 3: Run Migration

```bash
npm run migrate
```

### Step 4: Verify Migration

1. **Check MongoDB Atlas** for your migrated data
2. **Visit admin panel**: http://localhost:3000/admin/products
3. **Test CRUD operations** in the admin panel

## 🔧 Manual Configuration (Alternative)

If you prefer to configure manually, edit `scripts/migrate-config.js`:

```javascript
module.exports = {
  mysql: {
    host: 'localhost',
    user: 'root',                    // Your MySQL username
    password: 'your_password',       // Your MySQL password
    database: 'luxury_perfume_old',  // Your database name
    port: 3306
  },
  migration: {
    skipExisting: true,    // Skip records that already exist
    clearExisting: false,  // Don't clear MongoDB before migration
    useExistingImages: true,  // Use images from your public folder
    imageBasePath: '/',    // Base path for images
  }
};
```

## 📋 Expected Database Structure

Your MySQL database should have these tables:

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
  is_admin TINYINT(1),
  created_at TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  category_id INT,
  featured TINYINT(1),
  discount DECIMAL(5,2),
  stock INT,
  image_url VARCHAR(500),
  created_at TIMESTAMP
);
```

### Blog Posts Table
```sql
CREATE TABLE blog_posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  content TEXT,
  excerpt TEXT,
  author VARCHAR(255),
  featured_image VARCHAR(500),
  status ENUM('draft', 'published'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🚨 Troubleshooting

### Common Issues

1. **MySQL Connection Failed**
   - Check if MySQL is running
   - Verify username/password
   - Check if database exists

2. **Import Failed**
   - Check .sql file format
   - Ensure file is not corrupted
   - Try importing in smaller chunks

3. **Migration Errors**
   - Check console logs for specific errors
   - Verify table structure matches expected format
   - Ensure MongoDB connection is working

### Error Messages

- `ER_ACCESS_DENIED_ERROR`: Wrong username/password
- `ER_BAD_DB_ERROR`: Database doesn't exist
- `ECONNREFUSED`: MySQL service not running

## 📊 Migration Progress

The migration script will show:
- ✅ Successfully migrated records
- ⏭️ Skipped existing records
- ❌ Errors with specific details
- 📊 Final statistics

## 🎯 After Migration

1. **Test Admin Panel**: Visit `/admin/products`
2. **Verify Data**: Check that all products are showing
3. **Test CRUD**: Try adding/editing/deleting products
4. **Check Images**: Ensure product images are loading
5. **Test Performance**: Run `npm run test:perf`

## 🚀 Next Steps

Once migration is complete:
1. Your admin panel will be fully functional with real data
2. All CRUD operations will work with your migrated data
3. Images will be preserved from your existing setup
4. Performance will be optimized for fast responses

Ready to start? Run `npm run migrate:setup` to begin! 🎉
