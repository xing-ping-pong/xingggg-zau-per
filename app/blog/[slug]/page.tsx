"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Eye, Heart, MessageCircle, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  images?: string[];
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: number;
  commentsCount: number;
  publishedAt?: string;
  createdAt: string;
}

interface Review {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [blog, setBlog] = useState<Blog | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [newReview, setNewReview] = useState({ name: "", email: "", rating: 0, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState("")
  const [userLiked, setUserLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    if (slug) {
      fetchBlog()
    }
  }, [slug])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blogs?slug=${slug}`)
      const data = await response.json()

      if (data.success && data.data.blogs.length > 0) {
        const fetchedBlog = data.data.blogs[0]
        setBlog(fetchedBlog)
        setLikesCount(fetchedBlog.likes || 0)
        fetchReviews(fetchedBlog._id)
      } else {
        setError('Blog post not found')
      }
    } catch (err) {
      setError('Failed to load blog post')
      console.error('Error fetching blog:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async (blogId: string) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}/reviews`)
      const data = await response.json()
      if (data.success && data.data && Array.isArray(data.data.reviews)) {
        setReviews(data.data.reviews)
      } else {
        setReviews([]) // Ensure reviews is always an array
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setReviews([]) // Ensure reviews is always an array
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blog) return

    setSubmittingReview(true)
    setReviewError("")

    try {
      const response = await fetch(`/api/blogs/${blog._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview),
      })
      const data = await response.json()

      if (data.success) {
        setNewReview({ name: "", email: "", rating: 0, comment: "" })
        fetchReviews(blog._id)
      } else {
        setReviewError(data.message || 'Failed to submit review')
      }
    } catch (err) {
      setReviewError('Network error. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleLikeToggle = async () => {
    if (!blog) return

    try {
      const response = await fetch(`/api/blogs/${blog._id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'guest' }) // Using guest for now
      })
      const data = await response.json()

      if (data.success) {
        setLikesCount(data.data.likes)
        setUserLiked(data.data.liked)
      } else {
        setError(data.message || 'Failed to toggle like')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading blog post...</span>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Blog Not Found</h1>
        <p className="text-muted-foreground mb-8">{error || 'The blog post you are looking for does not exist.'}</p>
        <Link href="/blog">
          <Button className="luxury-gradient text-black">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/blog">
          <Button variant="ghost" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blog</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <article className="space-y-8">
            {/* Header */}
            <header className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{blog.category}</Badge>
                {blog.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
              
              <h1 className="text-4xl font-bold">{blog.title}</h1>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{blog.publishedAt ? formatDate(blog.publishedAt) : formatDate(blog.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>{blog.views}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>{likesCount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{Array.isArray(reviews) ? reviews.length : 0}</span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            <div className="aspect-video overflow-hidden rounded-lg">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <div className="text-lg text-muted-foreground mb-6">
                {blog.excerpt}
              </div>
              <div className="whitespace-pre-wrap">
                {blog.content}
              </div>
            </div>

            {/* Additional Images */}
            {blog.images && blog.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {blog.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${blog.title} - Image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-4 pt-8 border-t">
              <Button
                onClick={handleLikeToggle}
                variant={userLiked ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <Heart className={`h-4 w-4 ${userLiked ? 'fill-current' : ''}`} />
                <span>{userLiked ? 'Liked' : 'Like'} ({likesCount})</span>
              </Button>
            </div>
          </article>

          {/* Reviews Section */}
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold">Reviews ({Array.isArray(reviews) ? reviews.length : 0})</h2>
            
            {/* Add Review Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add a Review</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {reviewError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded">
                      {reviewError}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Your Name"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={newReview.email}
                      onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
                      required
                    />
                  </div>
                  
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
                  
                  <Textarea
                    placeholder="Write your review..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows={4}
                    required
                  />
                  
                  <Button type="submit" disabled={submittingReview}>
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
              </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
              {Array.isArray(reviews) && reviews.map((review) => (
                <Card key={review._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{review.user.name}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Info */}
          <Card>
            <CardHeader>
              <CardTitle>About the Author</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                  {blog.author.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{blog.author.name}</div>
                  <div className="text-sm text-muted-foreground">{blog.author.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Related Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">More posts coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}