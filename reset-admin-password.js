const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Define User schema (same as in your app)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin users
    const adminUsers = await User.find({ isAdmin: true });
    console.log(`\n📋 Found ${adminUsers.length} admin user(s):`);
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email})`);
    });

    if (adminUsers.length === 0) {
      console.log('\n❌ No admin users found. Creating a new admin user...');
      
      // Create new admin user
      const newPassword = 'Jaan$1977'; // Default password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      const newAdmin = await User.create({
        username: 'admin',
        email: 'admin@rosia.com',
        password: hashedPassword,
        isAdmin: true
      });
      
      console.log('✅ New admin user created:');
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Password: ${newPassword}`);
      console.log('\n🔐 Login credentials:');
      console.log(`   Email: admin@rosia.com`);
      console.log(`   Password: Jaan$1977`);
      
    } else {
      // Reset password for existing admin
      const newPassword = 'Jaan$1977'; // New password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update the first admin user's password
      const adminToUpdate = adminUsers[0];
      await User.findByIdAndUpdate(adminToUpdate._id, {
        password: hashedPassword,
        updatedAt: new Date()
      });
      
      console.log(`\n✅ Password reset for admin: ${adminToUpdate.username} (${adminToUpdate.email})`);
      console.log('\n🔐 New login credentials:');
      console.log(`   Email: ${adminToUpdate.email}`);
      console.log(`   Password: ${newPassword}`);
    }

    console.log('\n🎉 Admin password reset completed!');
    console.log('You can now login to the admin panel with the credentials above.');
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the script
resetAdminPassword();
