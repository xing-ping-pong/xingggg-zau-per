import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductQuestion from '@/lib/models/ProductQuestion';
import mongoose from 'mongoose';

// PUT /api/admin/questions/[id] - Update question (answer it, change status, etc.)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PUT /api/admin/questions/[id] - Starting request for ID:', params.id);
    await connectDB();
    console.log('PUT /api/admin/questions/[id] - Database connected');
    
    const { answer, status, isPublic } = await req.json();
    console.log('PUT /api/admin/questions/[id] - Request body:', { answer: !!answer, status, isPublic });
    
    // Find the question
    const question = await ProductQuestion.findById(params.id);
    if (!question) {
      console.log('PUT /api/admin/questions/[id] - Question not found');
      return NextResponse.json({
        success: false,
        message: 'Question not found'
      }, { status: 404 });
    }
    console.log('PUT /api/admin/questions/[id] - Question found:', question._id);
    
    // Update question
    const updateData: any = {};
    
    if (answer !== undefined) {
      updateData.answer = answer.trim();
      updateData.answeredAt = new Date();
      // Note: answeredBy will be null for now
      // In a real app, you'd get the admin user ID from the authenticated session
    }
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
    }
    
    console.log('PUT /api/admin/questions/[id] - Update data:', updateData);
    
    const updatedQuestion = await ProductQuestion.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('answeredBy', 'name email');
    
    console.log('PUT /api/admin/questions/[id] - Question updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
    
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update question',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/questions/[id] - Delete a question
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const question = await ProductQuestion.findByIdAndDelete(params.id);
    
    if (!question) {
      return NextResponse.json({
        success: false,
        message: 'Question not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete question',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
