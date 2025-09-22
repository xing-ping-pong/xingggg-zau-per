"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  MessageCircle, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  Truck,
  Package
} from "lucide-react"
import { toast } from "sonner"

interface NotificationPanelProps {
  order: {
    _id: string
    orderNumber: string
    status: string
    guestInfo: {
      firstName: string
      lastName: string
      email: string
      phone: string
    }
    trackingNumber?: string
    carrier?: string
    trackingUrl?: string
    estimatedDelivery?: string
    notifications: {
      emailSent: boolean
      whatsappSent: boolean
      emailSentAt?: string
      whatsappSentAt?: string
      trackingEmailSent: boolean
      trackingWhatsappSent: boolean
      trackingEmailSentAt?: string
      trackingWhatsappSentAt?: string
    }
  }
  onUpdate: () => void
  onOrderUpdate?: (updatedOrder: any) => void
}

export default function NotificationPanel({ order, onUpdate, onOrderUpdate }: NotificationPanelProps) {
  const [loading, setLoading] = useState(false)
  const [trackingData, setTrackingData] = useState({
    trackingNumber: order.trackingNumber || '',
    carrier: order.carrier || 'Standard Shipping',
    estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : '',
    trackingUrl: order.trackingUrl || ''
  })

  const handleSendConfirmation = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${order._id}/notify/confirmation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sendEmail: true,
          sendWhatsapp: true
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Order confirmation sent successfully!')
        // Update the order data immediately
        if (onOrderUpdate && data.data?.order) {
          onOrderUpdate(data.data.order)
        }
        onUpdate()
      } else {
        toast.error(data.message || 'Failed to send confirmation')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendTracking = async () => {
    if (!trackingData.trackingNumber) {
      toast.error('Please enter a tracking number')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${order._id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...trackingData,
          sendEmail: true,
          sendWhatsapp: true
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Tracking notification sent successfully!')
        // Update the order data immediately
        if (onOrderUpdate && data.data?.order) {
          onOrderUpdate(data.data.order)
        }
        onUpdate()
      } else {
        toast.error(data.message || 'Failed to send tracking notification')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getNotificationStatus = (sent: boolean, sentAt?: string) => {
    if (sent) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Sent {sentAt ? new Date(sentAt).toLocaleDateString() : ''}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <XCircle className="h-4 w-4" />
        <span className="text-sm">Not sent</span>
      </div>
    )
  }

  // Safe access to notifications with defaults
  const notifications = order.notifications || {
    emailSent: false,
    whatsappSent: false,
    emailSentAt: undefined,
    whatsappSentAt: undefined,
    trackingEmailSent: false,
    trackingWhatsappSent: false,
    trackingEmailSentAt: undefined,
    trackingWhatsappSentAt: undefined
  }

  return (
    <div className="space-y-6">
      {/* Order Confirmation Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Confirmation Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Confirmation
              </Label>
              {getNotificationStatus(notifications.emailSent, notifications.emailSentAt)}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp Confirmation
              </Label>
              {getNotificationStatus(notifications.whatsappSent, notifications.whatsappSentAt)}
            </div>
          </div>
          
          <Button 
            onClick={handleSendConfirmation}
            disabled={loading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Order Confirmation
          </Button>
        </CardContent>
      </Card>

      {/* Tracking Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Tracking Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Tracking
              </Label>
              {getNotificationStatus(notifications.trackingEmailSent, notifications.trackingEmailSentAt)}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp Tracking
              </Label>
              {getNotificationStatus(notifications.trackingWhatsappSent, notifications.trackingWhatsappSentAt)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking Number *</Label>
                <Input
                  id="trackingNumber"
                  value={trackingData.trackingNumber}
                  onChange={(e) => setTrackingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  placeholder="Enter tracking number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carrier">Carrier</Label>
                <Select 
                  value={trackingData.carrier} 
                  onValueChange={(value) => setTrackingData(prev => ({ ...prev, carrier: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard Shipping">Standard Shipping</SelectItem>
                    <SelectItem value="Express Shipping">Express Shipping</SelectItem>
                    <SelectItem value="FedEx">FedEx</SelectItem>
                    <SelectItem value="UPS">UPS</SelectItem>
                    <SelectItem value="DHL">DHL</SelectItem>
                    <SelectItem value="USPS">USPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                <Input
                  id="estimatedDelivery"
                  type="date"
                  value={trackingData.estimatedDelivery}
                  onChange={(e) => setTrackingData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackingUrl">Tracking URL</Label>
                <Input
                  id="trackingUrl"
                  value={trackingData.trackingUrl}
                  onChange={(e) => setTrackingData(prev => ({ ...prev, trackingUrl: e.target.value }))}
                  placeholder="https://tracking.example.com/..."
                />
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleSendTracking}
            disabled={loading || !trackingData.trackingNumber}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Tracking Notification
          </Button>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <p className="text-sm text-muted-foreground">
                {order.guestInfo.firstName} {order.guestInfo.lastName}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-sm text-muted-foreground">{order.guestInfo.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Phone</Label>
              <p className="text-sm text-muted-foreground">{order.guestInfo.phone}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Order Status</Label>
              <Badge variant={order.status === 'shipped' ? 'default' : 'secondary'}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
