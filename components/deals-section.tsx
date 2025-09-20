"use client"

import { useState, useEffect } from "react"
import { Clock, Loader2, Heart, ShoppingCart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { useCart } from "@/lib/contexts/cart-context"

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  discountEndDate?: string;
  stockQuantity: number;
  imageUrl: string;
  category: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export function DealsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { addToCart, toggleWishlist, isInCart, isInWishlist } = useCart()

  // Fetch discounted products from API
  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products?limit=6')
        const data = await response.json()
        
        if (data.success) {
          // Filter products with discount > 0
          let discountedProducts = data.data.products.filter((product: Product) => product.discount > 0)
          
          // If no discounted products, show random products
          if (discountedProducts.length === 0) {
            console.log('No discounted products found, showing random products')
            // Shuffle and take first 6 products
            discountedProducts = data.data.products
              .sort(() => Math.random() - 0.5)
              .slice(0, 6)
          }
          
          setProducts(discountedProducts)
        } else {
          setError('Failed to load products')
        }
      } catch (err) {
        setError('Failed to load products')
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDiscountedProducts()
  }, [])

  // Generate time left for deals based on real discount end date
  const getTimeLeft = (product: Product) => {
    // If product has a discount end date, calculate real time left
    if (product.discountEndDate) {
      const endDate = new Date(product.discountEndDate)
      const now = new Date()
      const diff = endDate.getTime() - now.getTime()
      
      if (diff <= 0) {
        return "Expired"
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} left`
      } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} left`
      } else {
        return `${minutes} minute${minutes > 1 ? 's' : ''} left`
      }
    }
    
    // Fallback to random time if no end date is set
    const times = ["2 days left", "5 hours left", "1 day left", "3 hours left", "6 days left"]
    return times[Math.floor(Math.random() * times.length)]
  }

  // Handle add to cart
  const handleAddToCart = async (productId: string) => {
    await addToCart(productId)
  }

  // Handle toggle wishlist
  const handleToggleWishlist = async (productId: string) => {
    await toggleWishlist(productId)
  }

  // Handle product preview
  const handleProductPreview = (product: Product) => {
    setSelectedProduct(product)
    setIsPreviewOpen(true)
  }
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            {products.some(p => p.discount > 0) ? 'Exclusive Offers' : 'Featured Products'}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {products.some(p => p.discount > 0) 
              ? 'Limited-time deals on our most beloved fragrances'
              : 'Discover our curated collection of premium fragrances'
            }
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading exclusive offers...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.length > 0 ? (
              products.map((product) => {
                const discountedPrice = product.discount > 0 
                  ? product.price - (product.price * product.discount / 100)
                  : product.price
                
                return (
                  <div key={product._id} className="group hover-lift border-0 bg-card overflow-hidden relative">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          -{product.discount}%
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeLeft(product)}
                        </div>
                      </div>
                      {/* Quick Action Buttons */}
                      <div className="absolute top-12 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleWishlist(product._id)}
                          className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center transition-colors hover:bg-white"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              isInWishlist(product._id) ? "fill-red-500 text-red-500" : "text-gray-600"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleProductPreview(product)}
                          className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center transition-colors hover:bg-white"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 ${
                                i < 4 ? "text-yellow-400" : "text-gray-300"
                              }`}
                            >
                              ★
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">(4.5)</span>
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-2xl font-bold text-foreground">${discountedPrice.toFixed(2)}</span>
                        <span className="text-lg text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                      </div>
                      <Button 
                        className="w-full luxury-gradient text-black font-semibold"
                        onClick={() => handleAddToCart(product._id)}
                        disabled={product.stockQuantity === 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.stockQuantity === 0 ? "Out of Stock" : isInCart(product._id) ? "In Cart" : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No exclusive offers available at the moment.</p>
              </div>
            )}
          </div>
        )}

        {/* Product Preview Modal */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">Product Details</DialogTitle>
            {selectedProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-square">
                  <img
                    src={selectedProduct.imageUrl || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                    <p className="text-muted-foreground">{selectedProduct.category?.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold">
                      ${(selectedProduct.price - (selectedProduct.price * selectedProduct.discount / 100)).toFixed(2)}
                    </span>
                    {selectedProduct.discount > 0 && (
                      <span className="text-lg text-muted-foreground line-through">
                        ${selectedProduct.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleAddToCart(selectedProduct._id)}
                      disabled={selectedProduct.stockQuantity === 0}
                      className="flex-1 luxury-gradient text-black"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {selectedProduct.stockQuantity === 0 ? "Out of Stock" : isInCart(selectedProduct._id) ? "In Cart" : "Add to Cart"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleToggleWishlist(selectedProduct._id)}
                      className="px-3"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isInWishlist(selectedProduct._id) ? "fill-red-500 text-red-500" : "text-gray-600"
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
