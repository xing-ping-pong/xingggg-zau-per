import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactMessage from '@/lib/models/ContactMessage';
import { authenticateUser } from '@/lib/auth';
import { asyncHandler } from '@/lib/utils/errorHandler';

export const POST = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  await connectDB();

  const user = await authenticateUser(req as any);
  if (!user || !user.isAdmin) {
    return NextResponse.json({
      success: false,
      message: 'Admin access required'
    }, { status: 403 });
  }

  const { adminReply } = await req.json();

  if (!adminReply || adminReply.trim().length === 0) {
    return NextResponse.json({
      success: false,
      message: 'Reply message is required'
    }, { status: 400 });
  }

  const contactMessage = await ContactMessage.findByIdAndUpdate(
    params.id,
    {
      adminReply: adminReply.trim(),
      replyDate: new Date(),
      status: 'replied'
    },
    { new: true }
  ).populate('user', 'username email');

  if (!contactMessage) {
    return NextResponse.json({
      success: false,
      message: 'Contact message not found'
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'Reply sent successfully',
    data: { contactMessage }
  });
});
