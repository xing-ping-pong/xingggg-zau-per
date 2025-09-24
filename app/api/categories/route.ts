import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Category } from '@/lib/models';
import { authenticateUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const parentOnly = searchParams.get('parentOnly') === 'true';

    const query: any = {};
    
    // Note: We don't filter by isActive since categories don't have this field

    if (parentOnly) {
      query.parentCategory = null;
    }

    const categories = await Category.find(query)
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await authenticateUser(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await req.json();

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Validate parent category exists if provided
    if (body.parentCategory) {
      const parentCategory = await Category.findById(body.parentCategory);
      if (!parentCategory) {
        return NextResponse.json({
          success: false,
          message: 'Parent category not found'
        }, { status: 400 });
      }
    }

    const category = new Category({
      name: body.name,
      description: body.description,
      parentCategory: body.parentCategory || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
      slug: slug
    });
    
    await category.save();

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
