const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@zauperfumes.com.pk' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Admin: ${existingAdmin.isAdmin}`);
      
      // Ask if user wants to reset password
      console.log('\n💡 To reset the admin password, delete the user first and run this script again.');
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = new User({
        username: 'admin',
        email: 'admin@zauperfumes.com.pk',
        password: hashedPassword,
        isAdmin: true
      });

      await adminUser.save();
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@zauperfumes.com.pk');
      console.log('🔑 Password: admin123');
      console.log('👑 Admin: true');
      console.log('\n⚠️  Please change the password after first login!');
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createAdminUser();
