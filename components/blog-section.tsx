"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  publishedAt?: string;
  createdAt: string;
  views: number;
  likes: number;
}

export function BlogSection() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  // ...existing code...

  // Fetch blog posts from API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/blogs?status=published&limit=3&sortBy=publishedAt&sortOrder=desc')
        const data = await response.json()
        
        if (data.success) {
          setBlogPosts(data.data.blogs)
        } else {
          setError('Failed to load blog posts')
        }
      } catch (err) {
        setError('Failed to load blog posts')
        console.error('Error fetching blog posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getReadTime = (excerpt: string) => {
    const wordsPerMinute = 200
    const wordCount = excerpt.split(' ').length
    const readTime = Math.ceil(wordCount / wordsPerMinute)
    return `${readTime} min read`
  }

  if (loading) {
    return (
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">The Art of Fragrance</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Insights, stories, and inspiration from the world of luxury perfumery
            </p>
          </div>
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading blog posts...</span>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">The Art of Fragrance</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Insights, stories, and inspiration from the world of luxury perfumery
            </p>
          </div>
          <div className="text-center">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  // Hide section if no blog posts
  if (!loading && !error && blogPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-card">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">The Art of Fragrance</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Insights, stories, and inspiration from the world of luxury perfumery
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.length > 0 ? (
            blogPosts.map((post) => (
              <Card key={post._id} className="group hover-lift border-0 bg-background overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={post.featuredImage || "/placeholder.svg"}
                    alt={`${post.title} - Blog post featured image`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(post.publishedAt || post.createdAt)}
                    <span className="mx-2">•</span>
                    {getReadTime(post.excerpt)}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="ghost" className="p-0 h-auto font-semibold text-primary hover:text-primary/80">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No blog posts available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
