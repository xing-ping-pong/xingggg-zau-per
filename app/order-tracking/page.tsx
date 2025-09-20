"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Loader2
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface Order {
  _id: string
  orderNumber: string
  status: string
  trackingNumber?: string
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
  items: Array<{
    productName: string
    productImage: string
    quantity: number
    totalPrice: number
  }>
  pricing: {
    total: number
  }
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
]

export default function OrderTrackingPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('orderNumber')
  const [searchOrderNumber, setSearchOrderNumber] = useState(orderNumber || '')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (orderNumber) {
      trackOrder(orderNumber)
    }
  }, [orderNumber])

  const trackOrder = async (orderNum: string) => {
    if (!orderNum.trim()) {
      setError("Please enter an order number")
      return
    }

    try {
      setLoading(true)
      setError("")
      
      const response = await fetch(`/api/orders?orderNumber=${orderNum}`)
      const data = await response.json()
      
      if (data.success && data.data.orders.length > 0) {
        setOrder(data.data.orders[0])
      } else {
        setError("Order not found. Please check your order number.")
      }
    } catch (err) {
      console.error('Error tracking order:', err)
      setError('Failed to track order. Please try again.')
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

  const getCurrentStepIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
              <p className="text-muted-foreground">
                Enter your order number to track your package
              </p>
            </div>

            {/* Search Form */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter order number (e.g., ORD-000001)"
                    value={searchOrderNumber}
                    onChange={(e) => setSearchOrderNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && trackOrder(searchOrderNumber)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => trackOrder(searchOrderNumber)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Track
                  </Button>
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            {order && (
              <div className="space-y-6">
                {/* Order Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Package className="h-5 w-5 mr-2" />
                          Order #{order.orderNumber}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Order Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {statusSteps.map((step, index) => {
                        const isActive = index <= getCurrentStepIndex(order.status)
                        const isCurrent = index === getCurrentStepIndex(order.status)
                        const StepIcon = step.icon

                        return (
                          <div key={step.key} className="flex items-center space-x-4">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              <StepIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <p className="text-sm text-muted-foreground">
                                  {order.status === 'shipped' && order.trackingNumber && 
                                    `Tracking: ${order.trackingNumber}`
                                  }
                                  {order.status === 'delivered' && order.deliveredAt && 
                                    `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}`
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
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
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${order.pricing.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Information */}
                {order.estimatedDelivery && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Estimated Delivery:</span>
                          <span>{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex justify-between">
                            <span>Tracking Number:</span>
                            <span className="font-mono">{order.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex justify-center space-x-4">
                  <Link href="/">
                    <Button variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Status
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
