import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Category } from '@/lib/models';
import { authenticateUser } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

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

    let name = "", description = "", parentCategory = null, isActive = true, imageUrl = "";
    let slug = "";
    let file: File | null = null;
    if (req.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await req.formData();
      name = formData.get('name') as string;
      description = formData.get('description') as string;
      parentCategory = formData.get('parentCategory') || null;
      isActive = formData.get('isActive') === 'false' ? false : true;
      file = formData.get('image') as File;
    } else {
      const body = await req.json();
      name = body.name;
      description = body.description;
      parentCategory = body.parentCategory || null;
      isActive = body.isActive !== undefined ? body.isActive : true;
      imageUrl = body.imageUrl || "";
    }

    slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Validate parent category exists if provided
    if (parentCategory) {
      const parentCat = await Category.findById(parentCategory);
      if (!parentCat) {
        return NextResponse.json({ success: false, message: 'Parent category not found' }, { status: 400 });
      }
    }

    // Upload image if provided
    if (file && file instanceof File) {
      imageUrl = await uploadImage(file, 'category-images');
    }

    const category = new Category({
      name,
      description,
      parentCategory,
      isActive,
      slug,
      imageUrl
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
