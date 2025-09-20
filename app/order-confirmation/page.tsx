"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  ArrowLeft,
  Loader2
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface Order {
  _id: string
  orderNumber: string
  status: string
  guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    zipCode: string
    country: string
  }
  items: Array<{
    productId: string
    productName: string
    productImage: string
    quantity: number
    price: number
    discount: number
    totalPrice: number
  }>
  pricing: {
    subtotal: number
    shipping: number
    tax: number
    couponDiscount?: number
    couponCode?: string
    total: number
  }
  trackingNumber?: string
  estimatedDelivery?: string
  createdAt: string
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    } else {
      setError("No order ID provided")
      setLoading(false)
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()
      
      if (data.success) {
        setOrder(data.data)
      } else {
        setError(data.message || 'Failed to fetch order')
      }
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'confirmed': return 'bg-blue-500'
      case 'processing': return 'bg-purple-500'
      case 'shipped': return 'bg-indigo-500'
      case 'delivered': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      case 'on_hold': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'confirmed': return 'Confirmed'
      case 'processing': return 'Processing'
      case 'shipped': return 'Shipped'
      case 'delivered': return 'Delivered'
      case 'cancelled': return 'Cancelled'
      case 'on_hold': return 'On Hold'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading order details...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Link href="/">
                  <Button>Return Home</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Order Summary</span>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Order Number:</span>
                      <span className="font-mono">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Order Date:</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="font-medium">Tracking Number:</span>
                        <span className="font-mono">{order.trackingNumber}</span>
                      </div>
                    )}
                    {order.estimatedDelivery && (
                      <div className="flex justify-between">
                        <span className="font-medium">Estimated Delivery:</span>
                        <span>{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <img
                          src={item.productImage || "/placeholder.svg"}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.productName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                          {item.discount > 0 && (
                            <p className="text-sm text-green-600">
                              {item.discount}% off
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">
                      {order.guestInfo.firstName} {order.guestInfo.lastName}
                    </p>
                    <p>{order.guestInfo.address}</p>
                    <p>
                      {order.guestInfo.city}, {order.guestInfo.zipCode}
                    </p>
                    <p>{order.guestInfo.country}</p>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span className="text-sm">{order.guestInfo.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="text-sm">{order.guestInfo.email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Total & Actions */}
            <div className="space-y-6">
              {/* Order Total */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${order.pricing.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>
                        {order.pricing.shipping === 0 ? 'Free' : `$${order.pricing.shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${order.pricing.tax.toFixed(2)}</span>
                    </div>
                    {order.pricing.couponDiscount && order.pricing.couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount ({order.pricing.couponCode})</span>
                        <span>-${order.pricing.couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${order.pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Truck className="h-5 w-5 text-primary" />
                    <span>Cash on Delivery</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pay when your order arrives
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Link href={`/order-tracking?orderNumber=${order.orderNumber}`} className="block">
                  <Button className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    Track Order
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
