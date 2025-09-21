import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductReview from '@/lib/models/ProductReview';
import Comment from '@/lib/models/Comment';
import Product from '@/lib/models/Product';
import Blog from '@/lib/models/Blog';

// POST /api/admin/bulk-import - Bulk import reviews or comments from CSV
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!type || !['reviews', 'comments'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid import type' },
        { status: 400 }
      );
    }
    
    // Read and parse CSV file
    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, message: 'CSV file must have at least a header and one data row' },
        { status: 400 }
      );
    }
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const dataRows = lines.slice(1);
    
    let results = {
      successCount: 0,
      errorCount: 0,
      errors: [] as string[]
    };
    
    if (type === 'reviews') {
      // Validate headers for reviews
      const requiredHeaders = ['productid', 'name', 'email', 'rating', 'title', 'comment'];
      const headerMap = {
        productId: -1,
        name: -1,
        email: -1,
        rating: -1,
        title: -1,
        comment: -1
      };
      
      headers.forEach((header, index) => {
        const lowerHeader = header.toLowerCase();
        if (requiredHeaders.includes(lowerHeader)) {
          headerMap[lowerHeader === 'productid' ? 'productId' : lowerHeader] = index;
        }
      });
      
      // Check if all required headers are present
      if (headerMap.productId === -1 || headerMap.name === -1 || headerMap.email === -1 || 
          headerMap.rating === -1 || headerMap.comment === -1) {
        return NextResponse.json(
          { success: false, message: 'Missing required headers. Required: productId, name, email, rating, comment' },
          { status: 400 }
        );
      }
      
      // Process each row
      for (let i = 0; i < dataRows.length; i++) {
        try {
          const row = dataRows[i];
          const values = parseCSVRow(row);
          
          if (values.length < headers.length) {
            results.errors.push(`Row ${i + 2}: Insufficient columns`);
            results.errorCount++;
            continue;
          }
          
          const productId = values[headerMap.productId]?.replace(/"/g, '').trim();
          const name = values[headerMap.name]?.replace(/"/g, '').trim();
          const email = values[headerMap.email]?.replace(/"/g, '').trim();
          const rating = parseInt(values[headerMap.rating]?.replace(/"/g, '').trim());
          const title = headerMap.title !== -1 ? values[headerMap.title]?.replace(/"/g, '').trim() : '';
          const comment = values[headerMap.comment]?.replace(/"/g, '').trim();
          
          // Validation
          if (!productId || !name || !email || !rating || !comment) {
            results.errors.push(`Row ${i + 2}: Missing required fields`);
            results.errorCount++;
            continue;
          }
          
          if (rating < 1 || rating > 5) {
            results.errors.push(`Row ${i + 2}: Rating must be between 1 and 5`);
            results.errorCount++;
            continue;
          }
          
          // Check if product exists
          const product = await Product.findById(productId);
          if (!product) {
            results.errors.push(`Row ${i + 2}: Product not found`);
            results.errorCount++;
            continue;
          }
          
          // Create review
          const review = new ProductReview({
            product: productId,
            name,
            email,
            rating,
            title: title || undefined,
            comment,
            status: 'approved'
          });
          
          await review.save();
          results.successCount++;
          
        } catch (error) {
          results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          results.errorCount++;
        }
      }
      
    } else if (type === 'comments') {
      // Validate headers for comments
      const requiredHeaders = ['blogid', 'name', 'email', 'content'];
      const headerMap = {
        blogId: -1,
        name: -1,
        email: -1,
        content: -1
      };
      
      headers.forEach((header, index) => {
        const lowerHeader = header.toLowerCase();
        if (requiredHeaders.includes(lowerHeader)) {
          headerMap[lowerHeader === 'blogid' ? 'blogId' : lowerHeader] = index;
        }
      });
      
      // Check if all required headers are present
      if (headerMap.blogId === -1 || headerMap.name === -1 || headerMap.email === -1 || headerMap.content === -1) {
        return NextResponse.json(
          { success: false, message: 'Missing required headers. Required: blogId, name, email, content' },
          { status: 400 }
        );
      }
      
      // Process each row
      for (let i = 0; i < dataRows.length; i++) {
        try {
          const row = dataRows[i];
          const values = parseCSVRow(row);
          
          if (values.length < headers.length) {
            results.errors.push(`Row ${i + 2}: Insufficient columns`);
            results.errorCount++;
            continue;
          }
          
          const blogId = values[headerMap.blogId]?.replace(/"/g, '').trim();
          const name = values[headerMap.name]?.replace(/"/g, '').trim();
          const email = values[headerMap.email]?.replace(/"/g, '').trim();
          const content = values[headerMap.content]?.replace(/"/g, '').trim();
          
          // Validation
          if (!blogId || !name || !email || !content) {
            results.errors.push(`Row ${i + 2}: Missing required fields`);
            results.errorCount++;
            continue;
          }
          
          // Check if blog exists
          const blog = await Blog.findById(blogId);
          if (!blog) {
            results.errors.push(`Row ${i + 2}: Blog not found`);
            results.errorCount++;
            continue;
          }
          
          // Create comment
          const comment = new Comment({
            blog: blogId,
            name,
            email,
            content,
            status: 'approved'
          });
          
          await comment.save();
          results.successCount++;
          
        } catch (error) {
          results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          results.errorCount++;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Import completed. ${results.successCount} items imported successfully.`,
      data: results
    });
    
  } catch (error) {
    console.error('Error in bulk import:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to import data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV row handling quoted values
function parseCSVRow(row: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}
