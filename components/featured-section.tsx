"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Star } from "lucide-react"

const filters = ["New Arrivals", "Best Sellers", "Top Rated"]

const products = [
  {
    id: 1,
    name: "Midnight Rose",
    price: 189,
    originalPrice: null,
    rating: 4.8,
    reviews: 124,
    image: "/luxury-perfume-bottle-midnight-rose-dark-elegant.jpg",
    category: "New Arrivals",
    isNew: true,
  },
  {
    id: 2,
    name: "Golden Amber",
    price: 165,
    originalPrice: 220,
    rating: 4.9,
    reviews: 89,
    image: "/luxury-perfume-bottle-golden-amber-warm-tones.jpg",
    category: "Best Sellers",
    isNew: false,
  },
  {
    id: 3,
    name: "Ocean Breeze",
    price: 145,
    originalPrice: null,
    rating: 4.7,
    reviews: 156,
    image: "/luxury-perfume-bottle-ocean-blue-fresh-modern.jpg",
    category: "Top Rated",
    isNew: false,
  },
  {
    id: 4,
    name: "Velvet Noir",
    price: 210,
    originalPrice: null,
    rating: 4.9,
    reviews: 203,
    image: "/luxury-perfume-bottle-black-velvet-sophisticated.jpg",
    category: "Best Sellers",
    isNew: false,
  },
  {
    id: 5,
    name: "Citrus Bloom",
    price: 135,
    originalPrice: 180,
    rating: 4.6,
    reviews: 78,
    image: "/luxury-perfume-bottle-citrus-yellow-bright-fresh.jpg",
    category: "New Arrivals",
    isNew: true,
  },
  {
    id: 6,
    name: "Royal Oud",
    price: 295,
    originalPrice: null,
    rating: 5.0,
    reviews: 67,
    image: "/luxury-perfume-bottle-royal-oud-gold-ornate.jpg",
    category: "Top Rated",
    isNew: false,
  },
]

export function FeaturedSection() {
  const [activeFilter, setActiveFilter] = useState("New Arrivals")
  const [likedProducts, setLikedProducts] = useState<number[]>([])

  const filteredProducts = products.filter((product) => product.category === activeFilter)

  const toggleLike = (productId: number) => {
    setLikedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  return (
    <section id="featured" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Curated Selections
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto text-pretty">
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover-lift border-0 bg-background overflow-hidden">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {product.isNew && (
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-primary text-primary-foreground px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    New
                  </div>
                )}
                <button
                  onClick={() => toggleLike(product.id)}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center transition-colors hover:bg-white"
                >
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                      likedProducts.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
                </button>
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground ml-2">({product.reviews})</span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground mb-2">{product.name}</h3>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl sm:text-2xl font-bold text-foreground">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-base sm:text-lg text-muted-foreground line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  <Button size="sm" className="luxury-gradient text-black font-semibold text-xs sm:text-sm">
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
