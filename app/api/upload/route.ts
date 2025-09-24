import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { authenticateUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await authenticateUser(req as any);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const folder = 'perfume-store/products';

    // Upload to Cloudinary with unique name
    const imageUrl = await uploadImage(buffer, folder, `${timestamp}-${randomId}`);

    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        publicId: extractPublicId(imageUrl),
        filename: file.name,
        size: file.size
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to extract public ID from Cloudinary URL
function extractPublicId(url: string): string | null {
  const matches = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/);
  return matches ? matches[1] : null;
}
