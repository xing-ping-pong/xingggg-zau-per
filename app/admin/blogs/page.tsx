"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Heart, MessageCircle, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { BLOG_CATEGORIES, PERFUME_TAGS } from "@/lib/constants/blog-categories"

interface Blog {
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
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  views: number;
  likes: number;
  createdAt: string;
  publishedAt?: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    images: "",
    authorName: "",
    authorEmail: "",
    authorAvatar: "",
    tags: [] as string[],
    category: "",
    status: "draft",
    featured: false,
    metaTitle: "",
    metaDescription: "",
  })

  // Fetch blogs and user data
  useEffect(() => {
    fetchBlogs()
    fetchCurrentUser()
  }, [])

  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser && !editingBlog) {
      const newFormData = {
        authorName: currentUser.username || currentUser.name || "",
        authorEmail: currentUser.email || "",
        authorAvatar: currentUser.avatar || ""
      }
      setFormData(prev => ({
        ...prev,
        ...newFormData
      }))
    }
  }, [currentUser, editingBlog])

  const fetchCurrentUser = async () => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        setCurrentUser(user)
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
    }
  }

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/blogs?limit=50')
      const data = await response.json()
      
      if (data.success) {
        setBlogs(data.data.blogs)
      } else {
        setError('Failed to load blogs: ' + data.message)
      }
    } catch (err) {
      setError('Failed to fetch blogs')
      console.error('Error fetching blogs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const blogData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        featuredImage: formData.featuredImage,
        images: formData.images ? formData.images.split(',').map(url => url.trim()) : [],
        author: {
          name: formData.authorName,
          email: formData.authorEmail,
          avatar: formData.authorAvatar || undefined
        },
        tags: formData.tags,
        category: formData.category,
        status: formData.status as 'draft' | 'published' | 'archived',
        featured: formData.featured,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined
      }

      const url = editingBlog ? `/api/blogs/${editingBlog._id}` : '/api/blogs'
      const method = editingBlog ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      })

      const data = await response.json()

      if (data.success) {
        await fetchBlogs()
        setIsAddDialogOpen(false)
        setEditingBlog(null)
        resetForm()
        setError('')
      } else {
        setError(data.message || 'Failed to save blog')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Submit error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        await fetchBlogs()
        setError('')
      } else {
        setError(data.message || 'Failed to delete blog')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Delete error:', err)
    }
  }

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title,
      content: "", // We'll need to fetch full content separately
      excerpt: blog.excerpt,
      featuredImage: blog.featuredImage,
      images: blog.tags.join(', '), // This should be images, but using tags as placeholder
      authorName: blog.author.name,
      authorEmail: blog.author.email,
      authorAvatar: blog.author.avatar || "",
      tags: blog.tags,
      category: blog.category,
      status: blog.status,
      featured: blog.featured,
      metaTitle: "",
      metaDescription: "",
    })
    setIsAddDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      featuredImage: "",
      images: "",
      authorName: currentUser?.username || currentUser?.name || "",
      authorEmail: currentUser?.email || "",
      authorAvatar: currentUser?.avatar || "",
      tags: [] as string[],
      category: "",
      status: "draft",
      featured: false,
      metaTitle: "",
      metaDescription: "",
    })
    setEditingBlog(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500'
      case 'draft': return 'bg-yellow-500'
      case 'archived': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading blogs...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/admin" className="hover:text-foreground transition-colors">
          Admin
        </Link>
        <span>/</span>
        <span className="text-foreground">Blogs</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Admin</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
            <p className="text-muted-foreground">
              Manage your blog posts and content
            </p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBlog ? "Edit Blog Post" : "Add New Blog Post"}
              </DialogTitle>
              <DialogDescription>
                {editingBlog 
                  ? "Update the blog post information below." 
                  : "Fill in the details to create a new blog post."
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded">
                  {error}
                </div>
              )}
              

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">
                    Blog Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOG_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-gray-300">
                  Excerpt
                </Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-gray-300">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={8}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="featuredImage" className="text-gray-300">
                    Featured Image URL
                  </Label>
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images" className="text-gray-300">
                    Additional Images (comma-separated URLs)
                  </Label>
                  <Input
                    id="images"
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authorName" className="text-gray-300">
                    Author Name
                  </Label>
                  <Input
                    id="authorName"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authorEmail" className="text-gray-300">
                    Author Email
                  </Label>
                  <Input
                    id="authorEmail"
                    type="email"
                    value={formData.authorEmail}
                    onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authorAvatar" className="text-gray-300">
                    Author Avatar URL
                  </Label>
                  <Input
                    id="authorAvatar"
                    value={formData.authorAvatar}
                    onChange={(e) => setFormData({ ...formData, authorAvatar: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-gray-300">
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-800 border border-gray-700 rounded-md">
                    {PERFUME_TAGS.map((tag) => {
                      const isSelected = formData.tags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormData(prev => ({
                                ...prev,
                                tags: prev.tags.filter(t => t !== tag)
                              }))
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                tags: [...prev.tags, tag]
                              }))
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            isSelected
                              ? 'bg-amber-500 text-black'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-400">
                    Click tags to select/deselect them
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-300">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })}
                />
                <Label htmlFor="featured" className="text-gray-300">
                  Featured Post
                </Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingBlog ? "Update Blog" : "Create Blog"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>
            A list of all blog posts in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Blog Post</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="h-12 w-16 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium">{blog.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {blog.excerpt.substring(0, 60)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{blog.author.name}</div>
                      <div className="text-sm text-muted-foreground">{blog.author.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{blog.category}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Badge className={getStatusColor(blog.status)}>
                        {blog.status}
                      </Badge>
                      {blog.featured && (
                        <Badge variant="default">Featured</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{blog.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{blog.likes}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(blog)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(blog._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
