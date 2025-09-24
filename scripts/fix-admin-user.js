const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function fixAdminUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('username email isAdmin');
    console.log('\n📋 Current users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - Admin: ${user.isAdmin}`);
    });

    // Update the first user to admin (or you can specify email)
    const result = await User.updateOne(
      { email: users[0].email }, // Update first user, or specify email
      { $set: { isAdmin: true } }
    );

    if (result.modifiedCount > 0) {
      console.log(`\n✅ Successfully updated ${users[0].email} to admin`);
    } else {
      console.log('\n❌ No user was updated');
    }

    // Show updated users
    const updatedUsers = await User.find({}).select('username email isAdmin');
    console.log('\n📋 Updated users:');
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - Admin: ${user.isAdmin}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixAdminUser();

