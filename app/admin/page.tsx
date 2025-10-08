"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, FileText, TrendingUp, DollarSign, Eye, Heart, Tag } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalBlogs: number
  totalCategories: number
  totalRevenue: number
  totalViews: number
  totalLikes: number
  recentOrders: Array<{
    _id: string
    orderNumber: string
    guestInfo: {
      firstName: string
      lastName: string
    }
    pricing: {
      total: number
    }
    status: string
    createdAt: string
  }>
  recentBlogs: Array<{
    _id: string
    title: string
    views: number
    likes: number
    status: string
    publishedAt: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      } else {
        console.error('Failed to fetch dashboard data:', data.message)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-900 text-yellow-300'
      case 'confirmed':
      case 'processing':
        return 'bg-blue-900 text-blue-300'
      case 'shipped':
        return 'bg-purple-900 text-purple-300'
      case 'delivered':
        return 'bg-green-900 text-green-300'
      case 'cancelled':
        return 'bg-red-900 text-red-300'
      case 'on_hold':
        return 'bg-orange-900 text-orange-300'
      case 'published':
        return 'bg-green-900 text-green-300'
      case 'draft':
        return 'bg-gray-700 text-gray-300'
      default:
        return 'bg-gray-700 text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-amber-400 mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800 animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-700 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-700 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-700 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-amber-400 mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Failed to load dashboard data</p>
        </div>
      </div>
    )
  }

  const statCards = [
    { 
      title: "Total Products", 
      value: stats.totalProducts.toString(), 
      icon: Package, 
      change: "Active products" 
    },
    { 
      title: "Total Orders", 
      value: stats.totalOrders.toString(), 
      icon: ShoppingCart, 
      change: "All time orders" 
    },
    { 
      title: "Total Revenue", 
      value: formatCurrency(stats.totalRevenue), 
      icon: DollarSign, 
      change: "Lifetime revenue" 
    },
    { 
      title: "Blog Posts", 
      value: stats.totalBlogs.toString(), 
      icon: FileText, 
      change: "Published articles" 
    },
    { 
      title: "Categories", 
      value: stats.totalCategories.toString(), 
      icon: Tag, 
      change: "Product categories" 
    },
    { 
      title: "Total Views", 
      value: stats.totalViews.toString(), 
      icon: Eye, 
      change: "Blog page views" 
    },
    { 
      title: "Total Likes", 
      value: stats.totalLikes.toString(), 
      icon: Heart, 
      change: "Blog likes received" 
    },
    { 
      title: "Avg Order Value", 
      value: stats.totalOrders > 0 ? formatCurrency(stats.totalRevenue / stats.totalOrders) : "PKR 0", 
      icon: TrendingUp, 
      change: "Per order average" 
    }
  ]

  return (
    <div className="space-y-8">
      {/*
      <div className="mb-4">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold shadow"
          onClick={async () => {
            if (confirm('Are you sure you want to delete ALL orders? This cannot be undone.')) {
              const res = await fetch('/api/admin/clear-orders', { method: 'POST' })
              const data = await res.json()
              if (data.success) {
                alert('All orders cleared!')
                window.location.reload()
              } else {
                alert('Failed to clear orders: ' + data.message)
              }
            }
          }}
        >
          Clear All Orders (Set Revenue to Zero)
        </button>
      </div>
     */ }
      <div>
        <h1 className="text-4xl font-playfair font-bold text-amber-400 mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Welcome to ZAU Admin Panel - Real-time data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-gray-900 border-gray-800 hover:border-amber-400/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-amber-400">Recent Orders</CardTitle>
            <CardDescription className="text-gray-400">Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                  className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
                >
                  <div>
                    <p className="font-medium text-white">
                        {order.orderNumber} - {order.guestInfo.firstName} {order.guestInfo.lastName}
                    </p>
                      <p className="text-sm text-gray-400">{formatCurrency(order.pricing.total)}</p>
                  </div>
                    <div className="text-right">
                  <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No orders yet</p>
              )}
                </div>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <Link 
                href="/admin/orders"
                className="text-amber-400 hover:text-amber-300 text-sm font-medium"
              >
                View all orders →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-amber-400">Recent Blog Posts</CardTitle>
            <CardDescription className="text-gray-400">Latest published articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentBlogs.length > 0 ? (
                stats.recentBlogs.slice(0, 5).map((blog) => (
                  <div key={blog._id} className="py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-white truncate">{blog.title}</p>
                    <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(blog.status)}`}
                      >
                        {blog.status}
                    </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>👁️ {blog.views} views</span>
                      <span>❤️ {blog.likes} likes</span>
                      <span>{formatDate(blog.publishedAt)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No blog posts yet</p>
              )}
                </div>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <Link 
                href="/admin/blogs"
                className="text-amber-400 hover:text-amber-300 text-sm font-medium"
              >
                View all blogs →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
