import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product, Category } from '@/lib/models';
import { addPerformanceHeaders } from '@/lib/utils/performance';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const featured = searchParams.get('featured');
    const exclude = searchParams.get('exclude');
    
    // Build query
    const query: any = {};
    
    // Note: We don't filter by isActive since products don't have this field

    if (category) {
      let categoryObj = null;
      // Try to find category by ID first
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryObj = await Category.findById(category);
      }
      // If not found by ID, try by slug
      if (!categoryObj) {
        categoryObj = await Category.findOne({ slug: category });
      }
      if (categoryObj) {
        query.category = categoryObj._id;
      } else {
        // If category not found, return no products
        query.category = null;
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (exclude) {
      query._id = { $ne: exclude };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const response = NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

    return addPerformanceHeaders(response, startTime);
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    await connectDB();

    // This would require admin authentication in a real app
    const body = await req.json();
    
    // Validate category exists and convert to ObjectId
    if (body.category) {
      const category = await Category.findById(body.category);
      if (!category) {
        return NextResponse.json({
          success: false,
          message: 'Category not found'
        }, { status: 400 });
      }
      // Convert category string to ObjectId
      body.category = new mongoose.Types.ObjectId(body.category);
    }

    const product = new Product(body);
    await product.save();

    const response = NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    }, { status: 201 });

    return addPerformanceHeaders(response, startTime);
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
