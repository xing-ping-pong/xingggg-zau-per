import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload image to Cloudinary
export const uploadImage = async (file: File | Buffer, folder: string = 'perfume-store', publicId?: string): Promise<string> => {
  try {
    const uploadOptions: any = {
      folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    let uploadData: string;
    
    if (Buffer.isBuffer(file)) {
      // Convert Buffer to data URI
      const mimeType = 'image/jpeg'; // Default to JPEG
      const base64 = file.toString('base64');
      uploadData = `data:${mimeType};base64,${base64}`;
    } else {
      // For File objects, we need to convert to data URI
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      uploadData = `data:${file.type};base64,${base64}`;
    }

    const result = await cloudinary.uploader.upload(uploadData, uploadOptions);
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload multiple images
export const uploadMultipleImages = async (files: (File | Buffer)[], folder: string = 'perfume-store'): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw new Error('Failed to upload images');
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};

// Extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string | null => {
  const matches = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/);
  return matches ? matches[1] : null;
};

// Transform image URL for different sizes
export const getOptimizedImageUrl = (url: string, width?: number, height?: number, quality: string = 'auto'): string => {
  if (!url.includes('cloudinary.com')) {
    return url; // Return original URL if not a Cloudinary URL
  }

  const publicId = extractPublicId(url);
  if (!publicId) {
    return url;
  }

  let transformation = `q_${quality},f_auto`;
  if (width) transformation += `,w_${width}`;
  if (height) transformation += `,h_${height}`;

  return cloudinary.url(publicId, {
    transformation: [{ width, height, quality, fetch_format: 'auto' }]
  });
};
