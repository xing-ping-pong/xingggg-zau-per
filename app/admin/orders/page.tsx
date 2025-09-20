"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, Package, Truck, CheckCircle, XCircle, Clock, Search } from "lucide-react"

// Mock data - replace with actual data fetching
const mockOrders = [
  {
    id: 7,
    customerName: "Ayesha",
    customerEmail: "ayesha@example.com",
    date: "July 20, 2025, 10:52 pm",
    total: 69.5,
    paymentMethod: "Mastercard",
    status: "pending",
    items: [{ name: "Chanel No. 5", quantity: 1, price: 69.5 }],
  },
  {
    id: 6,
    customerName: "John Doe",
    customerEmail: "john@example.com",
    date: "July 19, 2025, 3:15 pm",
    total: 125.0,
    paymentMethod: "Visa",
    status: "processing",
    items: [{ name: "Dior Sauvage", quantity: 1, price: 125.0 }],
  },
  {
    id: 5,
    customerName: "Sarah Wilson",
    customerEmail: "sarah@example.com",
    date: "July 18, 2025, 11:30 am",
    total: 89.99,
    paymentMethod: "PayPal",
    status: "shipped",
    items: [{ name: "Tom Ford Black Orchid", quantity: 1, price: 89.99 }],
  },
  {
    id: 4,
    customerName: "Mike Johnson",
    customerEmail: "mike@example.com",
    date: "July 17, 2025, 2:45 pm",
    total: 199.99,
    paymentMethod: "Mastercard",
    status: "delivered",
    items: [{ name: "Creed Aventus", quantity: 1, price: 199.99 }],
  },
]

const statusOptions = [
  { value: "pending", label: "Pending", icon: Clock, color: "bg-yellow-900 text-yellow-300" },
  { value: "processing", label: "Processing", icon: Package, color: "bg-blue-900 text-blue-300" },
  { value: "shipped", label: "Shipped", icon: Truck, color: "bg-purple-900 text-purple-300" },
  { value: "delivered", label: "Delivered", icon: CheckCircle, color: "bg-green-900 text-green-300" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, color: "bg-red-900 text-red-300" },
  { value: "on hold", label: "On Hold", icon: Clock, color: "bg-gray-700 text-gray-300" },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const handleStatusChange = (orderId: number, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status)
    if (!statusConfig) return null

    const Icon = statusConfig.icon
    return (
      <Badge className={`${statusConfig.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    )
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-amber-400">Order Management</h1>
          <p className="text-gray-400 mt-1">Track and manage customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by customer name, email, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Orders</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-amber-400">Order Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Order #{selectedOrder?.id} - {selectedOrder?.customerName}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300">Name: {selectedOrder.customerName}</p>
                    <p className="text-gray-300">Email: {selectedOrder.customerEmail}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Order Information</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300">Date: {selectedOrder.date}</p>
                    <p className="text-gray-300">Payment: {selectedOrder.paymentMethod}</p>
                    <p className="text-gray-300">Status: {getStatusBadge(selectedOrder.status)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Order Items</h4>
                <div className="bg-gray-800 rounded-lg p-4">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0"
                    >
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-white font-semibold">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-700">
                    <p className="text-lg font-semibold text-white">Total:</p>
                    <p className="text-lg font-bold text-amber-400">${selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-amber-400">Orders</CardTitle>
          <CardDescription className="text-gray-400">Manage customer orders and update their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">Order ID</TableHead>
                <TableHead className="text-gray-300">Customer</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Total</TableHead>
                <TableHead className="text-gray-300">Payment</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-gray-800">
                  <TableCell className="text-white font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-white font-medium">{order.customerName}</p>
                      <p className="text-gray-400 text-sm">{order.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{order.date}</TableCell>
                  <TableCell className="text-white font-semibold">${order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-gray-300">{order.paymentMethod}</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                      <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                      className="border-gray-700 hover:bg-gray-800"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No orders found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
