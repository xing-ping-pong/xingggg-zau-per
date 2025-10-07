// Production seed script for Vercel deployment
// This script creates pages via API calls

const pages = [
  {
    slug: 'about-us',
    title: 'About Us',
    metaTitle: 'About ZAU Perfumes - Luxury Fragrance House',
    metaDescription: 'Discover the story behind ZAU Perfumes, a luxury fragrance house dedicated to creating sophisticated scents for the independent mind.',
    content: `<h2>Our Mission</h2>
<p>At ZAU Perfumes, we believe that fragrance is more than just a scent—it's a form of self-expression, a memory captured in a bottle, and a way to tell your unique story to the world.</p>

<h2>Our Philosophy</h2>
<p>Sophisticated simplicity for the independent mind. We craft luxury fragrances that celebrate individuality while maintaining the highest standards of quality and authenticity.</p>

<h2>Our Commitment</h2>
<p>Every bottle in our collection is carefully curated, using only the finest ingredients sourced from around the world. We work directly with renowned perfumers and independent artisans to ensure authenticity and exclusivity.</p>

<h2>Quality Assurance</h2>
<p>Our commitment to excellence extends beyond the products themselves. Every fragrance undergoes rigorous quality testing to guarantee that you receive only the finest, most authentic products.</p>`
  },
  {
    slug: 'our-story',
    title: 'Our Story',
    metaTitle: 'The Story of ZAU Perfumes - From Vision to Reality',
    metaDescription: 'Learn about the journey of ZAU Perfumes, from our founding vision to becoming a trusted name in luxury fragrances.',
    content: `<h2>The Beginning</h2>
<p>ZAU Perfumes was born from a simple yet powerful vision: to create fragrances that speak to the soul of the modern individual. Founded with the belief that luxury should be accessible yet exclusive, we set out to redefine what it means to wear a signature scent.</p>

<h2>Our Journey</h2>
<p>What started as a passion project has evolved into a carefully curated collection of the world's most exquisite fragrances. We've traveled the globe, working with master perfumers and discovering hidden gems in the world of luxury scents.</p>

<h2>Today</h2>
<p>Today, ZAU Perfumes stands as a testament to our commitment to quality, authenticity, and the art of perfumery. We continue to grow our collection while maintaining the personal touch that makes each purchase feel special.</p>

<h2>Looking Forward</h2>
<p>As we look to the future, we remain committed to our founding principles while embracing innovation and sustainability. Our journey is far from over, and we invite you to be part of our story.</p>`
  },
  {
    slug: 'sustainability',
    title: 'Sustainability',
    metaTitle: 'Sustainability at ZAU Perfumes - Our Environmental Commitment',
    metaDescription: 'Learn about ZAU Perfumes\' commitment to sustainability and environmental responsibility in luxury fragrance production.',
    content: `<h2>Our Environmental Commitment</h2>
<p>At ZAU Perfumes, we recognize our responsibility to protect the planet for future generations. Our commitment to sustainability is woven into every aspect of our business, from sourcing to packaging.</p>

<h2>Sustainable Sourcing</h2>
<p>We work exclusively with suppliers who share our environmental values. Our ingredients are sourced from sustainable farms and ethical suppliers who prioritize environmental protection and fair labor practices.</p>

<h2>Eco-Friendly Packaging</h2>
<p>Our packaging is designed with the environment in mind. We use recycled materials wherever possible and have eliminated unnecessary plastic from our shipping process. Our boxes are made from sustainably sourced materials and are fully recyclable.</p>

<h2>Carbon Neutral Shipping</h2>
<p>We offset the carbon footprint of all our shipments through verified carbon offset programs. This ensures that your luxury fragrance purchase doesn't come at the cost of our planet.</p>

<h2>Future Goals</h2>
<p>We're continuously working to reduce our environmental impact. Our goals include achieving carbon neutrality across our entire supply chain and developing even more sustainable packaging solutions.</p>`
  },
  {
    slug: 'press',
    title: 'Press',
    metaTitle: 'Press & Media - ZAU Perfumes in the News',
    metaDescription: 'Stay updated with the latest news, press releases, and media coverage about ZAU Perfumes and our luxury fragrance collection.',
    content: `<h2>Media Inquiries</h2>
<p>For media inquiries, press samples, or interview requests, please contact our press team at <a href="mailto:press@zauperfumes.com">press@zauperfumes.com</a>.</p>

<h2>Press Releases</h2>
<p>Stay updated with our latest announcements and product launches. Our press releases provide detailed information about new collections, partnerships, and company milestones.</p>

<h2>Brand Assets</h2>
<p>Media professionals can access our brand assets, including high-resolution images, logos, and brand guidelines, through our media kit.</p>

<h2>Recent Coverage</h2>
<p>ZAU Perfumes has been featured in leading fashion and lifestyle publications, recognized for our commitment to quality and innovation in the luxury fragrance industry.</p>

<h2>Contact Information</h2>
<p><strong>Press Contact:</strong> press@zauperfumes.com<br>
<strong>Phone:</strong> 03702987399<br></p>`
  },
  {
    slug: 'help-center',
    title: 'Help Center',
    metaTitle: 'Help Center - ZAU Perfumes Customer Support',
    metaDescription: 'Find answers to common questions about ZAU Perfumes products, orders, shipping, and more in our comprehensive help center.',
    content: `<h2>Frequently Asked Questions</h2>

<h3>How do I choose the right fragrance?</h3>
<p>Choosing the right fragrance is a personal journey. Consider your lifestyle, the occasions you'll wear it, and your personal preferences. Our detailed product descriptions and fragrance notes can help guide your decision.</p>

<h3>What if I don't like my purchase?</h3>
<p>We offer a 30-day return policy for unopened products. If you're not completely satisfied, you can return your purchase for a full refund or exchange.</p>

<h3>How long do fragrances last?</h3>
<p>Fragrance longevity varies depending on the concentration and your skin chemistry. Eau de Parfum typically lasts 6-8 hours, while Eau de Toilette lasts 4-6 hours.</p>

<h3>How should I store my fragrances?</h3>
<p>Store your fragrances in a cool, dry place away from direct sunlight. Avoid storing them in the bathroom due to humidity and temperature fluctuations.</p>

<h2>Contact Support</h2>
<p>Can't find what you're looking for? Our customer support team is here to help:</p>
<ul>
  <li><strong>Email:</strong> support@zauperfumes.com</li>
  <li><strong>Phone:</strong> 03702987399</li>
  <li><strong>Live Chat:</strong> Available Monday-Friday, 9 AM - 6 PM</li>
</ul>`
  },
  {
    slug: 'shipping-info',
    title: 'Shipping Information',
    metaTitle: 'Shipping Information - ZAU Perfumes Delivery Details',
    metaDescription: 'Learn about ZAU Perfumes shipping options, delivery times, and international shipping policies.',
    content: `<h2>Shipping Options</h2>

<h3>Standard Shipping</h3>
<p>Free standard shipping on all orders over PKR 5,000. Delivery within 3-5 business days for domestic orders.</p>

<h3>Express Shipping</h3>
<p>Express shipping available for PKR 500. Delivery within 1-2 business days for domestic orders.</p>

<h3>International Shipping</h3>
<p>We ship worldwide! International shipping rates vary by destination. Delivery times range from 7-14 business days depending on location.</p>

<h2>Shipping Restrictions</h2>
<p>Due to international regulations, some fragrances may not be available for shipping to certain countries. We'll notify you if your order is affected.</p>

<h2>Order Tracking</h2>
<p>Once your order ships, you'll receive a tracking number via email. You can track your package's progress in real-time.</p>

<h2>Delivery Instructions</h2>
<p>Please ensure someone is available to receive your package. If no one is available, the courier will attempt delivery again or leave the package at a safe location.</p>

<h2>Shipping Address</h2>
<p>Please double-check your shipping address before placing your order. We cannot be held responsible for packages delivered to incorrect addresses.</p>`
  },
  {
    slug: 'returns',
    title: 'Returns & Exchanges',
    metaTitle: 'Returns & Exchanges - ZAU Perfumes Return Policy',
    metaDescription: 'Learn about ZAU Perfumes return and exchange policy, including conditions, timeframes, and how to process returns.',
    content: `<h2>Return Policy</h2>
<p>We want you to be completely satisfied with your purchase. If you're not happy with your order, we offer a 30-day return policy for unopened products.</p>

<h2>Return Conditions</h2>
<ul>
  <li>Items must be unopened and in original packaging</li>
  <li>Returns must be initiated within 30 days of delivery</li>
  <li>Original receipt or order confirmation required</li>
  <li>Items must be in sellable condition</li>
</ul>

<h2>How to Return</h2>
<ol>
  <li>Contact our customer service team to initiate a return</li>
  <li>We'll provide you with a return authorization number</li>
  <li>Package your items securely in the original packaging</li>
  <li>Ship the package to our return address</li>
  <li>We'll process your refund once we receive the items</li>
</ol>

<h2>Refund Process</h2>
<p>Refunds will be processed within 5-7 business days after we receive your returned items. The refund will be issued to the original payment method.</p>

<h2>Exchanges</h2>
<p>We're happy to exchange items for a different size or product. Exchange requests are subject to the same conditions as returns.</p>

<h2>Return Shipping</h2>
<p>Return shipping costs are the responsibility of the customer unless the return is due to our error or a defective product.</p>`
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy - ZAU Perfumes Data Protection',
    metaDescription: 'Read ZAU Perfumes privacy policy to understand how we collect, use, and protect your personal information.',
    content: `<h2>Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>

<h3>Personal Information</h3>
<ul>
  <li>Name and contact information</li>
  <li>Billing and shipping addresses</li>
  <li>Payment information</li>
  <li>Account credentials</li>
</ul>

<h3>Usage Information</h3>
<ul>
  <li>Website usage data</li>
  <li>Device information</li>
  <li>IP address and location data</li>
  <li>Cookies and similar technologies</li>
</ul>

<h2>How We Use Your Information</h2>
<p>We use your information to:</p>
<ul>
  <li>Process and fulfill your orders</li>
  <li>Provide customer support</li>
  <li>Send you marketing communications (with your consent)</li>
  <li>Improve our website and services</li>
  <li>Comply with legal obligations</li>
</ul>

<h2>Information Sharing</h2>
<p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>

<h2>Data Security</h2>
<p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

<h2>Your Rights</h2>
<p>You have the right to access, update, or delete your personal information. You can also opt out of marketing communications at any time.</p>

<h2>Contact Us</h2>
<p>If you have questions about this privacy policy, please contact us at <a href="mailto:privacy@zauperfumes.com">privacy@zauperfumes.com</a>.</p>`
  },
  {
    slug: 'terms-conditions',
    title: 'Terms & Conditions',
    metaTitle: 'Terms & Conditions - ZAU Perfumes Legal Terms',
    metaDescription: 'Read ZAU Perfumes terms and conditions to understand the legal terms governing your use of our website and services.',
    content: `<h2>Acceptance of Terms</h2>
<p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>

<h2>Use License</h2>
<p>Permission is granted to temporarily download one copy of the materials on ZAU Perfumes' website for personal, non-commercial transitory viewing only.</p>

<h2>Product Information</h2>
<p>We strive to provide accurate product information, but we cannot guarantee that all product descriptions, images, or other content is accurate, complete, or current.</p>

<h2>Pricing and Payment</h2>
<p>All prices are subject to change without notice. Payment must be received before order processing and shipment.</p>

<h2>Shipping and Delivery</h2>
<p>Shipping times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers or customs.</p>

<h2>Returns and Refunds</h2>
<p>Returns are subject to our return policy. Refunds will be processed according to the original payment method.</p>

<h2>Intellectual Property</h2>
<p>The content on this website, including text, graphics, logos, and images, is the property of ZAU Perfumes and is protected by copyright laws.</p>

<h2>Limitation of Liability</h2>
<p>In no event shall ZAU Perfumes be liable for any damages arising out of the use or inability to use the materials on this website.</p>

<h2>Governing Law</h2>
<p>These terms and conditions are governed by and construed in accordance with the laws of Pakistan.</p>`
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    metaTitle: 'Cookie Policy - ZAU Perfumes Cookie Usage',
    metaDescription: 'Learn about how ZAU Perfumes uses cookies and similar technologies to enhance your browsing experience.',
    content: `<h2>What Are Cookies</h2>
<p>Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.</p>

<h2>Types of Cookies We Use</h2>

<h3>Essential Cookies</h3>
<p>These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.</p>

<h3>Analytics Cookies</h3>
<p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>

<h3>Marketing Cookies</h3>
<p>These cookies are used to track visitors across websites to display relevant and engaging advertisements.</p>

<h2>How We Use Cookies</h2>
<ul>
  <li>To remember your preferences and settings</li>
  <li>To analyze website traffic and usage patterns</li>
  <li>To provide personalized content and advertisements</li>
  <li>To improve website functionality and user experience</li>
</ul>

<h2>Managing Cookies</h2>
<p>You can control and manage cookies through your browser settings. However, disabling certain cookies may affect the functionality of our website.</p>

<h2>Third-Party Cookies</h2>
<p>We may use third-party services that set their own cookies. These services have their own privacy policies and cookie practices.</p>

<h2>Updates to This Policy</h2>
<p>We may update this cookie policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>`
  }
]

// Function to create pages via API
async function createPages() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zauperfumes.com'
  
  console.log('🚀 Starting page creation process...')
  console.log(`📍 Base URL: ${baseUrl}`)

  let hadErrors = false

  for (const pageData of pages) {
    try {
      console.log(`📝 Creating page: ${pageData.title}`)
      
      const response = await fetch(`${baseUrl}/api/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, you'll need to get an admin token
          // 'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(pageData)
      })

      const result = await response.json()
      
      if (result.success) {
        console.log(`✅ Successfully created: ${pageData.title}`)
      } else {
        console.error(`❌ Failed to create ${pageData.title}:`, result.message)
        hadErrors = true
        if (result.message?.includes('already exists')) {
          console.log(`ℹ️  Page ${pageData.title} already exists, skipping...`)
        }
      }
    } catch (error) {
      console.error(`❌ Error creating ${pageData.title}:`, error.message)
      hadErrors = true
    }
  }

  if (hadErrors) {
    throw new Error('One or more page creation operations failed')
  }
}

// Run the script
createPages()
  .then(() => {
    console.log('🎉 Page creation process completed!')
    console.log('📋 Next steps:')
    console.log('1. Log in as admin')
    console.log('2. Go to /admin/pages')
    console.log('3. Create any missing pages manually')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
