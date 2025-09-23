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
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

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
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [newComment, setNewComment] = useState({ name: "", email: "", content: "" })
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState("")
  const [userLiked, setUserLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [commentsLoading, setCommentsLoading] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchBlog()
    }
  }, [slug])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      // First, get the blog ID by slug
      const slugResponse = await fetch(`/api/blogs?slug=${slug}`)
      const slugData = await slugResponse.json()

      if (slugData.success && slugData.data.blogs.length > 0) {
        const blogId = slugData.data.blogs[0]._id
        
        // Then fetch the specific blog to increment view count
        const response = await fetch(`/api/blogs/${blogId}`)
        const data = await response.json()

        if (data.success && data.data.blog) {
          const fetchedBlog = data.data.blog
          setBlog(fetchedBlog)
          setLikesCount(fetchedBlog.likes || 0)
          fetchComments(fetchedBlog._id)
        } else {
          setError('Blog post not found')
        }
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

  const fetchComments = async (blogId: string) => {
    try {
      setCommentsLoading(true)
      const response = await fetch(`/api/blogs/${blogId}/comments`)
      const data = await response.json()
      if (data.success && data.data && Array.isArray(data.data.comments)) {
        setComments(data.data.comments)
      } else {
        setComments([]) // Ensure comments is always an array
      }
    } catch (err) {
      console.error('Error fetching comments:', err)
      setComments([]) // Ensure comments is always an array
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blog) return

    setSubmittingComment(true)
    setCommentError("")

    try {
      const response = await fetch(`/api/blogs/${blog._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newComment,
          userId: 'guest' // For now, using guest
        }),
      })
      const data = await response.json()

      if (data.success) {
        setNewComment({ name: "", email: "", content: "" })
        fetchComments(blog._id)
      } else {
        setCommentError(data.message || 'Failed to submit comment')
      }
    } catch (err) {
      setCommentError('Network error. Please try again.')
    } finally {
      setSubmittingComment(false)
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-12 px-4 pt-24">
        {/* Back Button */}
      <div className="mb-8">
        <Link href="/blog">
          <Button variant="ghost" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blog</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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
              
              <div className="flex items-center justify-between">
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
                    <span>{Array.isArray(comments) ? comments.length : 0}</span>
                  </div>
                </div>
                
                {/* Author Info - moved to header */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                    {blog.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{blog.author.name}</div>
                    <div className="text-xs text-muted-foreground">{blog.author.email}</div>
                  </div>
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

          {/* Comments Section */}
          <div className="mt-16 mb-12 space-y-6">
            <h2 className="text-2xl font-bold">Comments ({Array.isArray(comments) ? comments.length : 0})</h2>
            
            {/* Add Comment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Leave a Comment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  {commentError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded">
                      {commentError}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Your Name"
                      value={newComment.name}
                      onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={newComment.email}
                      onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <Textarea
                    placeholder="Write your comment..."
                    value={newComment.content}
                    onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                    rows={4}
                    required
                  />
                  
                  <Button type="submit" disabled={submittingComment}>
                    {submittingComment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Comment'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Comments List */}
            <div className="space-y-4">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading comments...</span>
                </div>
              ) : Array.isArray(comments) && comments.length > 0 ? (
                comments.map((comment) => (
                  <Card key={comment._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{comment.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{comment.content}</p>
                      
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 ml-4 space-y-3 border-l-2 border-muted pl-4">
                          {comment.replies.map((reply: any) => (
                            <div key={reply._id} className="bg-muted/30 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{reply.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8 mt-8 lg:mt-0">
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
      
      <Footer />
    </div>
  )
}