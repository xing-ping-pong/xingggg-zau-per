"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Star, Loader2, ChevronRight } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  stockQuantity: number;
  imageUrl: string;
  isFeatured: boolean;
  category?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist, addToCart, isInCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Process wishlist items - handle both IDs and full objects
  useEffect(() => {
    const processWishlistItems = async () => {
      if (wishlistItems.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Check if wishlistItems contains full objects or just IDs
        const firstItem = wishlistItems[0]
        if (typeof firstItem === 'string') {
          // Items are IDs, fetch product details
          const productPromises = wishlistItems.map(async (productId) => {
            const response = await fetch(`/api/products/${productId}`)
            const data = await response.json()
            return data.success ? data.data : null
          })

          const products = await Promise.all(productPromises)
          setProducts(products.filter(Boolean))
        } else {
          // Items are already full product objects
          setProducts(wishlistItems.filter(Boolean))
        }
      } catch (error) {
        console.error('Error processing wishlist items:', error)
        setError('Failed to load wishlist products')
      } finally {
        setLoading(false)
      }
    }

    processWishlistItems()
  }, [wishlistItems])

  const handleToggleWishlist = async (productId: string) => {
    await toggleWishlist(productId)
  }

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId)
  }

  // Calculate discounted price
  const getDiscountedPrice = (price: number, discount: number) => {
    return discount > 0 ? price - (price * discount / 100) : price
  }

  // Check if product is new (created in last 7 days)
  const isNewProduct = (createdAt: string) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return new Date(createdAt) > sevenDaysAgo
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading wishlist...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (wishlistItems.length === 0) {
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
              <span className="text-foreground font-medium">Wishlist</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-4">Add some products to your wishlist</p>
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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500">{error}</p>
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
            <span className="text-foreground font-medium">Wishlist</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">{wishlistItems.length} item(s) in your wishlist</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const discountedPrice = getDiscountedPrice(product.price, product.discount)
            const isNew = isNewProduct(product.createdAt)
            
            return (
              <Card key={product._id} className="group hover-lift border-0 bg-background overflow-hidden">
                <Link href={`/products/${product._id}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  {isNew && (
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold">
                      New
                    </div>
                  )}
                  {product.discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      -{product.discount}%
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleToggleWishlist(product._id)
                    }}
                    className="absolute top-12 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center transition-colors hover:bg-white"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < 4 ? "fill-primary text-primary" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">(4.5)</span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-foreground">${discountedPrice.toFixed(2)}</span>
                      {product.discount > 0 && (
                        <span className="text-base text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="luxury-gradient text-black font-semibold text-xs"
                      onClick={() => handleAddToCart(product._id)}
                      disabled={product.stockQuantity === 0}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      {product.stockQuantity === 0 ? "Out of Stock" : isInCart(product._id) ? "In Cart" : "Add to Cart"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      <Footer />
    </div>
  )
}
