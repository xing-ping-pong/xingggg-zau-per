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
    <section id="featured" className="py-20 px-4 bg-card">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">Curated Selections</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our most coveted fragrances, carefully selected for their exceptional quality
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-md transition-all duration-300 ${
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover-lift border-0 bg-background overflow-hidden">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {product.isNew && (
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    New
                  </div>
                )}
                <button
                  onClick={() => toggleLike(product.id)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center transition-colors hover:bg-white"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      likedProducts.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
                </button>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">({product.reviews})</span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-foreground">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">${product.originalPrice}</span>
                    )}
                  </div>
                  <Button size="sm" className="luxury-gradient text-black font-semibold">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
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
