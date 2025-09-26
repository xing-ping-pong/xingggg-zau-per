"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { ProductPreview } from "@/components/product-preview"

const filters = ["Featured", "New Arrivals", "Best Sellers"]

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  stockQuantity: number;
  imageUrl: string;
  isFeatured: boolean;
  category: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export function FeaturedSection() {
  const [activeFilter, setActiveFilter] = useState("Featured")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products?limit=12')
        const data = await response.json()
        
        if (data.success) {
          setProducts(data.data.products)
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

    fetchProducts()
  }, [])

  // Filter products based on active filter
  const filteredProducts = products.filter((product) => {
    switch (activeFilter) {
      case "Featured":
        return product.isFeatured
      case "New Arrivals":
        // Products created in the last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return new Date(product.createdAt) > thirtyDaysAgo
      case "Best Sellers":
        // Products with high stock quantity (simulating best sellers)
        return product.stockQuantity > 50
      default:
        return true
    }
  })


  return (
    <section id="featured" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Curated Selections
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto text-pretty">
          Discover our most coveted fragrances, carefully selected for their exceptional quality
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8 sm:mb-12 overflow-x-auto">
          <div className="flex space-x-1 bg-muted rounded-lg p-1 min-w-fit">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                  activeFilter === filter
                    ? "luxury-gradient text-black font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading products...</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductPreview key={product._id} product={product} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No products found for this category.</p>
                  </div>
                )}
              </div>
            )}
      </div>
    </section>
  )
}
