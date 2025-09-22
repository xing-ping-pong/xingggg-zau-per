const twilio = require('twilio');
require('dotenv').config({ path: '.env.local' });

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testWhatsApp() {
  try {
    console.log('Testing WhatsApp connection...');
    console.log('From:', process.env.WHATSAPP_FROM_NUMBER);
    console.log('To:', process.env.WHATSAPP_ADMIN_NUMBER);
    
    const result = await client.messages.create({
      body: 'Test message from ROSIA! 🛍️\n\nThis is a test to verify WhatsApp integration is working correctly.',
      from: `whatsapp:${process.env.WHATSAPP_FROM_NUMBER}`,
      to: `whatsapp:${process.env.WHATSAPP_ADMIN_NUMBER}`
    });
    
    console.log('✅ WhatsApp message sent successfully!');
    console.log('Message ID:', result.sid);
    console.log('Status:', result.status);
  } catch (error) {
    console.error('❌ WhatsApp error:', error.message);
    console.error('Error code:', error.code);
  }
}

testWhatsApp();
