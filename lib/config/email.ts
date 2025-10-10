// Email configuration
export const EMAIL_CONFIG = {
  // Base URL for assets (logo, etc.)
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://zauperfumes.com'),
  
  // Logo URL (normalized filename)
  LOGO_URL: `${process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://zauperfumes.com')}/logo.png`,
  
  // Email settings
  FROM_NAME: process.env.EMAIL_FROM_NAME || 'ZAU Perfumes',
  FROM_EMAIL: process.env.EMAIL_USER || '',
  
  // Company info
  COMPANY_NAME: 'ZAU Perfumes',
  COMPANY_YEAR: '2024'
};

export default EMAIL_CONFIG;
