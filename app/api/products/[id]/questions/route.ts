import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductQuestion from '@/lib/models/ProductQuestion';
import Product from '@/lib/models/Product';

// GET /api/products/[id]/questions - Get all questions for a product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'answered'; // Only show answered questions by default
    
    // Verify product exists
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }
    
    // Build query
    const query: any = { 
      product: params.id,
      isPublic: true
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute queries
    const [questions, total] = await Promise.all([
      ProductQuestion.find(query)
        .populate('answeredBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductQuestion.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: {
        questions,
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
    console.error('Error fetching product questions:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch questions',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/questions - Submit a new question
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { question, firstName, lastName, email } = await req.json();
    
    // Validate required fields
    if (!question || !firstName || !lastName || !email) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }
    
    // Validate question length
    if (question.length > 500) {
      return NextResponse.json({
        success: false,
        message: 'Question must be 500 characters or less'
      }, { status: 400 });
    }
    
    // Verify product exists
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }
    
    // Create question
    const newQuestion = new ProductQuestion({
      product: params.id,
      question: question.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      status: 'pending'
    });
    
    await newQuestion.save();
    
    return NextResponse.json({
      success: true,
      message: 'Question submitted successfully',
      data: {
        id: newQuestion._id,
        status: newQuestion.status
      }
    });
    
  } catch (error) {
    console.error('Error creating product question:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit question',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
