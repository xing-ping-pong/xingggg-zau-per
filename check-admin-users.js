const mongoose = require('mongoose');
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

async function checkAdminUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users
    const allUsers = await User.find({}).select('username email isAdmin createdAt');
    console.log(`\n📋 Found ${allUsers.length} total user(s) in database:`);
    
    allUsers.forEach((user, index) => {
      const adminStatus = user.isAdmin ? '👑 ADMIN' : '👤 User';
      const createdDate = new Date(user.createdAt).toLocaleDateString();
      console.log(`${index + 1}. ${user.username} (${user.email}) - ${adminStatus} - Created: ${createdDate}`);
    });

    // Find admin users specifically
    const adminUsers = await User.find({ isAdmin: true }).select('username email createdAt');
    console.log(`\n👑 Admin users (${adminUsers.length}):`);
    
    if (adminUsers.length === 0) {
      console.log('   No admin users found.');
    } else {
      adminUsers.forEach((user, index) => {
        const createdDate = new Date(user.createdAt).toLocaleDateString();
        console.log(`   ${index + 1}. ${user.username} (${user.email}) - Created: ${createdDate}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the script
checkAdminUsers();
