import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductReview from '@/lib/models/ProductReview';
import GuestUser from '@/lib/models/GuestUser';
import Cart from '@/lib/models/Cart';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing API endpoints...');
    
    // Test database connection
    await connectDB();
    console.log('✅ Database connected');
    
    // Test model imports
    console.log('✅ ProductReview model:', ProductReview ? 'loaded' : 'failed');
    console.log('✅ GuestUser model:', GuestUser ? 'loaded' : 'failed');
    console.log('✅ Cart model:', Cart ? 'loaded' : 'failed');
    
    // Test basic queries
    const reviewCount = await ProductReview.countDocuments();
    const guestCount = await GuestUser.countDocuments();
    const cartCount = await Cart.countDocuments();
    
    console.log('✅ Review count:', reviewCount);
    console.log('✅ Guest count:', guestCount);
    console.log('✅ Cart count:', cartCount);
    
    return NextResponse.json({
      success: true,
      message: 'All tests passed',
      data: {
        database: 'connected',
        models: {
          ProductReview: 'loaded',
          GuestUser: 'loaded',
          Cart: 'loaded'
        },
        counts: {
          reviews: reviewCount,
          guests: guestCount,
          carts: cartCount
        }
      }
    });
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
