"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Minus,
  Plus,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Share2
} from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductPreview } from "@/components/product-preview"
import ProductQuestions from "@/components/product-questions"
import { ProductImageGallery } from "@/components/ui/product-image-gallery"
import { ShareButton } from "@/components/ui/share-button"
import Image from "next/image"

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount: number;
  discountEndDate?: string;
  imageUrl: string;
  images?: string[];
  category?: {
    _id: string;
    name: string;
  };
  stockQuantity: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  fragranceNotes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  features?: string[];
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [error, setError] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addingToWishlist, setAddingToWishlist] = useState(false)

  const { addToCart, toggleWishlist, isInCart, isInWishlist } = useCart()

  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [newReview, setNewReview] = useState({
    name: "",
    email: "",
    rating: 0,
    title: "",
    comment: ""
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState("")
  const [activeTab, setActiveTab] = useState<'reviews' | 'questions'>('reviews')

  // Use product info if available, fallback to dummy data
  const fragranceNotes = product?.fragranceNotes || {
    top: ["Bergamot", "Pink Pepper", "Mandarin"],
    middle: ["Midnight Jasmine", "Black Rose", "Violet"],
    base: ["Warm Amber", "Sandalwood", "Vanilla", "Musk"],
  }

  const features: string[] = product?.features?.length ? product.features : [
    "Long-lasting 8-12 hour wear",
    "Premium French ingredients",
    "Handcrafted crystal bottle",
    "Cruelty-free and sustainable",
  ]

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${productId}`)
        const data = await response.json()
        
        if (data.success) {
          setProduct(data.data)
          fetchReviews(data.data._id)
        } else {
          setError(data.message || 'Product not found')
        }
      } catch (err) {
        setError('Failed to load product')
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchReviews = async (productId: string) => {
    try {
      setReviewsLoading(true)
      const response = await fetch(`/api/products/${productId}/reviews`)
      const data = await response.json()
      
      if (data.success) {
        setReviews(data.data.reviews)
        setRatingStats(data.data.ratingStats)
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setSubmittingReview(true)
    setReviewError("")

    try {
      const response = await fetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newReview,
          userId: 'guest' // For now, using guest
        }),
      })
      const data = await response.json()

      if (data.success) {
        setNewReview({ name: "", email: "", rating: 0, title: "", comment: "" })
        fetchReviews(product._id)
      } else {
        setReviewError(data.message || 'Failed to submit review')
      }
    } catch (err) {
      setReviewError('Network error. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Fetch related products when product is loaded
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return

      try {
        setRelatedLoading(true)
        const response = await fetch(`/api/products?category=${product.category?._id}&limit=4&exclude=${product._id}`)
        const data = await response.json()
        
        if (data.success) {
          setRelatedProducts(data.data.products)
        }
      } catch (err) {
        console.error('Error fetching related products:', err)
      } finally {
        setRelatedLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [product])

  const handleAddToCart = async () => {
    if (!product) return
    
    setAddingToCart(true)
    try {
      // Add the product multiple times based on quantity
      for (let i = 0; i < quantity; i++) {
        await addToCart(product._id)
      }
    } catch (err) {
      console.error('Error adding to cart:', err)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleToggleWishlist = async () => {
    if (!product) return
    
    setAddingToWishlist(true)
    try {
      await toggleWishlist(product._id)
    } catch (err) {
      console.error('Error toggling wishlist:', err)
    } finally {
      setAddingToWishlist(false)
    }
  }

  const getTimeLeft = () => {
    if (!product?.discountEndDate) return null
    
    const endDate = new Date(product.discountEndDate)
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    
    if (diff <= 0) return "Expired"
    
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const discountedPrice = product.discount > 0 
    ? product.price - (product.price * product.discount / 100)
    : product.price

  // Format price to remove unnecessary decimal places
  const formatPrice = (price: number) => {
    return price % 1 === 0 ? price.toString() : price.toFixed(2)
  }

  // Show main image first, then additional images (excluding the main image to avoid duplication)
  const additionalImages = (product.images || []).filter(img => img !== product.imageUrl)
  const allImages = [product?.imageUrl || "/luxury-perfume-bottle-in-ethereal-lighting-with-go.jpg", ...((product?.images || []).filter(img => img !== product?.imageUrl))].filter(Boolean)
  const timeLeft = getTimeLeft()

  // Debug logging
  console.log('🖼️ Product images debug:', {
    imageUrl: product.imageUrl,
    images: product.images,
    additionalImages: additionalImages,
    allImages: allImages,
    allImagesLength: allImages.length
  })
  
  // Debug individual image URLs
  allImages.forEach((img, index) => {
    console.log(`🖼️ Image ${index}:`, img)
  })
  
  console.log('💰 Price debug:', {
    price: product.price,
    discount: product.discount,
    discountedPrice: discountedPrice,
    hasDiscount: product.discount > 0,
    discountCondition: product?.discount && product.discount > 0
  })

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
            {product?.category && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">{product.category.name}</span>
              </>
            )}
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{product?.name || 'Product'}</span>
          </nav>
        </div>
      </div>

      {/* Product Hero Section */}
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductImageGallery
              images={allImages.length ? allImages : ["/luxury-perfume-bottle-in-ethereal-lighting-with-go.jpg"]}
              productName={product?.name || "Product"}
              discount={product?.discount || 0}
              className="w-full"
            />
            
            {/* Stock Status Badges */}
              {product && product.stockQuantity <= 5 && product.stockQuantity > 0 && (
              <div className="flex justify-center">
                <Badge className="bg-amber-500 text-white">
                  {product.stockQuantity === 1 ? 'Last One!' : `Only ${product.stockQuantity} left!`}
                </Badge>
              </div>
              )}
              {product && product.stockQuantity === 0 && (
              <div className="flex justify-center">
                <Badge className="bg-red-500 text-white">Out of Stock</Badge>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{product?.category?.name || "Fragrance"}</p>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4">{product?.name || "Loading..."}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(ratingStats.averageRating) ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {ratingStats.averageRating.toFixed(1)} ({ratingStats.totalReviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">PKR {formatPrice(discountedPrice)}</span>
                {product?.discount && Number(product.discount) > 0 && (
                  <span className="text-xl text-muted-foreground line-through">PKR {formatPrice(product.price)}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground leading-relaxed">{product?.description || "A luxury fragrance crafted for sophistication and individuality. Experience the essence of ZAU Perfumes."}</p>
            </div>

            {/* Stock Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${product && product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  {product ? (
                    product.stockQuantity > 0 ? (
                      <span className="text-green-600">
                        {product.stockQuantity === 1 ? 'Only 1 left in stock!' : 
                         product.stockQuantity <= 5 ? `Only ${product.stockQuantity} left in stock!` :
                         `${product.stockQuantity} available`}
                      </span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )
                  ) : (
                    "Loading..."
                  )}
                </span>
              </div>
              
              {product && product.stockQuantity > 0 && product.stockQuantity <= 10 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    ⚠️ Low stock alert! Only {product.stockQuantity} {product.stockQuantity === 1 ? 'item' : 'items'} remaining.
                  </p>
                </div>
              )}

              {/* Stock Progress Bar */}
              {product && product.stockQuantity > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Stock Level</span>
                    <span>{product.stockQuantity} available</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        product.stockQuantity <= 5 ? 'bg-red-500' :
                        product.stockQuantity <= 15 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min((product.stockQuantity / 50) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 p-0"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center font-medium">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setQuantity(quantity + 1)} 
                    className="h-10 w-10 p-0"
                    disabled={product && quantity >= product.stockQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Max: {product ? product.stockQuantity : '...'}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!product || product.stockQuantity === 0 || addingToCart}
                  onClick={handleAddToCart}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {!product ? "Loading..." : 
                       product.stockQuantity === 0 ? "Out of Stock" : 
                       isInCart(product._id) ? "In Cart" : 
                       product.stockQuantity <= 5 ? `Add to Cart (${product.stockQuantity} left)` :
                       "Add to Cart"}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleWishlist}
                  disabled={!product || addingToWishlist}
                  className={isInWishlist(product?._id || "") ? "text-primary border-primary" : ""}
                >
                  {addingToWishlist ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart className={`w-4 h-4 ${isInWishlist(product?._id || "") ? "fill-current" : ""}`} />
                  )}
                </Button>
                <ShareButton
                  productName={product?.name || "Product"}
                  productPrice={product?.price || 0}
                  productImage={product?.imageUrl}
                  discount={product?.discount || 0}
                  variant="icon"
                  size="md"
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Key Features</h3>
              <ul className="space-y-2">
                {features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Authentic Guarantee</p>
              </div>
              <div className="text-center">
                <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">30-Day Returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Fragrance Notes */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Fragrance Notes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-primary mb-3">Top Notes</h3>
                  <ul className="space-y-1">
                    {fragranceNotes.top.map((note: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-3">Middle Notes</h3>
                  <ul className="space-y-1">
                    {fragranceNotes.middle.map((note: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-3">Base Notes</h3>
                  <ul className="space-y-1">
                    {fragranceNotes.base.map((note: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews & Questions */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              {/* Tabs */}
              <div className="flex items-center gap-6 mb-6 border-b border-border">
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 text-lg font-medium transition-colors ${
                    activeTab === 'reviews'
                      ? 'text-foreground border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  REVIEWS
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`pb-3 text-lg font-medium transition-colors ${
                    activeTab === 'questions'
                      ? 'text-foreground border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  QUESTIONS
                </button>
              </div>

              {/* Reviews Tab Content */}
              {activeTab === 'reviews' && (
                <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-foreground">Customer Reviews</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                              i < Math.floor(ratingStats.averageRating) ? "fill-primary text-primary" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                        {ratingStats.averageRating.toFixed(1)} out of 5 ({ratingStats.totalReviews} reviews)
                  </span>
                </div>
              </div>

              {/* Rating Distribution */}
              {ratingStats.totalReviews > 0 && (
                <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-3">Rating Distribution</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${ratingStats.totalReviews > 0 ? (ratingStats.distribution[rating as keyof typeof ratingStats.distribution] / ratingStats.totalReviews) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground w-8">
                          {ratingStats.distribution[rating as keyof typeof ratingStats.distribution]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Review Form */}
              <div className="mb-8 p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {reviewError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded">
                      {reviewError}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={newReview.email}
                      onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
                      className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      required
                    />
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Review Title (Optional)"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <span>Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="text-2xl"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newReview.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    placeholder="Write your review..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    required
                  />
                  
                  <Button type="submit" disabled={submittingReview || newReview.rating === 0}>
                    {submittingReview ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </Button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {reviewsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading reviews...</span>
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div key={review._id}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">{review.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-foreground">{review.name}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                          {review.title && (
                            <h4 className="font-medium text-foreground mb-1">{review.title}</h4>
                          )}
                        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                    {index < reviews.length - 1 && <Separator className="mt-6" />}
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviews yet. Be the first to review this product!
                  </div>
                )}
              </div>
                </>
              )}

              {/* Questions Tab Content */}
              {activeTab === 'questions' && (
                <ProductQuestions productId={product._id} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-foreground mb-2">
              You Might Also Like
            </h2>
            <p className="text-muted-foreground">
              Discover more products in the same category
            </p>
          </div>

          {relatedLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading related products...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductPreview 
                  key={relatedProduct._id} 
                  product={relatedProduct} 
                  showQuickActions={true}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/#collections">
              <Button variant="outline" className="luxury-gradient text-black">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
