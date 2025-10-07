"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  productCount?: number;
  imageUrl?: string;
}

export function CollectionsSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/categories')
        const data = await response.json()
        
        if (data.success) {
          const categoriesWithCounts = await Promise.all(
            data.data.categories.map(async (category: Category) => {
              try {
                // Fetch product count for each category
                const productsResponse = await fetch(`/api/products?category=${category._id}&limit=1`)
                const productsData = await productsResponse.json()
                
                return {
                  ...category,
                  productCount: productsData.data?.pagination?.totalCount || 0
                }
              } catch (err) {
                console.error(`Error fetching product count for category ${category.name}:`, err)
                return {
                  ...category,
                  productCount: 0
                }
              }
            })
          )
          
          // Filter out inactive categories and sort by product count
          const activeCategories = categoriesWithCounts
            .filter(cat => cat.isActive)
            .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
          
          setCategories(activeCategories)
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
          <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto text-pretty mb-6">
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
                // Dynamic image selection based on category
                  // Use uploaded image if available, otherwise fallback
                  const getCategoryImage = (category: Category, index: number) => {
                    if (category.imageUrl && category.imageUrl.trim() !== "") {
                      return category.imageUrl;
                    }
                    const name = category.name.toLowerCase();
                    if (name.includes('women') || name.includes('female')) {
                      return "/elegant-woman-with-luxury-perfume-bottle-in-sophis.jpg";
                    } else if (name.includes('men') || name.includes('male')) {
                      return "/sophisticated-man-with-luxury-cologne-bottle-in-mo.jpg";
                    } else if (name.includes('dior')) {
                      return "/dior-sauvage-perfume.jpg";
                    } else if (name.includes('chanel')) {
                      return "/chanel-perfume-bottle.jpg";
                    } else if (name.includes('designer') || name.includes('luxury')) {
                      return "/luxury-perfume-bottle-in-ethereal-lighting-with-go.jpg";
                    } else if (name.includes('fresh') || name.includes('citrus')) {
                      return "/fresh-citrus-perfume-bottle.jpg";
                    } else if (name.includes('oriental') || name.includes('spicy')) {
                      return "/oriental-spicy-perfume-bottle.jpg";
                    } else if (name.includes('floral') || name.includes('rose')) {
                      return "/floral-rose-perfume-bottle.jpg";
                    } else {
                      const fallbackImages = [
                        "/luxury-perfume-bottle-in-ethereal-lighting-with-go.jpg",
                        "/chanel-perfume-bottle.jpg",
                        "/elegant-woman-with-luxury-perfume-bottle-in-sophis.jpg",
                        "/sophisticated-man-with-luxury-cologne-bottle-in-mo.jpg"
                      ];
                      return fallbackImages[index % fallbackImages.length];
                    }
                  }

                return (
                  <div key={category._id} className="group relative overflow-hidden rounded-2xl hover-lift cursor-pointer"
                       onClick={() => router.push(`/products?category=${category.slug}`)}>
                    <div className="aspect-[4/5] sm:aspect-[4/5] relative">
                      <Image
                        src={getCategoryImage(category, index)}
                        alt={`${category.name} Collection - Luxury fragrance collection`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Badges Container for spacing */}
                      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                        {category.productCount && category.productCount > 0 && (
                          <div className="bg-white/90 text-black px-3 py-1 rounded-full text-sm font-semibold shadow">
                            {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
                          </div>
                        )}
                        {/* Future badges can be added here */}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">{category.name}</h3>
                      <p className="text-white/80 mb-4 text-sm sm:text-base">
                        {category.description || `Discover our ${category.name.toLowerCase()} collection`}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white text-white hover:bg-white hover:text-black transition-colors bg-transparent text-sm sm:text-base group/btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/products?category=${category.slug}`)
                        }}
                      >
                        Shop {category.name}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
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

        {/* View All Collections Button */}
        {!loading && !error && categories.length > 0 && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors px-8 py-3"
              onClick={() => router.push('/products')}
            >
              View All Collections
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
