# Luxury Perfume E-commerce Backend Setup Guide

## Overview
This is a complete Next.js API backend for a luxury perfume e-commerce platform. It includes user authentication, product management, shopping cart, orders, wishlist, contact system, blog, and admin panel functionality.

## Features
- ✅ JWT-based authentication
- ✅ User registration and login
- ✅ Product catalog with categories
- ✅ Shopping cart functionality
- ✅ Order processing system
- ✅ Wishlist management
- ✅ Contact form handling
- ✅ Blog system
- ✅ Admin panel with analytics
- ✅ Security features (rate limiting, CORS, input validation)
- ✅ MongoDB integration
- ✅ Comprehensive error handling

## Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Setup**
```bash
cp env.example .env.local
```

3. **Configure Environment Variables**
Edit `.env.local` with your configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/luxury-perfume-ecommerce
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/luxury-perfume-ecommerce

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# App Configuration
NODE_ENV=development
```

4. **Start Development Server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## Database Setup

### MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env.local`

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/luxury-perfume-ecommerce`

## API Testing

### Using curl

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get products:**
```bash
curl -X GET "http://localhost:3000/api/products?page=1&limit=10"
```

### Using Postman
1. Import the API collection (if available)
2. Set up environment variables
3. Test all endpoints

## Project Structure

```
├── app/api/                    # API routes
│   ├── auth/                   # Authentication endpoints
│   ├── products/               # Product management
│   ├── categories/             # Category management
│   ├── cart/                   # Shopping cart
│   ├── wishlist/               # Wishlist management
│   ├── orders/                 # Order processing
│   ├── contact/                # Contact form
│   ├── blog/                   # Blog system
│   └── admin/                  # Admin panel
├── lib/                        # Utility libraries
│   ├── models/                 # MongoDB schemas
│   ├── middleware/             # Custom middleware
│   └── utils/                  # Helper functions
├── components/                 # React components (existing)
└── public/                     # Static assets
```

## Key Files

### Database Models
- `lib/models/User.ts` - User schema with authentication
- `lib/models/Product.ts` - Product catalog
- `lib/models/Category.ts` - Product categories
- `lib/models/Cart.ts` - Shopping cart
- `lib/models/Order.ts` - Order processing
- `lib/models/Wishlist.ts` - User wishlist
- `lib/models/ContactMessage.ts` - Contact form
- `lib/models/BlogPost.ts` - Blog system

### Authentication
- `lib/auth.ts` - JWT utilities and middleware
- `app/api/auth/` - Login, register, profile endpoints

### Security
- `lib/middleware/rateLimiter.ts` - Rate limiting
- `lib/middleware/cors.ts` - CORS configuration
- `lib/middleware/security.ts` - Security headers
- `lib/utils/validation.ts` - Input validation

## Admin Setup

1. **Create Admin User**
Register a user normally, then manually update the database:
```javascript
// In MongoDB shell or compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

2. **Access Admin Features**
Use the admin endpoints with proper authentication:
- `/api/admin/stats` - Dashboard statistics
- `/api/admin/users` - User management
- `/api/admin/orders` - Order management

## Production Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically

### Other Platforms
1. Set up MongoDB Atlas
2. Configure environment variables
3. Deploy to your preferred platform

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/luxury-perfume-ecommerce
JWT_SECRET=your-production-secret-key
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Security Considerations

1. **JWT Secret**: Use a strong, random secret key
2. **MongoDB**: Use connection string with proper authentication
3. **CORS**: Configure allowed origins for production
4. **Rate Limiting**: Adjust limits based on your needs
5. **Input Validation**: All inputs are validated with Zod
6. **Password Hashing**: Uses bcrypt with salt rounds

## Monitoring and Logging

The API includes comprehensive error handling and logging:
- All errors are logged with timestamps
- Database errors are caught and handled gracefully
- Authentication failures are tracked
- Rate limiting violations are logged

## API Documentation

Complete API documentation is available in `API_DOCUMENTATION.md` with:
- All endpoints and their parameters
- Request/response examples
- Error codes and messages
- Authentication requirements

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your connection string
   - Ensure MongoDB is running
   - Verify network access (for Atlas)

2. **JWT Token Issues**
   - Check JWT_SECRET is set
   - Verify token format in requests
   - Check token expiration

3. **CORS Errors**
   - Configure allowed origins
   - Check preflight requests
   - Verify credentials setting

4. **Rate Limiting**
   - Check rate limit configuration
   - Monitor request frequency
   - Adjust limits if needed

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## Support

For issues or questions:
1. Check the API documentation
2. Review error logs
3. Test with curl or Postman
4. Check MongoDB connection and data

## Next Steps

1. Set up your MongoDB database
2. Configure environment variables
3. Test the API endpoints
4. Integrate with your frontend
5. Deploy to production

The backend is now ready for production use with all the features from your original PHP/MySQL system!
