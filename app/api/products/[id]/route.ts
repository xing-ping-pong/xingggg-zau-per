import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Category, Product } from '@/lib/models';
import { addPerformanceHeaders } from '@/lib/utils/performance';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now();
  
  try {
    await connectDB();
    // Params may be a thenable; await if necessary to satisfy newer Next.js runtimes
    const resolvedParams = (params && typeof (params as any).then === 'function') ? await (params as any) : params;
    const product = await Product.findById(resolvedParams.id).populate('category', 'name');
    
    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      data: product
    });

    return addPerformanceHeaders(response, startTime);
  } catch (error) {
    console.error('Error in GET /api/products/[id]:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now();
  
  try {
    await connectDB();
    
    const body = await req.json();
    console.log('📥 API received data:', JSON.stringify(body, null, 2));
    console.log('🔍 Debug - body.stockQuantity:', body.stockQuantity);
    console.log('🔍 Debug - body.stock:', body.stock);
    
    // Map frontend field names to schema field names
    const updateData = {
      name: body.name,
      description: body.description,
      price: body.price,
      category: body.category ? new mongoose.Types.ObjectId(body.category) : null,
      stockQuantity: body.stockQuantity || body.stock || 0, // Use stockQuantity if available, fallback to stock
      isFeatured: body.featured,
      discount: body.discount,
      discountEndDate: body.discountEndDate ? new Date(body.discountEndDate) : null,
      imageUrl: body.imageUrl,
      images: body.images || [],
      fragranceNotes: body.fragranceNotes ?? { top: [], middle: [], base: [] },
      features: body.features ?? [],
    };
    
    console.log('📝 Mapped update data:', JSON.stringify(updateData, null, 2));
    
    const product = await Product.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Remove the old 'stock' and 'featured' fields if they exist
    if (product && (body.stock !== undefined || body.featured !== undefined)) {
      const unsetFields: any = {};
      if (body.stock !== undefined) unsetFields.stock = 1;
      if (body.featured !== undefined) unsetFields.featured = 1;
      
      await Product.findByIdAndUpdate(
        params.id,
        { $unset: unsetFields }
      );
    }
    
    console.log('📤 Updated product:', JSON.stringify(product, null, 2));
    
    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });

    return addPerformanceHeaders(response, startTime);
  } catch (error) {
    console.error('Error in PUT /api/products/[id]:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now();
  
  try {
    await connectDB();
    
    const product = await Product.findByIdAndDelete(params.id);
    
    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

    return addPerformanceHeaders(response, startTime);
  } catch (error) {
    console.error('Error in DELETE /api/products/[id]:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}