const twilio = require('twilio');
require('dotenv').config({ path: '.env.local' });

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testIntegration() {
  console.log('🧪 Testing WhatsApp Integration...\n');

  // Test 1: Basic message
  console.log('1. Testing basic message...');
  try {
    const result = await client.messages.create({
      body: '🧪 Test message from ROSIA WhatsApp integration!',
      from: `whatsapp:${process.env.WHATSAPP_FROM_NUMBER}`,
      to: `whatsapp:${process.env.WHATSAPP_ADMIN_NUMBER}`
    });
    console.log('✅ Basic message:', result.status);
  } catch (error) {
    console.log('❌ Basic message failed:', error.message);
  }

  // Test 2: Order confirmation
  console.log('\n2. Testing order confirmation...');
  try {
    const orderMessage = `🛍️ *Order Confirmation - ROSIA Perfumes*

Order #TEST-001
Customer: Test Customer
Total: $99.99

Items:
• Test Perfume x1

Thank you for your order! We'll notify you when it ships.

Best regards,
ROSIA Team`;

    const result = await client.messages.create({
      body: orderMessage,
      from: `whatsapp:${process.env.WHATSAPP_FROM_NUMBER}`,
      to: `whatsapp:${process.env.WHATSAPP_ADMIN_NUMBER}`
    });
    console.log('✅ Order confirmation:', result.status);
  } catch (error) {
    console.log('❌ Order confirmation failed:', error.message);
  }

  // Test 3: Tracking notification
  console.log('\n3. Testing tracking notification...');
  try {
    const trackingMessage = `📦 *Tracking Update - ROSIA Perfumes*

Order #TEST-001
Tracking Number: TRK-123456
Carrier: Standard Shipping
Estimated Delivery: 2025-01-01

Track your order: https://rosia.vercel.app/track-order

Your order is on its way! 🚚

Best regards,
ROSIA Team`;

    const result = await client.messages.create({
      body: trackingMessage,
      from: `whatsapp:${process.env.WHATSAPP_FROM_NUMBER}`,
      to: `whatsapp:${process.env.WHATSAPP_ADMIN_NUMBER}`
    });
    console.log('✅ Tracking notification:', result.status);
  } catch (error) {
    console.log('❌ Tracking notification failed:', error.message);
  }

  console.log('\n🎉 WhatsApp integration test completed!');
  console.log('Check your WhatsApp for the test messages.');
}

testIntegration();
