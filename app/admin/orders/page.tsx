"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Clock,
  Loader2,
  ArrowLeft,
  Printer
} from "lucide-react"
import Link from "next/link"
import NotificationPanel from "@/components/admin/notification-panel"

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
    productName: string
    quantity: number
    totalPrice: number
  }>
  pricing: {
    total: number
  }
  trackingNumber?: string
  estimatedDelivery?: string
  notifications?: {
    emailSent: boolean
    whatsappSent: boolean
    emailSentAt?: string
    whatsappSentAt?: string
    trackingEmailSent: boolean
    trackingWhatsappSent: boolean
    trackingEmailSentAt?: string
    trackingWhatsappSentAt?: string
  }
  createdAt: string
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'on_hold', label: 'On Hold' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/orders?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchOrders()
        setSelectedOrder(null)
      } else {
        alert(data.message || 'Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order')
    } finally {
      setUpdating(false)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock
      case 'confirmed': return CheckCircle
      case 'processing': return Package
      case 'shipped': return Truck
      case 'delivered': return CheckCircle
      case 'cancelled': return XCircle
      case 'on_hold': return Clock
      default: return Clock
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === "" || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.guestInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.guestInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.guestInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
            <p className="text-muted-foreground">
              Manage customer orders and track their status
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order number, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>
            Manage and track customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status)
                return (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.guestInfo.firstName} {order.guestInfo.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.guestInfo.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{order.items.length} item(s)</p>
                        <p className="text-muted-foreground">
                          {order.items[0]?.productName}
                          {order.items.length > 1 && ` +${order.items.length - 1} more`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      PKR {order.pricing.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {getStatusText(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem("token");
                              const response = await fetch(`/api/orders/${order._id}/print`, {
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              });
                              
                              if (response.ok) {
                                const html = await response.text();
                                const printWindow = window.open('', '_blank');
                                if (printWindow) {
                                  printWindow.document.write(html);
                                  printWindow.document.close();
                                  printWindow.print();
                                }
                              } else {
                                console.error('Failed to fetch print document');
                                alert('Failed to generate print document. Please try again.');
                              }
                            } catch (error) {
                              console.error('Error printing order:', error);
                              alert('Error printing order. Please try again.');
                            }
                          }}
                          title="Print Delivery Order"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Details - {selectedOrder.orderNumber}</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedOrder(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Status Update */}
              <div className="flex items-center space-x-4">
                <span className="font-medium">Update Status:</span>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => updateOrderStatus(selectedOrder._id, value)}
                  disabled={updating}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.slice(1).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updating && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Name:</strong> {selectedOrder.guestInfo.firstName} {selectedOrder.guestInfo.lastName}</p>
                    <p><strong>Email:</strong> {selectedOrder.guestInfo.email}</p>
                    <p><strong>Phone:</strong> {selectedOrder.guestInfo.phone}</p>
                  </div>
                  <div>
                    <p><strong>Address:</strong> {selectedOrder.guestInfo.address}</p>
                    <p><strong>City:</strong> {selectedOrder.guestInfo.city}</p>
                    <p><strong>Country:</strong> {selectedOrder.guestInfo.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span>{item.productName}</span>
                      <div className="text-right">
                        <p>Qty: {item.quantity}</p>
                        <p className="font-medium">PKR {item.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>PKR {selectedOrder.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Tracking Information */}
              {selectedOrder.trackingNumber && (
                <div>
                  <h3 className="font-semibold mb-2">Tracking Information</h3>
                  <p><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</p>
                  {selectedOrder.estimatedDelivery && (
                    <p><strong>Estimated Delivery:</strong> {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>
                  )}
                </div>
              )}

              {/* Notification Panel */}
              <NotificationPanel 
                order={selectedOrder} 
                onUpdate={() => {
                  fetchOrders()
                  // Don't close the modal, just refresh the data
                }}
                onOrderUpdate={(updatedOrder) => {
                  // Update the selected order with new data
                  setSelectedOrder(updatedOrder)
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
