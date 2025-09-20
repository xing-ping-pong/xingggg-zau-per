import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Common validation schemas
export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username cannot exceed 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name cannot exceed 200 characters'),
  description: z.string().min(1, 'Product description is required'),
  price: z.number().min(0, 'Price cannot be negative'),
  originalPrice: z.number().min(0, 'Original price cannot be negative').optional(),
  imageUrl: z.string().url('Invalid image URL'),
  images: z.array(z.string().url()).optional(),
  category: z.string().min(1, 'Category is required'),
  stockQuantity: z.number().min(0, 'Stock quantity cannot be negative'),
  sku: z.string().optional(),
  weight: z.number().min(0, 'Weight cannot be negative').optional(),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0)
  }).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().max(60, 'Meta title cannot exceed 60 characters').optional(),
  metaDescription: z.string().max(160, 'Meta description cannot exceed 160 characters').optional()
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name cannot exceed 100 characters'),
  parentCategory: z.string().optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  isActive: z.boolean().optional()
});

export const contactMessageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Invalid email format'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject cannot exceed 200 characters'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message cannot exceed 2000 characters')
});

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt cannot exceed 500 characters').optional(),
  featuredImage: z.string().url('Invalid image URL').optional(),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  publishDate: z.string().datetime().optional(),
  metaTitle: z.string().max(60, 'Meta title cannot exceed 60 characters').optional(),
  metaDescription: z.string().max(160, 'Meta description cannot exceed 160 characters').optional()
});

export const orderSchema = z.object({
  items: z.array(z.object({
    product: z.string().min(1, 'Product ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1')
  })).min(1, 'At least one item is required'),
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().optional()
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().optional()
  }).optional(),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery']),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
});

// Validation middleware
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid request body'
      });
    }
  };
}

// Query validation
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters'
      });
    }
  };
}
