"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/lib/contexts/toast-context"

interface OrderStatus {
  id: string
  status: string
  date: string
  description: string
  completed: boolean
}

interface OrderDetails {
  orderNumber: string
  status: string
  orderDate: string | Date
  estimatedDelivery: string | Date
  trackingNumber: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  shippingAddress: string
  statusHistory: OrderStatus[]
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()


  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orderNumber || !email) {
      showToast('Please enter both order number and email', 'error')
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderNumber, email }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setOrderDetails(data.data)
        showToast('Order found successfully!', 'success')
      } else {
        showToast(data.message || 'Order not found. Please check your order number and email.', 'error')
      }
    } catch (error) {
      console.error('Error tracking order:', error)
      showToast('Failed to track order. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Order Placed":
      case "Processing":
        return <Package className="w-5 h-5" />
      case "Shipped":
        return <Truck className="w-5 h-5" />
      case "Out for Delivery":
        return <Clock className="w-5 h-5" />
      case "Delivered":
        return <CheckCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Order Placed":
      case "Processing":
        return "bg-blue-500"
      case "Shipped":
        return "bg-yellow-500"
      case "Out for Delivery":
        return "bg-orange-500"
      case "Delivered":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Track Your Order
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Enter your order number and email address to track your package and see delivery updates.
            </p>
          </div>

          {/* Track Order Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Track Your Package</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Order Number *
                    </label>
                    <Input
                      placeholder="e.g., ROS-2024-001234"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Track Order
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Details */}
          {orderDetails && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-serif">Order Summary</CardTitle>
                    <Badge className={`${getStatusColor(orderDetails.status)} text-white`}>
                      {orderDetails.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Order Information</h4>
                      <p className="text-sm text-muted-foreground">
                        <strong>Order Number:</strong> {orderDetails.orderNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Order Date:</strong> {new Date(orderDetails.orderDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Estimated Delivery:</strong> {new Date(orderDetails.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Shipping Information</h4>
                      <p className="text-sm text-muted-foreground">
                        <strong>Tracking Number:</strong> {orderDetails.trackingNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Shipping Address:</strong> {orderDetails.shippingAddress}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-serif">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-foreground">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-3 border-t border-border">
                      <p className="text-lg font-semibold text-foreground">Total</p>
                      <p className="text-lg font-bold text-foreground">${orderDetails.total.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-serif">Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderDetails.statusHistory.map((status, index) => (
                      <div key={status.id} className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white ${
                          status.completed ? getStatusColor(status.status) : 'bg-gray-300'
                        }`}>
                          {getStatusIcon(status.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{status.status}</h4>
                            <span className="text-sm text-muted-foreground">
                              {new Date(status.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{status.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Help Section */}
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
                Need Help?
              </h3>
              <p className="text-muted-foreground mb-6">
                Can't find your order or having trouble tracking? We're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="/faq"
                  className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
                >
                  View FAQs
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
