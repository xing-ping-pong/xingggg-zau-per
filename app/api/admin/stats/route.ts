import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import Order from '@/lib/models/Order'
import Blog from '@/lib/models/Blog'
import Category from '@/lib/models/Category'
import BlogReview from '@/lib/models/BlogReview'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Fetch all statistics in parallel
    const [
      totalProducts,
      totalOrders,
      totalBlogs,
      totalCategories,
      orders,
      blogs,
      blogReviews
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Blog.countDocuments(),
      Category.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('items.productId', 'name'),
      Blog.find().sort({ publishedAt: -1 }).limit(10),
      BlogReview.find()
    ])

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.pricing?.total || 0)
    }, 0)

    // Calculate total views and likes from blogs
    const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0)
    const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)

    // Format recent orders
    const recentOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      guestInfo: {
        firstName: order.guestInfo?.firstName || 'Unknown',
        lastName: order.guestInfo?.lastName || 'Customer'
      },
      pricing: {
        total: order.pricing?.total || 0
      },
      status: order.status,
      createdAt: order.createdAt
    }))

    // Format recent blogs
    const recentBlogs = blogs.map(blog => ({
      _id: blog._id,
      title: blog.title,
      views: blog.views || 0,
      likes: blog.likes || 0,
      status: blog.status,
      publishedAt: blog.publishedAt || blog.createdAt
    }))

    const stats = {
      totalProducts,
      totalOrders,
      totalBlogs,
      totalCategories,
      totalRevenue,
      totalViews,
      totalLikes,
      recentOrders,
      recentBlogs
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    }, { status: 500 })
  }
}