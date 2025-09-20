"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, FileText, Upload, Calendar } from "lucide-react"

// Mock data - replace with actual data fetching
const mockBlogPosts = [
  {
    id: 3,
    title: "How to Choose the Perfect Perfume for Every Occasion",
    content:
      "Choosing the right perfume can be overwhelming with so many options available. In this comprehensive guide, we'll walk you through the essential factors to consider when selecting a fragrance that complements your personality and suits different occasions...",
    publishDate: "2025-06-01",
    featuredImage: "/blog-perfume-guide.jpg",
    excerpt: "A comprehensive guide to selecting the perfect fragrance for any occasion.",
  },
  {
    id: 4,
    title: "5 Common Perfume Mistakes (And How to Fix Them)",
    content:
      "Even perfume enthusiasts make mistakes that can affect how their fragrance performs. From over-application to improper storage, these common errors can diminish your perfume's impact. Learn how to avoid these pitfalls and make the most of your fragrance collection...",
    publishDate: "2025-06-01",
    featuredImage: "/blog-perfume-mistakes.jpg",
    excerpt: "Avoid these common perfume mistakes to get the most out of your fragrance.",
  },
  {
    id: 5,
    title: "The Art of Layering Fragrances",
    content:
      "Fragrance layering is an advanced technique that allows you to create a unique scent signature. By combining different perfumes, you can achieve a personalized fragrance that's truly your own...",
    publishDate: "2025-05-15",
    featuredImage: "/blog-fragrance-layering.jpg",
    excerpt: "Master the art of combining fragrances to create your unique scent.",
  },
]

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState(mockBlogPosts)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    publishDate: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted:", formData)
    setIsAddDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      publishDate: new Date().toISOString().split("T")[0],
    })
    setEditingPost(null)
  }

  const handleEdit = (post: any) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      publishDate: post.publishDate,
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (postId: number) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      setBlogPosts(blogPosts.filter((p) => p.id !== postId))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-amber-400">Blog Management</h1>
          <p className="text-gray-400 mt-1">Create and manage blog posts for your audience</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-400 hover:bg-amber-500 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Add Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-400">
                {editingPost ? "Edit Blog Post" : "Add New Blog Post"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingPost ? "Update blog post information" : "Create a new blog post for your audience"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter blog post title..."
                  required
                />
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
                  rows={2}
                  placeholder="Brief description of the blog post..."
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
                  className="bg-gray-800 border-gray-700 text-white min-h-64"
                  placeholder="Write your blog post content here..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publishDate" className="text-gray-300">
                    Publish Date
                  </Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featuredImage" className="text-gray-300">
                    Featured Image
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="featuredImage"
                      type="file"
                      accept="image/*"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Button type="button" variant="outline" size="icon" className="border-gray-700 bg-transparent">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}
                  className="border-gray-700"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-400 hover:bg-amber-500 text-black">
                  {editingPost ? "Update Post" : "Publish Post"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-amber-400 flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Blog Posts
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your blog content and engage with your audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Featured Image</TableHead>
                <TableHead className="text-gray-300">Title</TableHead>
                <TableHead className="text-gray-300">Excerpt</TableHead>
                <TableHead className="text-gray-300">Publish Date</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogPosts.map((post) => (
                <TableRow key={post.id} className="border-gray-800">
                  <TableCell className="text-white font-medium">{post.id}</TableCell>
                  <TableCell>
                    <img
                      src={post.featuredImage || "/placeholder.svg"}
                      alt={post.title}
                      className="w-16 h-12 object-cover rounded-lg"
                    />
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-white font-medium truncate">{post.title}</p>
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <p className="text-gray-300 text-sm truncate">{post.excerpt}</p>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(post.publishDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                        className="border-gray-700 hover:bg-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="border-red-700 text-red-400 hover:bg-red-900/20"
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
