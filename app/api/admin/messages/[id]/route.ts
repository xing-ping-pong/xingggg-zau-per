import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactMessage from '@/lib/models/ContactMessage';
import { emailService } from '@/lib/services/email';
const { WhatsAppService } = require('@/lib/services/whatsapp.js');

// PUT /api/admin/messages/[id] - Update message status, reply, etc.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PUT /api/admin/messages/[id] - Starting request for ID:', params.id);
    await connectDB();
    console.log('PUT /api/admin/messages/[id] - Database connected');
    
    const { status, priority, reply, assignedTo } = await req.json();
    console.log('PUT /api/admin/messages/[id] - Request body:', { status, priority, reply: !!reply, assignedTo });
    
    // Find the message
    const message = await ContactMessage.findById(params.id);
    if (!message) {
      console.log('PUT /api/admin/messages/[id] - Message not found');
      return NextResponse.json({
        success: false,
        message: 'Message not found'
      }, { status: 404 });
    }
    console.log('PUT /api/admin/messages/[id] - Message found:', message._id);
    
    // Update message
    const updateData: any = {};
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    if (priority !== undefined) {
      updateData.priority = priority;
    }
    
    if (reply !== undefined) {
      updateData.reply = reply.trim();
      updateData.repliedAt = new Date();
      // Note: repliedBy will be null for now
      // In a real app, you'd get the admin user ID from the authenticated session
    }
    
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo;
    }
    
    console.log('PUT /api/admin/messages/[id] - Update data:', updateData);
    
    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('assignedTo', 'name email')
     .populate('repliedBy', 'name email');
    
    console.log('PUT /api/admin/messages/[id] - Message updated successfully');
    
    // Send email notification if this is a reply
    if (reply !== undefined && reply.trim()) {
      try {
        console.log('PUT /api/admin/messages/[id] - Sending email notification');
        console.log('PUT /api/admin/messages/[id] - Email details:', {
          to: updatedMessage.email,
          name: updatedMessage.name,
          subject: updatedMessage.subject,
          replyLength: reply.trim().length
        });
        const emailSent = await emailService.sendContactReply(
          updatedMessage.email,
          updatedMessage.name,
          updatedMessage.subject,
          reply.trim(),
          'ROSIA Support Team'
        );
        
        if (emailSent) {
          console.log('PUT /api/admin/messages/[id] - Email notification sent successfully');
        } else {
          console.warn('PUT /api/admin/messages/[id] - Email notification failed to send');
        }
      } catch (emailError) {
        console.error('PUT /api/admin/messages/[id] - Error sending email:', emailError);
        // Don't fail the request if email fails
      }

      // WhatsApp notification is now sent when the contact form is submitted, not when replying
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message updated successfully',
      data: updatedMessage
    });
    
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update message',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/messages/[id] - Delete a message
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
  
    const deletedMessage = await ContactMessage.findByIdAndDelete(id);
  
    if (!deletedMessage) {
      return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
    }
  
    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete message' }, { status: 500 });
  }
}
