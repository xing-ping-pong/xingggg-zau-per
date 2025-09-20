import connectDB from '@/lib/mongodb';

let isConnected = false;

export async function ensureDBConnection() {
  if (isConnected) {
    return;
  }
  
  try {
    await connectDB();
    isConnected = true;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}
