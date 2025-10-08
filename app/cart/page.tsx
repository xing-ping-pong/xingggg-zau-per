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
import dynamic from "next/dynamic"
const OrderSuccessModal = dynamic(() => import("@/components/ui/order-success-modal").then(mod => mod.OrderSuccessModal), { ssr: false })
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
  const { addToast } = useToast();
  const { cartItems, removeFromCart, updateCartQuantity, clearCart, isInCart, getCartQuantity } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: '',
    orderId: '',
    estimatedDelivery: '',
    total: 0
  });

  // Debug: log when modal should open
  useEffect(() => {
    if (showSuccessModal) {
      console.log('CartPage: showSuccessModal is TRUE, modal should be visible');
    }
  }, [showSuccessModal]);
  // Handle order placement
  const handleCheckout = async () => {
    setSaving(true);
    try {
      // Prepare order payload matching backend contract
      const orderPayload = {
        guestInfo,
        items: products.map(p => ({
          productId: p._id,
          quantity: p.cartQuantity
        })),
        pricing: {
          subtotal,
          shipping,
          tax: 0, // No tax for end user
          total,
          couponCode: couponApplied ? couponCode : undefined,
          couponDiscount: couponApplied ? couponDiscount : undefined
        }
      };
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOrderDetails({
          orderNumber: data.orderNumber,
          orderId: data.orderId,
          estimatedDelivery: data.estimatedDelivery,
          total: data.total
        });
        setShowSuccessModal(false); // Reset first to ensure re-render
        setTimeout(() => {
          setShowSuccessModal(true);
        }, 100); // Small delay to guarantee modal pops up
        clearCart();
        addToast({ type: 'success', title: 'Order placed successfully!', duration: 4000, simple: true });
      } else {
        addToast({ type: 'error', title: data.message || 'Order failed', duration: 4000, simple: true });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error placing order', duration: 4000, simple: true });
    } finally {
      setSaving(false);
    }
  };
  // ...existing code...



  // Fetch product details for cart items
  useEffect(() => {
    const fetchCartProducts = async () => {
      // ...removed for production...
      if (cartItems.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        // ...removed for production...
        const productPromises = cartItems.map(async (cartItem) => {
          try {
            // ...removed for production...
            const response = await fetch(`/api/products/${cartItem.productId}`)
            const data = await response.json()
            // ...removed for production...
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
  const couponSavings = couponApplied ? (subtotal * couponDiscount / 100) : 0
  const total = subtotal + shipping - couponSavings

  const handleRemoveFromCart = (productId: string) => {
    removeFromCart(productId)
  }
// Export CartPageContent at the top level

  const handleApplyCoupon = async () => {
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await response.json();
      if (data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.discount);
        addToast({
          type: 'success',
          title: 'Coupon applied!',
          duration: 3000,
          simple: true
        });
      } else {
        addToast({
          type: 'error',
          title: 'Invalid coupon code',
          duration: 3000,
          simple: true
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error validating coupon',
        duration: 3000,
        simple: true
      });
    }
    }

    return (
      <div className="min-h-screen bg-background">
        <Header />
        {/* Add spacing and breadcrumb between header and cart */}
        <div className="pt-16" />
        <div className="bg-muted/30 border-b relative z-40 mt-2">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/#collections" className="hover:text-foreground transition-colors">Shop</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">Shopping Cart</span>
            </nav>
          </div>
        </div>
        {/* Main cart content */}
        {loading ? (
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
        ) : cartItems.length === 0 ? (
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-4">Add some products to get started</p>
                <Link href="/">
                  <Button className="luxury-gradient text-black">Continue Shopping</Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cart Items */}
              <div className="space-y-6">
                {products.map((product) => (
                  <Card key={product._id} className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <img src={product.imageUrl} alt={product.name} className="w-32 h-32 object-cover rounded-lg border" />
                    <div className="flex-1 w-full">
                      <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                      <p className="text-muted-foreground mb-2">{product.description}</p>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg font-semibold text-primary">PKR {(typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0).toFixed(2)}</span>
                        {typeof product.discount === 'number' && product.discount > 0 && (
                          <span className="text-sm bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-lg font-bold shadow-md">
                            -{product.discount}% OFF
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-muted-foreground">Stock: {product.stockQuantity}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        {/* Quantity Controls */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(product._id, product.cartQuantity - 1)}
                          disabled={product.cartQuantity <= 1}
                          className="h-8 w-8 p-0"
                        >-
                        </Button>
                        <span className="w-8 text-center font-medium">{product.cartQuantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(product._id, product.cartQuantity + 1)}
                          disabled={product.cartQuantity >= product.stockQuantity}
                          className="h-8 w-8 p-0"
                        >+
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromCart(product._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              {/* Order Summary & Checkout */}
              <div className="space-y-6">
                {/* Order Summary */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>PKR {(typeof subtotal === 'number' && !isNaN(subtotal) ? subtotal : 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Depends on location</span>
                    </div>
                    {/* No tax shown to end user */}
                    {couponApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount ({couponDiscount}%)</span>
                        <span>-PKR {(typeof couponSavings === 'number' && !isNaN(couponSavings) ? couponSavings : 0).toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>PKR {(typeof total === 'number' && !isNaN(total) ? total : 0).toFixed(2)}</span>
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
        )}
        <Footer />
        {/* Success Modal */}
        <OrderSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          orderNumber={orderDetails.orderNumber}
          orderId={orderDetails.orderId}
          estimatedDelivery={orderDetails.estimatedDelivery}
          total={orderDetails.total}
        />
      </div>
    );
  }

export default function CartPage() {
  return (
    <ToastProvider>
      <CartPageContent />
    </ToastProvider>
  )
}
