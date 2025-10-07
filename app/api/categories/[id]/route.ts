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
    const formData = await req.formData();

    // Extract fields from FormData
    const name = formData.get('name');
    const description = formData.get('description');
    const parentCategory = formData.get('parentCategory');
    const isActive = formData.get('isActive') === 'true';
    const imageFile = formData.get('image');

    // Validate parent category exists if provided
    if (parentCategory) {
      const parentCat = await Category.findById(parentCategory);
      if (!parentCat) {
        return NextResponse.json({
          success: false,
          message: 'Parent category not found'
        }, { status: 400 });
      }
    }

    // Prepare update data
    let updateData: any = {
      name,
      description,
      parentCategory: parentCategory || null,
      isActive,
    };

    // Only update slug if name is being changed
    if (name) {
      updateData.slug = String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Handle image upload if image file is present
    if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile) {
      // Upload to Cloudinary
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const { uploadImage } = await import('@/lib/cloudinary');
      try {
        const secureUrl = await uploadImage(buffer, 'categories');
        updateData.imageUrl = secureUrl;
      } catch (err) {
        console.error('Image upload failed:', err);
      }
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
