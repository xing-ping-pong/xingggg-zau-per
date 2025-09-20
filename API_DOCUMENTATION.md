# Luxury Perfume E-commerce API Documentation

## Overview
This is a comprehensive Next.js API backend for a luxury perfume e-commerce platform built with MongoDB and JWT authentication.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /api/auth/profile
Get current user profile

#### PUT /api/auth/profile
Update user profile
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

### Products

#### GET /api/products
Get products with filtering and pagination
Query parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `category` (string): Category ID
- `search` (string): Search term
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort order (asc/desc, default: desc)
- `featured` (boolean): Featured products only
- `isActive` (boolean): Active products only (default: true)

#### GET /api/products/[id]
Get single product by ID

#### POST /api/products
Create new product (Admin only)
```json
{
  "name": "Luxury Perfume",
  "description": "A beautiful luxury perfume",
  "price": 99.99,
  "originalPrice": 129.99,
  "imageUrl": "https://example.com/image.jpg",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "category": "category_id",
  "stockQuantity": 100,
  "sku": "PERF-001",
  "weight": 0.5,
  "dimensions": {
    "length": 10,
    "width": 5,
    "height": 15
  },
  "tags": ["luxury", "perfume", "fragrance"],
  "isActive": true,
  "isFeatured": false,
  "metaTitle": "Luxury Perfume - Premium Fragrance",
  "metaDescription": "Discover our premium luxury perfume collection"
}
```

#### PUT /api/products/[id]
Update product (Admin only)

#### DELETE /api/products/[id]
Delete product (Admin only)

### Categories

#### GET /api/categories
Get categories
Query parameters:
- `isActive` (boolean): Active categories only (default: true)
- `parentOnly` (boolean): Parent categories only (default: false)

#### POST /api/categories
Create new category (Admin only)
```json
{
  "name": "Men's Fragrances",
  "parentCategory": "parent_category_id",
  "description": "Luxury men's fragrances",
  "isActive": true
}
```

### Cart

#### GET /api/cart
Get user's cart (Authentication required)

#### POST /api/cart
Add item to cart (Authentication required)
```json
{
  "productId": "product_id",
  "quantity": 2
}
```

#### PUT /api/cart/items/[productId]
Update cart item quantity (Authentication required)
```json
{
  "quantity": 3
}
```

#### DELETE /api/cart/items/[productId]
Remove item from cart (Authentication required)

### Wishlist

#### GET /api/wishlist
Get user's wishlist (Authentication required)

#### POST /api/wishlist
Add item to wishlist (Authentication required)
```json
{
  "productId": "product_id"
}
```

#### DELETE /api/wishlist/items/[productId]
Remove item from wishlist (Authentication required)

### Orders

#### GET /api/orders
Get user's orders (Authentication required)
Query parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Order status filter

#### POST /api/orders
Create new order (Authentication required)
```json
{
  "items": [
    {
      "product": "product_id",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "billingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "paymentMethod": "credit_card",
  "notes": "Please handle with care"
}
```

#### GET /api/orders/[id]
Get single order (Authentication required)

#### PUT /api/orders/[id]
Update order status (Authentication required)
```json
{
  "status": "cancelled",
  "trackingNumber": "TRK123456789"
}
```

### Contact

#### POST /api/contact
Send contact message
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Product Inquiry",
  "message": "I have a question about your products"
}
```

#### GET /api/contact
Get contact messages (Admin only)
Query parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Message status filter

#### POST /api/contact/[id]/reply
Reply to contact message (Admin only)
```json
{
  "adminReply": "Thank you for your message. We'll get back to you soon."
}
```

### Blog

#### GET /api/blog
Get blog posts
Query parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `tag` (string): Tag filter
- `published` (boolean): Published posts only (default: true)

#### POST /api/blog
Create blog post (Admin only)
```json
{
  "title": "The Art of Perfume Making",
  "content": "Blog post content here...",
  "excerpt": "Short excerpt...",
  "featuredImage": "https://example.com/image.jpg",
  "images": ["https://example.com/image1.jpg"],
  "tags": ["perfume", "art", "craft"],
  "isPublished": true,
  "publishDate": "2024-01-01T00:00:00.000Z",
  "metaTitle": "The Art of Perfume Making",
  "metaDescription": "Discover the fascinating world of perfume creation"
}
```

#### GET /api/blog/[slug]
Get single blog post by slug

#### PUT /api/blog/[slug]
Update blog post (Admin only)

#### DELETE /api/blog/[slug]
Delete blog post (Admin only)

### Admin

#### GET /api/admin/stats
Get admin dashboard statistics (Admin only)

#### GET /api/admin/users
Get all users (Admin only)
Query parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `isAdmin` (boolean): Filter by admin status

#### PUT /api/admin/users
Update user (Admin only)
```json
{
  "userId": "user_id",
  "isAdmin": true
}
```

#### DELETE /api/admin/users?userId=[id]
Delete user (Admin only)

#### GET /api/admin/orders
Get all orders (Admin only)
Query parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Order status filter
- `paymentStatus` (string): Payment status filter
- `search` (string): Search term

#### PUT /api/admin/orders
Update order (Admin only)
```json
{
  "orderId": "order_id",
  "status": "shipped",
  "trackingNumber": "TRK123456789",
  "notes": "Order shipped via FedEx"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API endpoints are protected with rate limiting to prevent abuse. Default limits:
- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Zod
- CORS protection
- Rate limiting
- SQL injection prevention (MongoDB)
- XSS protection
- CSRF protection

## Database Models

### User
- username (unique)
- email (unique)
- password (hashed)
- isAdmin (boolean)
- timestamps

### Product
- name, description, price
- imageUrl, images array
- category reference
- stockQuantity, sku
- weight, dimensions
- tags array
- isActive, isFeatured
- meta fields
- timestamps

### Category
- name, description
- parentCategory reference
- slug (unique)
- isActive
- timestamps

### Cart
- user reference
- items array (product, quantity, addedAt)
- timestamps

### Order
- user reference
- orderNumber (unique)
- items array with product details
- shipping/billing addresses
- payment information
- status, tracking
- timestamps

### Wishlist
- user reference
- items array (product, addedAt)
- timestamps

### ContactMessage
- name, email, subject, message
- user reference (optional)
- adminReply, replyDate
- status
- timestamps

### BlogPost
- title, slug, content
- excerpt, images
- author reference
- tags array
- isPublished, publishDate
- meta fields, viewCount
- timestamps

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

3. Start the development server:
```bash
npm run dev
```

4. The API will be available at `http://localhost:3000/api`

## Production Deployment

1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Configure environment variables for production
3. Deploy to Vercel, Netlify, or your preferred platform
4. Ensure all security measures are properly configured
