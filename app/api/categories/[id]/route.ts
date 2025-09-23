import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { authenticateUser } from '@/lib/auth';

// GET /api/categories/[id] - Get a single category
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const category = await Category.findById(id)
      .populate('parentCategory', 'name slug')
      .lean();

    if (!category) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Error in GET /api/categories/[id]:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// PUT /api/categories/[id] - Update a category
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await authenticateUser(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

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

    // Generate slug from name if name is being updated
    let updateData: any = {
      name: body.name,
      description: body.description,
      parentCategory: body.parentCategory || null,
      isActive: body.isActive !== undefined ? body.isActive : true
    };

    // Only update slug if name is being changed
    if (body.name) {
      updateData.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug');

    if (!updatedCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: { category: updatedCategory }
    });
  } catch (error) {
    console.error('Error in PUT /api/categories/[id]:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await authenticateUser(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id } = params;

    // Check if category has children
    const children = await Category.find({ parentCategory: id });
    if (children.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete category with subcategories. Please delete subcategories first.'
      }, { status: 400 });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/categories/[id]:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
