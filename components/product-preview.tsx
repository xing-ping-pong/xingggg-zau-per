"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Heart, ShoppingCart, Star, Eye, Loader2 } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { ShareButton } from "@/components/ui/share-button"

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
  timer?: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

interface ProductPreviewProps {
  product: Product;
  showQuickActions?: boolean;
}

export function ProductPreview({ product, showQuickActions = true }: ProductPreviewProps) {
  const { addToCart, toggleWishlist, isInCart, isInWishlist } = useCart()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ averageRating: 0, totalReviews: 0 })
  const [reviewsLoading, setReviewsLoading] = useState(false)

  // Calculate discounted price
  const getDiscountedPrice = (price: number, discount: number) => {
    return discount > 0 ? price - (price * discount / 100) : price
  }

  // Format price to remove unnecessary decimal places
  const formatPrice = (price: number) => {
    return price % 1 === 0 ? price.toString() : price.toFixed(2)
  }

  // Check if product is new (created in last 7 days)
  const isNewProduct = (createdAt: string) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return new Date(createdAt) > sevenDaysAgo
  }

  const discountedPrice = getDiscountedPrice(product.price, product.discount)
  const isNew = isNewProduct(product.createdAt)

  // Fetch review stats for the product
  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        setReviewsLoading(true)
        const response = await fetch(`/api/products/${product._id}/reviews?limit=1`)
        const data = await response.json()
        
        if (data.success) {
          setReviewStats({
            averageRating: data.data.ratingStats.averageRating || 0,
            totalReviews: data.data.ratingStats.totalReviews || 0
          })
        }
      } catch (error) {
        console.error('Error fetching review stats:', error)
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviewStats()
  }, [product._id])

  const handleAddToCart = async () => {
    await addToCart(product._id)
  }

  const handleToggleWishlist = async () => {
    await toggleWishlist(product._id)
  }

  return (
    <Card className="group hover-lift border-0 bg-background overflow-hidden">
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        {/* Top Left - New Badge (only if product is new) */}
        {isNew && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg mb-1">
              New
            </div>
            {/* Example timer badge, add more badges here as needed */}
            {/* <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">5 hours left</div> */}
          </div>
        )}
        {/* Top Right - Discount Badge */}
        {/* Top Right - Badges Container for spacing */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
          {/* Discount Badge */}
          {Number(product.discount) > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/20">
              -{product.discount}%
            </div>
          )}
          {/* Example timer badge, add more badges here as needed */}
          {product.timer && (
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {product.timer}
            </div>
          )}
        </div>
        {showQuickActions && (
          <div className="absolute top-12 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleToggleWishlist}
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center transition-colors hover:bg-white"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isInWishlist(product._id) ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />
            </button>
            <ShareButton
              productName={product.name}
              productPrice={product.price}
              productImage={product.imageUrl}
              discount={product.discount}
              variant="icon"
              size="sm"
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center transition-colors hover:bg-white"
            />
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center transition-colors hover:bg-white">
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogTitle className="sr-only">Product Details</DialogTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="aspect-square">
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">{product.name}</h2>
                      <p className="text-muted-foreground">{product.category?.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl font-bold">PKR {formatPrice(discountedPrice)}</span>
                      {Number(product.discount) > 0 && (
                        <span className="text-lg text-muted-foreground line-through">
                          PKR {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={handleAddToCart}
                        disabled={product.stockQuantity === 0}
                        className="flex-1 luxury-gradient text-black"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.stockQuantity === 0 ? "Out of Stock" : isInCart(product._id) ? "In Cart" : "Add to Cart"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleToggleWishlist}
                        className="px-3"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isInWishlist(product._id) ? "fill-red-500 text-red-500" : "text-gray-600"
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          {reviewsLoading ? (
            <div className="flex items-center">
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              <span className="text-xs text-muted-foreground">Loading...</span>
            </div>
          ) : reviewStats.totalReviews > 0 ? (
            <>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(reviewStats.averageRating) ? "fill-primary text-primary" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-2">
                ({reviewStats.averageRating.toFixed(1)}) {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
              </span>
            </>
          ) : (
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 text-muted-foreground"
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-2">No reviews yet</span>
            </div>
          )}
        </div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-foreground">PKR {formatPrice(discountedPrice)}</span>
            {Number(product.discount) > 0 && (
              <span className="text-base text-muted-foreground line-through">
                PKR {formatPrice(product.price)}
              </span>
            )}
          </div>
          {showQuickActions && (
            <Button 
              size="sm" 
              className="luxury-gradient text-black font-semibold text-xs"
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              {product.stockQuantity === 0 ? "Out" : isInCart(product._id) ? "In Cart" : "Add"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
