"use client"

import { useState, useEffect } from "react"
import { Clock, Loader2 } from "lucide-react"
import { ProductPreview } from "@/components/product-preview"

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

  // Fetch discounted products from API
  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products?limit=6')
        const data = await response.json()
        
        if (data.success) {
          // Filter products with discount > 0 and not expired
          let discountedProducts = data.data.products.filter((product: Product) => {
            if (product.discount <= 0) return false
            
            // Check if discount has expired
            if (product.discountEndDate) {
              const endDate = new Date(product.discountEndDate)
              const now = new Date()
              return endDate.getTime() > now.getTime() // Only include if not expired
            }
            
            return true // Include if no end date (permanent discount)
          })
          
          // If no active discounted products, show random products
          if (discountedProducts.length === 0) {
            console.log('No active discounted products found, showing random products')
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
    
    // Set up periodic refresh to remove expired products
    const interval = setInterval(() => {
      fetchDiscountedProducts()
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
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
              products.map((product) => (
                <div key={product._id} className="relative">
                  {/* Time Left Badge - Override the default New/24/7 badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                      <Clock className="w-3 h-3 mr-1" />
                      {getTimeLeft(product)}
                    </div>
                  </div>
                  <ProductPreview product={product} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No exclusive offers available at the moment.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  )
}
