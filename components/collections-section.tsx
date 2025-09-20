"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface Category {
  _id: string;
  name: string;
  description: string;
}

export function CollectionsSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/categories')
        const data = await response.json()
        
        if (data.success) {
          setCategories(data.data.categories)
        } else {
          setError('Failed to load categories')
        }
      } catch (err) {
        setError('Failed to load categories')
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])
  return (
    <section id="collections" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Our Collections
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto text-pretty">
            Curated fragrances for every personality, crafted with the finest ingredients
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading collections...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Collections Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {categories.length > 0 ? (
              categories.map((category, index) => {
                // Use different images for different categories
                const getCategoryImage = (categoryName: string) => {
                  if (categoryName.toLowerCase().includes('women')) {
                    return "/elegant-woman-with-luxury-perfume-bottle-in-sophis.jpg"
                  } else if (categoryName.toLowerCase().includes('men')) {
                    return "/sophisticated-man-with-luxury-cologne-bottle-in-mo.jpg"
                  } else if (categoryName.toLowerCase().includes('dior')) {
                    return "/dior-sauvage-perfume.jpg"
                  } else {
                    return "/chanel-perfume-bottle.jpg"
                  }
                }

                return (
                  <div key={category._id} className="group relative overflow-hidden rounded-2xl hover-lift">
                    <div className="aspect-[4/5] sm:aspect-[4/5] relative">
                      <img
                        src={getCategoryImage(category.name)}
                        alt={`${category.name} Collection`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">{category.name}</h3>
                      <p className="text-white/80 mb-4 text-sm sm:text-base">
                        {category.description || `Discover our ${category.name.toLowerCase()} collection`}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white text-white hover:bg-white hover:text-black transition-colors bg-transparent text-sm sm:text-base"
                      >
                        Shop {category.name}
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No collections found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
