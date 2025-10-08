"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Trash2, ShoppingBag, Truck, Tag, User, Mail, Phone, MapPin, ChevronRight, Loader2 } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OrderSuccessModal } from "@/components/ui/order-success-modal"
import { useToast, ToastProvider } from "@/components/ui/toast"
import Link from "next/link"

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  stockQuantity: number;
  imageUrl: string;
  category: {
    _id: string;
    name: string;
  };
  cartQuantity: number;
}

function CartPageContent() {
  const { addToast } = useToast()
  const { cartItems, removeFromCart, updateCartQuantity, clearCart, isInCart, getCartQuantity } = useCart()
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    deliveryRemarks: ''
  })
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: '',
    orderId: '',
    estimatedDelivery: '',
    total: 0
  })



  // Fetch product details for cart items
  useEffect(() => {
    const fetchCartProducts = async () => {
      console.log('Cart items:', cartItems)
      
      if (cartItems.length === 0) {
        setProducts([]) // Clear products when cart is empty
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log('Fetching products for cart items:', cartItems.map(item => item.productId))
        
        const productPromises = cartItems.map(async (cartItem) => {
          try {
            console.log(`Fetching product ${cartItem.productId}`)
            const response = await fetch(`/api/products/${cartItem.productId}`)
            const data = await response.json()
            console.log(`Product ${cartItem.productId} response:`, data)
            
            if (data.success) {
              return { ...data.data, cartQuantity: cartItem.quantity }
            } else {
              console.error(`Failed to fetch product ${cartItem.productId}:`, data.message)
              return null
            }
          } catch (error) {
            console.error(`Error fetching product ${cartItem.productId}:`, error)
            return null
          }
        })

        const products = await Promise.all(productPromises)
        const validProducts = products.filter(Boolean)
        console.log('Valid products found:', validProducts.length, 'out of', cartItems.length)
        setProducts(validProducts)
      } catch (error) {
        console.error('Error fetching cart products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCartProducts()
  }, [cartItems])

  // Calculate totals
  const subtotal = products.reduce((sum, product) => {
    if (!product) return sum;
    const discountedPrice = product.discount > 0 
      ? product.price - (product.price * product.discount / 100)
      : product.price
    return sum + (discountedPrice * product.cartQuantity)
  }, 0)

  const shipping = subtotal > 100 ? 0 : 15
  const tax = subtotal * 0.08
  const couponSavings = couponApplied ? (subtotal * couponDiscount / 100) : 0
  const total = subtotal + shipping + tax - couponSavings

  const handleRemoveFromCart = (productId: string) => {
    removeFromCart(productId)
  }

  const handleApplyCoupon = async () => {
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: couponCode,
          orderTotal: subtotal 
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCouponDiscount(data.discount)
        setCouponApplied(true)
        addToast({
          type: 'success',
          title: 'Coupon Applied!',
          description: `You saved ${data.discount}% on your order`,
          duration: 4000,
          simple: false
        })
      } else {
        addToast({
          type: 'error',
          title: data.message || 'This coupon code is invalid or expired',
          duration: 4000,
          simple: true
        })
      }
    } catch (error) {
      console.error('Error applying coupon:', error)
      addToast({
        type: 'error',
        title: 'Failed to apply coupon. Please try again.',
        duration: 4000,
        simple: true
      })
    }
  }

  const handleModalClose = () => {
    // Clear cart and reset form when modal is closed
    clearCart()
    
    // Reset form
    setGuestInfo({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      country: '',
      deliveryRemarks: ''
    })
    setCouponCode('')
    setCouponApplied(false)
    setCouponDiscount(0)
    
    // Close modal
    setShowSuccessModal(false)
  }

  // Function to clear cart and localStorage (for debugging database migration issues)
  const handleClearCart = async () => {
    try {
      await clearCart()
      localStorage.removeItem('cart')
      window.location.reload()
    } catch (error) {
      console.error('Error clearing cart:', error)
      alert('Error clearing cart. Please try again.')
    }
  }

  const handleCheckout = async () => {
    // Validate guest information
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode', 'country']
    const missingFields = requiredFields.filter(field => !guestInfo[field as keyof typeof guestInfo])
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`)
      return
    }

    if (products.length === 0) {
      alert('Your cart is empty')
      return
    }

    try {
      setSaving(true)

      // Prepare order data
      const orderData = {
        guestInfo,
        items: products.map(product => ({
          productId: product._id,
          quantity: product.cartQuantity
        })),
        pricing: {
          subtotal,
          shipping,
          tax,
          couponDiscount: couponApplied ? couponSavings : 0,
          couponCode: couponApplied ? couponCode : undefined,
          total
        }
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      console.log('Order API Response Status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Order API Response Data:', data)

      if (data.success) {
        // Clear cart immediately after successful order
        clearCart()
        // Show success modal
        setOrderDetails({
          orderNumber: data.data.orderNumber,
          orderId: data.data.orderId,
          estimatedDelivery: data.data.estimatedDelivery,
          total: data.data.total
        })
        console.log('[DEBUG] Showing OrderSuccessModal:', {
          orderNumber: data.data.orderNumber,
          orderId: data.data.orderId,
          estimatedDelivery: data.data.estimatedDelivery,
          total: data.data.total
        })
        setShowSuccessModal(true)
      } else {
        alert(data.message || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert(`Error placing order: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading cart...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Breadcrumb Navigation */}
        <div className="bg-muted/30 border-b relative z-40 pt-20">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/#collections" className="hover:text-foreground transition-colors">
                Shop
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">Shopping Cart</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-4">Add some products to get started</p>
              <Link href="/">
                <Button className="luxury-gradient text-black">
                  Continue Shopping
                </Button>
              </Link>
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
      
      {/* Breadcrumb Navigation */}
      <div className="bg-muted/30 border-b relative z-40 pt-20">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/#collections" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Shopping Cart</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
              <p className="text-muted-foreground">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} item(s) in your cart</p>
            </div>
            {cartItems.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleClearCart}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Clear Cart (Fix DB Issues)
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading cart items...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No products found in cart</p>
                <p className="text-sm text-muted-foreground mt-2">Cart items: {cartItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                <div className="mt-4 space-y-2">
                  {cartItems.map((item, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      Product ID: {item.productId} (Qty: {item.quantity})
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => clearCart()} 
                  variant="outline" 
                  className="mt-4"
                >
                  Clear Cart
                </Button>
              </div>
            ) : (
              products.map((product) => {
                if (!product) return null;
                
                const discountedPrice = product.discount > 0 
                  ? product.price - (product.price * product.discount / 100)
                  : product.price

                const handleQuantityChange = (newQuantity: number) => {
                  if (newQuantity <= 0) {
                    removeFromCart(product._id)
                  } else if (newQuantity > product.stockQuantity) {
                    alert(`Only ${product.stockQuantity} items available in stock`)
                  } else {
                    updateCartQuantity(product._id, newQuantity)
                  }
                }

                return (
                  <Card key={product._id} className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-lg font-bold">PKR {discountedPrice.toFixed(2)}</span>
                          {Number(product.discount) > 0 && (
                            <>
                              <span className="text-sm text-muted-foreground line-through">
                                PKR {product.price.toFixed(2)}
                              </span>
                              <span className="text-sm bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-lg font-bold shadow-md">
                                -{product.discount}% OFF
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-sm text-muted-foreground">
                            Stock: {product.stockQuantity}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.cartQuantity - 1)}
                            disabled={product.cartQuantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {product.cartQuantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.cartQuantity + 1)}
                            disabled={product.cartQuantity >= product.stockQuantity}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                          onClick={async () => {
                            console.log('Removing product:', product._id, 'quantity:', product.cartQuantity);
                            await removeFromCart(product._id, product.cartQuantity);
                            console.log('Remove completed');
                          }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>

          {/* Order Summary & Checkout */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>PKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `PKR ${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>PKR {tax.toFixed(2)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount ({couponDiscount}%)</span>
                    <span>-PKR {couponSavings.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>PKR {total.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {/* Guest Information Form */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Guest Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={guestInfo.firstName}
                      onChange={(e) => setGuestInfo({...guestInfo, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={guestInfo.lastName}
                      onChange={(e) => setGuestInfo({...guestInfo, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={guestInfo.address}
                    onChange={(e) => setGuestInfo({...guestInfo, address: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={guestInfo.city}
                      onChange={(e) => setGuestInfo({...guestInfo, city: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={guestInfo.zipCode}
                      onChange={(e) => setGuestInfo({...guestInfo, zipCode: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={guestInfo.country}
                      onChange={(e) => setGuestInfo({...guestInfo, country: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                {/* Delivery Remarks */}
                <div>
                  <Label htmlFor="deliveryRemarks">Delivery Remarks (Optional)</Label>
                  <Input
                    id="deliveryRemarks"
                    placeholder="Any special instructions for the delivery person..."
                    value={guestInfo.deliveryRemarks}
                    onChange={(e) => setGuestInfo({...guestInfo, deliveryRemarks: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave any special instructions for the delivery person (e.g., "Call before delivery", "Leave at gate", etc.)
                  </p>
                </div>
              </div>
            </Card>

            {/* Coupon Code */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Discount Coupon
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                  />
                  <Button 
                    onClick={handleApplyCoupon}
                    disabled={!couponCode || couponApplied}
                    variant="outline"
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </Button>
                </div>
                {couponApplied && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-800 font-medium">
                      Coupon applied! {couponDiscount}% off
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setCouponApplied(false)
                        setCouponDiscount(0)
                        setCouponCode('')
                        addToast({
                          type: 'info',
                          title: 'Coupon removed from your order',
                          duration: 3000,
                          simple: true
                        })
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Payment Method
              </h3>
              <div className="flex items-center space-x-2 p-4 border border-primary rounded-lg bg-primary/5">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                </div>
              </div>
            </Card>

            {/* Checkout Button */}
            <Button 
              className="w-full luxury-gradient text-black text-lg py-6"
              onClick={handleCheckout}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Truck className="h-5 w-5 mr-2" />
                  Place Order (Cash on Delivery)
                </>
              )}
            </Button>


          </div>
        </div>
      </div>
      <Footer />
      
      {/* Success Modal */}
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          console.log('[DEBUG] Closing OrderSuccessModal');
          handleModalClose();
        }}
        orderNumber={orderDetails.orderNumber}
        orderId={orderDetails.orderId}
        estimatedDelivery={orderDetails.estimatedDelivery}
        total={orderDetails.total}
      />
    </div>
  )
}

export default function CartPage() {
  return (
    <ToastProvider>
      <CartPageContent />
    </ToastProvider>
  )
}
