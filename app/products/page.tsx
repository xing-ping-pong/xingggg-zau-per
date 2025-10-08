"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductPreview } from "@/components/product-preview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  discount: number
  discountEndDate?: string
  imageUrl: string
  images?: string[]
  category: {
    _id: string
    name: string
    slug: string
  }
  featured: boolean
  isFeatured: boolean
  stockQuantity: number
  createdAt: string
}

interface Category {
  _id: string
  name: string
  slug: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState("all")
  
  const searchParams = useSearchParams()
  
  // Get category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Fetch products when filters change (debounced for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts()
    }, searchTerm ? 500 : 0) // Debounce search by 500ms, no delay for other filters

    return () => clearTimeout(timeoutId)
  }, [selectedCategory, sortBy, priceRange, searchTerm])

  const fetchProducts = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (selectedCategory && selectedCategory !== 'all') {
        // Accept both slug and ID
        let categoryId = selectedCategory
        // If selectedCategory is a slug, find its ID
        const foundBySlug = categories.find(cat => cat.slug === selectedCategory)
        if (foundBySlug) {
          categoryId = foundBySlug._id
        }
        params.append('category', categoryId)
      }
      if (sortBy !== 'newest') {
        switch (sortBy) {
          case 'price-asc':
            params.append('sortBy', 'price')
            params.append('sortOrder', 'asc')
            break
          case 'price-desc':
            params.append('sortBy', 'price')
            params.append('sortOrder', 'desc')
            break
          case 'name':
            params.append('sortBy', 'name')
            params.append('sortOrder', 'asc')
            break
          default:
            params.append('sortBy', 'createdAt')
            params.append('sortOrder', 'desc')
        }
      }
      if (priceRange !== 'all') {
        if (priceRange.endsWith('-')) {
          // Handle "Over PKR 10,000" case (ends with -)
          const min = priceRange.replace('-', '')
          if (min) params.append('minPrice', min)
        } else {
          const [min, max] = priceRange.split('-')
          if (min) params.append('minPrice', min)
          if (max) params.append('maxPrice', max)
        }
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is now handled automatically by useEffect
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSortBy("newest")
    setPriceRange("all")
  }

  const activeFiltersCount = [selectedCategory !== 'all', sortBy !== 'newest', priceRange !== 'all', searchTerm].filter(Boolean).length

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              {selectedCategory && selectedCategory !== 'all' ? 
                `Products in ${categories.find(cat => cat.slug === selectedCategory)?.name || 'Category'}` : 
                'All Products'
              }
            </h1>
          </div>
          
          <p className="text-muted-foreground">
            {selectedCategory && selectedCategory !== 'all' ? 
              `Discover our ${categories.find(cat => cat.slug === selectedCategory)?.name?.toLowerCase()} collection` :
              'Browse our complete collection of luxury fragrances'
            }
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Range */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-2000">Under PKR 2,000</SelectItem>
                  <SelectItem value="2000-5000">PKR 2,000 - 5,000</SelectItem>
                  <SelectItem value="5000-10000">PKR 5,000 - 10,000</SelectItem>
                  <SelectItem value="10000-">Over PKR 10,000</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading products...</span>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
                  </span>
                </div>
              )}
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductPreview key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </main>
  )
}
