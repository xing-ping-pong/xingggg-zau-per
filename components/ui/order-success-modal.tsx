"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Calendar, 
  ArrowRight,
  X,
  Sparkles
} from "lucide-react"
import Link from "next/link"

interface OrderSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  orderNumber: string
  orderId: string
  estimatedDelivery: string
  total: number
}

export function OrderSuccessModal({
  isOpen,
  onClose,
  orderNumber,
  orderId,
  estimatedDelivery,
  total
}: OrderSuccessModalProps) {
  // Modal stays open until user closes it manually

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 border-purple-500/20 text-white z-50">
        <DialogHeader>
          <DialogTitle className="sr-only">Order Confirmation</DialogTitle>
          <DialogDescription className="sr-only">
            Your order has been placed successfully
          </DialogDescription>
        </DialogHeader>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success Animation */}
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          {/* Success Icon with Animation */}
          <div className="relative">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-white">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-300">
              Thank you for choosing ZAU. Your order is being processed.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="w-full bg-black/30 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Order Number</span>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400">
                {orderNumber}
              </Badge>
            </div>

            <Separator className="bg-purple-500/20" />

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-xl font-bold text-white">PKR {total.toFixed(2)}</span>
            </div>

            <Separator className="bg-purple-500/20" />

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Payment Method</span>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-purple-400" />
                <span className="text-white">Cash on Delivery</span>
              </div>
            </div>

            <Separator className="bg-purple-500/20" />

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Estimated Delivery</span>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-white">{formatDate(estimatedDelivery)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0"
            >
              <Link href={`/order-tracking?orderNumber=${orderNumber}`}>
                <Package className="w-4 h-4 mr-2" />
                Track Order
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="flex-1 border-purple-400 text-purple-300 hover:bg-purple-500/20"
            >
              <Link href="/">
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              You will receive an email confirmation shortly.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
