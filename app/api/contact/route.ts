import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactMessage from '@/lib/models/ContactMessage';
const { WhatsAppService } = require('@/lib/services/whatsapp.js');

// POST /api/contact - Submit contact form
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/contact - Starting request');
    await connectDB();
    console.log('POST /api/contact - Database connected');

    const { name, email, phone, subject, category, message } = await req.json();
    
    console.log('POST /api/contact - Request data:', { 
      name, 
      email, 
      phone, 
      subject, 
      category, 
      messageLength: message?.length 
    });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.log('POST /api/contact - Missing required fields');
      return NextResponse.json({
        success: false,
        message: 'Name, email, subject, and message are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('POST /api/contact - Invalid email format');
      return NextResponse.json({
        success: false,
        message: 'Please enter a valid email address'
      }, { status: 400 });
    }

    // Create new contact message
    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || undefined,
      subject: subject.trim(),
      category: category || 'general',
      message: message.trim(),
      status: 'new',
      priority: getPriorityFromCategory(category)
    });

    console.log('POST /api/contact - Contact message created:', contactMessage._id);

    // Send WhatsApp notification to admin immediately
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const whatsappData = {
          name: contactMessage.name,
          email: contactMessage.email,
          subject: contactMessage.subject,
          category: contactMessage.category,
          message: contactMessage.message
        };
        
        await WhatsAppService.sendContactFormNotification(whatsappData);
        console.log('POST /api/contact - WhatsApp notification sent to admin');
      } else {
        console.log('POST /api/contact - WhatsApp credentials not configured, skipping notification');
      }
    } catch (whatsappError) {
      console.error('POST /api/contact - Error sending WhatsApp notification:', whatsappError);
      // Don't fail the request if WhatsApp fails
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully! We\'ll get back to you soon.',
      data: {
        id: contactMessage._id,
        status: contactMessage.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting contact message:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send message. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to determine priority based on category
function getPriorityFromCategory(category: string): 'low' | 'medium' | 'high' {
  switch (category) {
    case 'order':
    case 'shipping':
    case 'wholesale':
      return 'high';
    case 'return':
      return 'medium';
    default:
      return 'medium';
  }
}