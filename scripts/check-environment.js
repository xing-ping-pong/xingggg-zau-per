// Check environment variables and database connection
require('dotenv').config({ path: '.env.local' });

console.log('Environment Check:');
console.log('==================');

// Check required environment variables
const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET', 
  'NEXTAUTH_SECRET',
  'NODE_ENV'
];

console.log('\nRequired Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***' : value.substring(0, 20) + '...'}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

// Check MongoDB URI format
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  console.log('\nMongoDB URI Analysis:');
  if (mongoUri.includes('mongodb+srv://')) {
    console.log('✅ Using MongoDB Atlas (cloud)');
  } else if (mongoUri.includes('mongodb://')) {
    console.log('✅ Using local MongoDB');
  } else {
    console.log('❌ Invalid MongoDB URI format');
  }
  
  // Check if it has credentials
  if (mongoUri.includes('@')) {
    console.log('✅ URI contains credentials');
  } else {
    console.log('❌ URI missing credentials');
  }
  
  // Check if it has database name
  if (mongoUri.includes('/') && mongoUri.split('/').length > 3) {
    console.log('✅ URI contains database name');
  } else {
    console.log('❌ URI missing database name');
  }
}

console.log('\nNode Environment:', process.env.NODE_ENV);
console.log('Platform:', process.platform);
console.log('Node Version:', process.version);
