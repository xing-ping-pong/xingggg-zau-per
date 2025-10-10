// WhatsApp Message Templates for Production
// These templates must be approved by Meta for WhatsApp Business API

const WHATSAPP_TEMPLATES = {
  // Order Confirmation Template
  order_confirmation: {
    name: 'order_confirmation',
    category: 'TRANSACTIONAL',
    language: 'en',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '🛍️ Order Confirmation - ZAU Perfumes'
      },
      {
        type: 'BODY',
        text: 'Hello {{1}}! Your order #{{2}} has been confirmed.\n\nTotal: {{3}}\nItems: {{4}}\n\nThank you for your order! We\'ll notify you when it ships.\n\nBest regards,\nZAU Team',
        example: {
          body_text: [
            ['John Doe', 'ORD-12345', 'PKR 2,500', 'Chanel No. 5 x1, Dior Sauvage x1']
          ]
        }
      }
    ]
  },

  // Tracking Update Template
  tracking_update: {
    name: 'tracking_update',
    category: 'TRANSACTIONAL',
    language: 'en',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '📦 Tracking Update - ZAU Perfumes'
      },
      {
        type: 'BODY',
        text: 'Your order #{{1}} is on its way!\n\nTracking Number: {{2}}\nCarrier: {{3}}\nEstimated Delivery: {{4}}\n\nTrack your order: {{5}}\n\nBest regards,\nZAU Team',
        example: {
          body_text: [
            ['ORD-12345', 'TRK-67890', 'TCS', '2024-01-15', 'https://track.tcs.com.pk/TRK-67890']
          ]
        }
      }
    ]
  },

  // Contact Form Notification Template
  contact_form_notification: {
    name: 'contact_form_notification',
    category: 'UTILITY',
    language: 'en',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '📧 New Contact Form - ZAU Perfumes'
      },
      {
        type: 'BODY',
        text: 'New contact form submission:\n\nFrom: {{1}}\nEmail: {{2}}\nSubject: {{3}}\nCategory: {{4}}\n\nMessage: {{5}}\n\nReply at: {{6}}',
        example: {
          body_text: [
            ['John Doe', 'john@example.com', 'Product Inquiry', 'General', 'I would like to know more about your products', 'https://zauperfumes.com/admin/messages']
          ]
        }
      }
    ]
  },

  // Delivery Confirmation Template
  delivery_confirmation: {
    name: 'delivery_confirmation',
    category: 'TRANSACTIONAL',
    language: 'en',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '✅ Delivery Confirmation - ZAU Perfumes'
      },
      {
        type: 'BODY',
        text: 'Order #{{1}} has been delivered!\n\nDelivery Date: {{2}}\nDelivery Address: {{3}}\n\nThank you for choosing ZAU Perfumes!\n\nBest regards,\nZAU Team',
        example: {
          body_text: [
            ['ORD-12345', '2024-01-15', '123 Main Street, Karachi, Pakistan']
          ]
        }
      }
    ]
  },

  // Payment Confirmation Template
  payment_confirmation: {
    name: 'payment_confirmation',
    category: 'TRANSACTIONAL',
    language: 'en',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '💳 Payment Confirmed - ZAU Perfumes'
      },
      {
        type: 'BODY',
        text: 'Your payment has been successfully processed!\n\nOrder #{{1}}\nPayment Method: {{2}}\nAmount: {{3}}\nTransaction ID: {{4}}\n\nBest regards,\nZAU Team',
        example: {
          body_text: [
            ['ORD-12345', 'Credit Card', 'PKR 2,500', 'TXN-67890']
          ]
        }
      }
    ]
  },

  // Order Status Update Template
  order_status_update: {
    name: 'order_status_update',
    category: 'TRANSACTIONAL',
    language: 'en',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '📋 Order Update - ZAU Perfumes'
      },
      {
        type: 'BODY',
        text: 'Your order #{{1}} status has been updated to: {{2}}\n\nAdditional Info: {{3}}\n\nThank you for your patience!\n\nBest regards,\nZAU Team',
        example: {
          body_text: [
            ['ORD-12345', 'Processing', 'Your order is being prepared for shipment']
          ]
        }
      }
    ]
  }
};

// Template validation and helper functions
class WhatsAppTemplateManager {
  constructor() {
    this.templates = WHATSAPP_TEMPLATES;
  }

  // Get template by name
  getTemplate(templateName) {
    return this.templates[templateName] || null;
  }

  // Get all available templates
  getAllTemplates() {
    return Object.keys(this.templates).map(name => ({
      name,
      ...this.templates[name]
    }));
  }

  // Validate template parameters
  validateTemplateParams(templateName, params) {
    const template = this.getTemplate(templateName);
    if (!template) {
      return { valid: false, error: 'Template not found' };
    }

    // Count required parameters in template body
    const bodyText = template.components.find(c => c.type === 'BODY')?.text || '';
    const requiredParams = (bodyText.match(/\{\{\d+\}\}/g) || []).length;

    if (Object.keys(params).length < requiredParams) {
      return { 
        valid: false, 
        error: `Template requires ${requiredParams} parameters, got ${Object.keys(params).length}` 
      };
    }

    return { valid: true };
  }

  // Generate template submission data for Twilio/Meta API
  generateTemplateSubmissionData(templateName) {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    return {
      name: template.name,
      category: template.category,
      language: template.language,
      components: template.components
    };
  }

  // Get template approval status (you'll need to implement this based on your API)
  async getTemplateApprovalStatus(templateName) {
    // This would typically make an API call to check template status
    // For now, return a mock status
    return {
      name: templateName,
      status: 'APPROVED', // PENDING, APPROVED, REJECTED
      lastModified: new Date().toISOString()
    };
  }

  // Format message with template parameters
  formatMessageWithParams(templateName, params) {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    const bodyComponent = template.components.find(c => c.type === 'BODY');
    if (!bodyComponent) {
      throw new Error('Template has no body component');
    }

    let formattedMessage = bodyComponent.text;
    
    // Replace parameters with values
    Object.keys(params).forEach((key, index) => {
      const placeholder = `{{${index + 1}}}`;
      formattedMessage = formattedMessage.replace(placeholder, params[key]);
    });

    return formattedMessage;
  }
}

module.exports = {
  WHATSAPP_TEMPLATES,
  WhatsAppTemplateManager
};
