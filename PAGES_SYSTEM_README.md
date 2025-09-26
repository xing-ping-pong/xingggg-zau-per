# ZAU Perfumes - Dynamic Pages System

## Overview

This system provides a complete solution for managing dynamic, admin-editable pages on the ZAU Perfumes website. All pages are stored in MongoDB and can be easily managed through the admin interface.

## Features

- ✅ **Dynamic Page Creation**: Create unlimited pages with custom content
- ✅ **Admin Interface**: Full CRUD operations through admin panel
- ✅ **SEO Optimized**: Meta titles, descriptions, and canonical URLs
- ✅ **HTML Content Support**: Rich content with HTML formatting
- ✅ **Active/Inactive Status**: Control page visibility
- ✅ **Vercel Compatible**: Works seamlessly on Vercel deployment
- ✅ **Responsive Design**: Mobile-friendly page layouts

## Pages Created

### Quick Links
- **About Us** (`/about-us`) - Company mission and philosophy
- **Our Story** (`/our-story`) - Brand history and journey
- **Sustainability** (`/sustainability`) - Environmental commitment
- **Press** (`/press`) - Media inquiries and press releases

### Customer Care
- **Help Center** (`/help-center`) - FAQ and customer support
- **Shipping Info** (`/shipping-info`) - Delivery and shipping details
- **Returns** (`/returns`) - Return and exchange policy
- **Contact Us** (`/contact`) - Contact information (existing page)

### Legal Pages
- **Privacy Policy** (`/privacy-policy`) - Data protection policy
- **Terms & Conditions** (`/terms-conditions`) - Legal terms
- **Cookie Policy** (`/cookie-policy`) - Cookie usage policy

## Technical Implementation

### Database Model
```typescript
interface IPage {
  slug: string          // URL-friendly identifier
  title: string         // Page title
  content: string       // HTML content
  metaTitle?: string    // SEO title
  metaDescription?: string // SEO description
  isActive: boolean     // Visibility status
  createdAt: Date
  updatedAt: Date
}
```

### API Endpoints

#### GET `/api/pages`
- **Purpose**: Fetch all pages
- **Query Params**: `?active=true` (filter active pages only)
- **Response**: Array of pages with metadata

#### GET `/api/pages/[slug]`
- **Purpose**: Fetch specific page by slug
- **Query Params**: `?includeInactive=true` (include inactive pages)
- **Response**: Single page object

#### POST `/api/pages` (Admin Only)
- **Purpose**: Create new page
- **Body**: Page object with required fields
- **Auth**: Bearer token required

#### PUT `/api/pages/[slug]` (Admin Only)
- **Purpose**: Update existing page
- **Body**: Partial page object
- **Auth**: Bearer token required

#### DELETE `/api/pages/[slug]` (Admin Only)
- **Purpose**: Delete page
- **Auth**: Bearer token required

### Dynamic Routing
- **Route**: `/[slug]`
- **Purpose**: Serve any page by slug
- **Features**: 
  - Automatic metadata generation
  - SEO optimization
  - 404 handling for non-existent pages
  - Static generation for known pages

### Admin Interface
- **Location**: `/admin/pages`
- **Features**:
  - List all pages with status indicators
  - Create new pages with form validation
  - Edit existing pages with live preview
  - Delete pages with confirmation
  - Toggle active/inactive status
  - HTML content editor

## Setup Instructions

### 1. Database Setup
The pages will be automatically created when you first access the admin interface or run the seed script.

### 2. Seed Initial Data (Optional)
```bash
# For local development (requires MongoDB running)
node scripts/seed-pages.js

# For Vercel deployment (requires ADMIN_TOKEN)
node scripts/seed-pages-vercel.js
```

### 3. Environment Variables
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_BASE_URL=https://your-domain.com
ADMIN_TOKEN=your_admin_token_for_seeding
```

### 4. Admin Access
1. Log in as admin user
2. Navigate to `/admin/pages`
3. Create, edit, or manage pages

## Content Guidelines

### HTML Content Formatting
Pages support HTML content with the following recommended structure:

```html
<h2>Section Title</h2>
<p>Paragraph content with <a href="#">links</a>.</p>

<h3>Subsection</h3>
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>

<ol>
  <li>Numbered item 1</li>
  <li>Numbered item 2</li>
</ol>
```

### SEO Best Practices
- **Meta Title**: 50-60 characters, include brand name
- **Meta Description**: 120-160 characters, compelling summary
- **Content**: Use proper heading hierarchy (h2, h3)
- **Links**: Include relevant internal and external links

## Deployment on Vercel

### 1. Environment Variables
Set the following in Vercel dashboard:
- `MONGODB_URI`
- `NEXT_PUBLIC_BASE_URL`
- `ADMIN_TOKEN` (for seeding)

### 2. Build Configuration
The system is fully compatible with Vercel's serverless functions and static generation.

### 3. Database Connection
Uses MongoDB Atlas or any MongoDB-compatible database service.

## Maintenance

### Adding New Pages
1. Access admin panel at `/admin/pages`
2. Click "Add New Page"
3. Fill in required fields:
   - Slug (URL-friendly, unique)
   - Title
   - Content (HTML)
   - Meta title and description (optional)
4. Save the page

### Updating Existing Pages
1. Find the page in admin panel
2. Click edit button
3. Modify content as needed
4. Save changes

### Content Management Tips
- Use consistent HTML structure
- Include relevant keywords for SEO
- Keep content updated and accurate
- Test pages on mobile devices
- Use proper heading hierarchy

## Troubleshooting

### Common Issues

1. **Page not found (404)**
   - Check if page is marked as active
   - Verify slug is correct
   - Ensure page exists in database

2. **Admin access denied**
   - Verify user has admin privileges
   - Check authentication token
   - Ensure proper login

3. **Content not displaying**
   - Check HTML syntax
   - Verify content field is not empty
   - Check for JavaScript errors

### Support
For technical issues, check:
1. Browser console for errors
2. Network tab for API failures
3. Database connection status
4. Environment variables

## Future Enhancements

Potential improvements:
- Rich text editor (WYSIWYG)
- Page templates
- Bulk operations
- Version history
- Content scheduling
- Multi-language support
- Page analytics
- Custom CSS injection

---

**Note**: This system is production-ready and fully compatible with Vercel deployment. All pages are automatically optimized for SEO and mobile devices.
