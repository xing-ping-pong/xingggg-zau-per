const { WhatsAppService } = require('./lib/services/whatsapp.ts');
require('dotenv').config({ path: '.env.local' });

async function testWhatsAppIntegration() {
  console.log('🧪 Testing WhatsApp Integration...\n');

  // Test 1: Basic message
  console.log('1. Testing basic message...');
  try {
    const result = await WhatsAppService.sendMessage(
      process.env.WHATSAPP_ADMIN_NUMBER,
      '🧪 Test message from ROSIA WhatsApp integration!'
    );
    console.log('✅ Basic message:', result.success ? 'Sent' : 'Failed');
  } catch (error) {
    console.log('❌ Basic message failed:', error.message);
  }

  // Test 2: Order confirmation
  console.log('\n2. Testing order confirmation...');
  try {
    const orderData = {
      orderNumber: 'TEST-001',
      customerName: 'Test Customer',
      total: 99.99,
      items: [
        { name: 'Test Perfume', quantity: 1 }
      ]
    };
    
    const result = await WhatsAppService.sendOrderConfirmation(
      orderData,
      process.env.WHATSAPP_ADMIN_NUMBER
    );
    console.log('✅ Order confirmation:', result.success ? 'Sent' : 'Failed');
  } catch (error) {
    console.log('❌ Order confirmation failed:', error.message);
  }

  // Test 3: Tracking notification
  console.log('\n3. Testing tracking notification...');
  try {
    const trackingData = {
      orderNumber: 'TEST-001',
      trackingNumber: 'TRK-123456',
      carrier: 'Standard Shipping',
      estimatedDelivery: '2025-01-01',
      trackingUrl: 'https://rosia.vercel.app/track-order'
    };
    
    const result = await WhatsAppService.sendTrackingNotification(
      trackingData,
      process.env.WHATSAPP_ADMIN_NUMBER
    );
    console.log('✅ Tracking notification:', result.success ? 'Sent' : 'Failed');
  } catch (error) {
    console.log('❌ Tracking notification failed:', error.message);
  }

  // Test 4: Contact form notification
  console.log('\n4. Testing contact form notification...');
  try {
    const contactData = {
      name: 'Test Customer',
      email: 'test@example.com',
      subject: 'Test Inquiry',
      category: 'general',
      message: 'This is a test message from the contact form.'
    };
    
    const result = await WhatsAppService.sendContactFormNotification(contactData);
    console.log('✅ Contact form notification:', result.success ? 'Sent' : 'Failed');
  } catch (error) {
    console.log('❌ Contact form notification failed:', error.message);
  }

  console.log('\n🎉 WhatsApp integration test completed!');
  console.log('Check your WhatsApp for the test messages.');
}

testWhatsAppIntegration();
