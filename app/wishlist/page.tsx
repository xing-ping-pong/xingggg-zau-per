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
  const [productReviews, setProductReviews] = useState<Record<string, { averageRating: number; totalReviews: number }>>({})

  // Process wishlist items - handle both IDs and full objects
  useEffect(() => {
    console.log('Wishlist items changed:', wishlistItems);
    const processWishlistItems = async () => {
      if (wishlistItems.length === 0) {
        console.log('Wishlist is empty, clearing products and reviews');
        setProducts([]) // Clear products when wishlist is empty
        setProductReviews({}) // Clear reviews when wishlist is empty
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
            try {
              const response = await fetch(`/api/products/${productId}`)
              const data = await response.json()
              if (data.success && data.data) {
                // Ensure price and discount are numbers
                const product = {
                  ...data.data,
                  price: typeof data.data.price === 'number' ? data.data.price : parseFloat(data.data.price) || 0,
                  discount: typeof data.data.discount === 'number' ? data.data.discount : parseFloat(data.data.discount) || 0,
                  stockQuantity: typeof data.data.stockQuantity === 'number' ? data.data.stockQuantity : parseInt(data.data.stockQuantity) || 0
                }
                console.log('Processed product:', product);
                return product
              }
              return null
            } catch (error) {
              console.error('Error fetching product:', productId, error);
              return null
            }
          })

          const products = await Promise.all(productPromises)
          const validProducts = products.filter(Boolean)
          console.log('Valid products:', validProducts);
          setProducts(validProducts)
          
          // Fetch reviews for the products
          if (validProducts.length > 0) {
            const productIds = validProducts.map(p => p._id)
            await fetchProductReviews(productIds)
          }
        } else {
          // Items should be product IDs (strings) - fetch product details
          console.log('Raw wishlistItems (objects):', wishlistItems);
          const productIds = wishlistItems
            .filter(Boolean) // Remove null/undefined items
            .map(item => {
              console.log('Mapping item:', item);
              const id = typeof item === 'string' ? item : item?._id || item?.id;
              console.log('Extracted ID:', id);
              return id;
            })
            .filter(Boolean); // Remove any remaining null/undefined values
          console.log('Processing wishlist IDs:', productIds);
          
          if (productIds.length > 0) {
            const productPromises = productIds.map(async (productId) => {
              try {
                const response = await fetch(`/api/products/${productId}`)
                const data = await response.json()
                if (data.success && data.data) {
                  // Ensure price and discount are numbers
                  const product = {
                    ...data.data,
                    price: typeof data.data.price === 'number' ? data.data.price : parseFloat(data.data.price) || 0,
                    discount: typeof data.data.discount === 'number' ? data.data.discount : parseFloat(data.data.discount) || 0,
                    stockQuantity: typeof data.data.stockQuantity === 'number' ? data.data.stockQuantity : parseInt(data.data.stockQuantity) || 0
                  }
                  console.log('Processed product:', product);
                  return product
                }
                return null
              } catch (error) {
                console.error('Error fetching product:', productId, error);
                return null
              }
            })

            const products = await Promise.all(productPromises)
            const validProducts = products.filter(Boolean)
            console.log('Validated existing products:', validProducts);
            setProducts(validProducts)
            
            // Fetch reviews for the products
            if (validProducts.length > 0) {
              await fetchProductReviews(productIds)
            }
          } else {
            setProducts([])
          }
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
    console.log('Toggling wishlist for product:', productId);
    console.log('Current wishlist items before toggle:', wishlistItems);
    await toggleWishlist(productId)
    console.log('Wishlist toggle completed');
  }

  // Manual refresh function to fix corrupted wishlist data
  const refreshWishlist = () => {
    console.log('Manually refreshing wishlist...');
    const savedWishlist = localStorage.getItem('wishlist-items');
    if (savedWishlist) {
      try {
        const wishlistData = JSON.parse(savedWishlist);
        console.log('Raw localStorage data:', wishlistData);
        
        // Clean the data
        const cleaned = wishlistData
          .filter(Boolean)
          .map(item => typeof item === 'string' ? item : item?._id || item?.id)
          .filter(Boolean);
        
        console.log('Cleaned data:', cleaned);
        localStorage.setItem('wishlist-items', JSON.stringify(cleaned));
        
        // Force a re-render by updating the wishlist items
        window.location.reload();
      } catch (error) {
        console.error('Error refreshing wishlist:', error);
      }
    }
  }

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId)
  }

  // Calculate discounted price
  const getDiscountedPrice = (price: number, discount: number) => {
    if (typeof price !== 'number' || isNaN(price)) {
      console.warn('Invalid price:', price);
      return 0;
    }
    if (typeof discount !== 'number' || isNaN(discount)) {
      console.warn('Invalid discount:', discount);
      return price;
    }
    return discount > 0 ? price - (price * discount / 100) : price
  }

  // Check if product is new (created in last 7 days)
  const isNewProduct = (createdAt: string) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return new Date(createdAt) > sevenDaysAgo
  }

  // Fetch review data for products
  const fetchProductReviews = async (productIds: string[]) => {
    try {
      const reviewPromises = productIds.map(async (productId) => {
        try {
          const response = await fetch(`/api/products/${productId}/reviews`)
          const data = await response.json()
          if (data.success && data.data) {
            return { 
              productId, 
              reviews: {
                averageRating: typeof data.data.averageRating === 'number' ? data.data.averageRating : 0,
                totalReviews: typeof data.data.totalReviews === 'number' ? data.data.totalReviews : 0
              }
            }
          }
          return { productId, reviews: { averageRating: 0, totalReviews: 0 } }
        } catch (error) {
          console.error('Error fetching reviews for product:', productId, error)
          return { productId, reviews: { averageRating: 0, totalReviews: 0 } }
        }
      })

      const reviewResults = await Promise.all(reviewPromises)
      const reviewMap: Record<string, { averageRating: number; totalReviews: number }> = {}
      
      reviewResults.forEach(({ productId, reviews }) => {
        console.log('Review data for product:', productId, reviews)
        reviewMap[productId] = reviews
      })

      console.log('All review data:', reviewMap)
      setProductReviews(reviewMap)
    } catch (error) {
      console.error('Error fetching product reviews:', error)
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
                  <p className="text-muted-foreground">{wishlistItems.length} item(s) in your wishlist</p>
                </div>
                <Button 
                  onClick={refreshWishlist}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  🔄 Fix Wishlist
                </Button>
              </div>
            </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            // Debug logging
            console.log('Product data:', {
              id: product._id,
              name: product.name,
              price: product.price,
              discount: product.discount,
              priceType: typeof product.price,
              discountType: typeof product.discount,
              stockQuantity: product.stockQuantity,
              stockType: typeof product.stockQuantity
            });
            
            const discountedPrice = getDiscountedPrice(product.price, product.discount)
            const isNew = isNewProduct(product.createdAt)
            
            // Final safety check
            if (typeof discountedPrice !== 'number' || isNaN(discountedPrice)) {
              console.error('Invalid discountedPrice calculated:', {
                productId: product._id,
                price: product.price,
                discount: product.discount,
                discountedPrice
              });
            }
            
            return (
              <Card key={product._id || `product-${Math.random()}`} className="group hover-lift border-0 bg-background overflow-hidden">
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
                      {[...Array(5)].map((_, i) => {
                        const reviews = productReviews[product._id]
                        const rating = reviews?.averageRating || 0
                        const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0
                        return (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(safeRating) ? "fill-primary text-primary" : "text-muted-foreground"
                            }`}
                          />
                        )
                      })}
                    </div>
                    {productReviews[product._id] && 
                     productReviews[product._id].averageRating && 
                     typeof productReviews[product._id].averageRating === 'number' && 
                     !isNaN(productReviews[product._id].averageRating) && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({productReviews[product._id].averageRating.toFixed(1)})
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-foreground">
                        ${typeof discountedPrice === 'number' ? discountedPrice.toFixed(2) : '0.00'}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-base text-muted-foreground line-through">
                          ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
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
