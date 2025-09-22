const twilio = require('twilio');
require('dotenv').config({ path: '.env.local' });

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testSimpleWhatsApp() {
  try {
    console.log('🧪 Testing simple WhatsApp message...');
    console.log('From:', process.env.WHATSAPP_FROM_NUMBER);
    console.log('To:', process.env.WHATSAPP_ADMIN_NUMBER);
    
    const result = await client.messages.create({
      body: 'Hello! This is a test message from ROSIA. If you receive this, WhatsApp is working! 🎉',
      from: `whatsapp:${process.env.WHATSAPP_FROM_NUMBER}`,
      to: `whatsapp:${process.env.WHATSAPP_ADMIN_NUMBER}`
    });
    
    console.log('✅ Message sent successfully!');
    console.log('Message ID:', result.sid);
    console.log('Status:', result.status);
    console.log('Direction:', result.direction);
    
    if (result.status === 'queued') {
      console.log('📱 Message is queued. Check your WhatsApp in 1-2 minutes.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error code:', error.code);
  }
}

testSimpleWhatsApp();
