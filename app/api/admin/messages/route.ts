import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactMessage from '@/lib/models/ContactMessage';

// GET /api/admin/messages - Get all contact messages with filters
export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/admin/messages - Starting request');
    await connectDB();
    console.log('GET /api/admin/messages - Database connected');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const priority = searchParams.get('priority') || '';
    const search = searchParams.get('search') || '';
    
    console.log('GET /api/admin/messages - Params:', { page, limit, status, category, priority, search });
    
    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute queries
    console.log('GET /api/admin/messages - Executing queries');
    const [messages, total] = await Promise.all([
      ContactMessage.find(query)
        .populate('assignedTo', 'name email')
        .populate('repliedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContactMessage.countDocuments(query)
    ]);
    
    console.log('GET /api/admin/messages - Query results:', { messagesCount: messages.length, total });
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch messages',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
