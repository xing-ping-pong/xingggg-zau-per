"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Star, 
  MessageCircle, 
  Eye, 
  Check, 
  X, 
  Trash2, 
  Loader2,
  Search,
  Filter,
  Upload,
  Download,
  Plus,
  FileText
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductReview {
  _id: string;
  product: {
    _id: string;
    name: string;
  };
  name: string;
  email: string;
  rating: number;
  title?: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogComment {
  _id: string;
  blog: {
    _id: string;
    title: string;
  };
  name: string;
  email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminReviewsPage() {
  const [productReviews, setProductReviews] = useState<ProductReview[]>([])
  const [blogComments, setBlogComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("product-reviews")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [bulkImportType, setBulkImportType] = useState<'reviews' | 'comments'>('reviews')
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null)
  const [bulkImportProgress, setBulkImportProgress] = useState(0)
  const [bulkImportResults, setBulkImportResults] = useState<any>(null)
  const [bulkImportLoading, setBulkImportLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab, currentPage, statusFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === "product-reviews") {
        await fetchProductReviews()
      } else {
        await fetchBlogComments()
      }
    } catch (err) {
      setError('Failed to load data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProductReviews = async () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '10',
      status: statusFilter === 'all' ? '' : statusFilter,
      search: searchTerm
    })
    
    const response = await fetch(`/api/admin/reviews?${params}`)
    const data = await response.json()
    
    if (data.success) {
      setProductReviews(data.data.reviews)
      setTotalPages(data.data.pagination.totalPages)
    } else {
      setError(data.message || 'Failed to fetch reviews')
    }
  }

  const fetchBlogComments = async () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '10',
      status: statusFilter === 'all' ? '' : statusFilter,
      search: searchTerm
    })
    
    const response = await fetch(`/api/admin/comments?${params}`)
    const data = await response.json()
    
    if (data.success) {
      setBlogComments(data.data.comments)
      setTotalPages(data.data.pagination.totalPages)
    } else {
      setError(data.message || 'Failed to fetch comments')
    }
  }

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected', type: 'review' | 'comment') => {
    try {
      const endpoint = type === 'review' ? `/api/admin/reviews/${id}` : `/api/admin/comments/${id}`
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      if (data.success) {
        // Update local state
        if (type === 'review') {
          setProductReviews(prev => 
            prev.map(review => 
              review._id === id ? { ...review, status: newStatus } : review
            )
          )
        } else {
          setBlogComments(prev => 
            prev.map(comment => 
              comment._id === id ? { ...comment, status: newStatus } : comment
            )
          )
        }
      } else {
        setError(data.message || 'Failed to update status')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleDelete = async (id: string, type: 'review' | 'comment') => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const endpoint = type === 'review' ? `/api/admin/reviews/${id}` : `/api/admin/comments/${id}`
      const response = await fetch(endpoint, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        // Remove from local state
        if (type === 'review') {
          setProductReviews(prev => prev.filter(review => review._id !== id))
        } else {
          setBlogComments(prev => prev.filter(comment => comment._id !== id))
        }
      } else {
        setError(data.message || 'Failed to delete item')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleBulkImport = async () => {
    if (!bulkImportFile) return

    setBulkImportLoading(true)
    setBulkImportProgress(0)
    setBulkImportResults(null)

    try {
      const formData = new FormData()
      formData.append('file', bulkImportFile)
      formData.append('type', bulkImportType)

      const response = await fetch(`/api/admin/bulk-import`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        setBulkImportResults(data.data)
        setBulkImportProgress(100)
        // Refresh the current data
        fetchData()
      } else {
        setError(data.message || 'Failed to import data')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setBulkImportLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = bulkImportType === 'reviews' 
      ? 'productId,name,email,rating,title,comment\n"PRODUCT_ID","John Doe","john@example.com","5","Great product!","This product is amazing!"\n"PRODUCT_ID","Jane Smith","jane@example.com","4","Good quality","Nice product, would recommend."'
      : 'blogId,name,email,content\n"BLOG_ID","Alice Johnson","alice@example.com","Great article! Very informative."\n"BLOG_ID","Bob Wilson","bob@example.com","Thanks for sharing this valuable content."'

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${bulkImportType}-template.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setBulkImportFile(file)
      setBulkImportResults(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive"
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading reviews...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reviews & Comments Management</h1>
        <p className="text-muted-foreground">Manage product reviews and blog comments</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="product-reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Product Reviews
          </TabsTrigger>
          <TabsTrigger value="blog-comments" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Blog Comments
          </TabsTrigger>
        </TabsList>

        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchData} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
          <Button 
            onClick={() => setBulkImportOpen(true)} 
            className="luxury-gradient text-black"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
        </div>

        {/* Product Reviews Tab */}
        <TabsContent value="product-reviews">
          <Card>
            <CardHeader>
              <CardTitle>Product Reviews ({productReviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productReviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell className="font-medium">
                        {review.product?.name || 'Unknown Product'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{review.name}</div>
                          <div className="text-sm text-muted-foreground">{review.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-sm">{review.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {review.title || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(review.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {review.status !== 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(review._id, 'approved', 'review')}
                              className="h-8 px-2"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          )}
                          {review.status !== 'rejected' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(review._id, 'rejected', 'review')}
                              className="h-8 px-2"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(review._id, 'review')}
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blog Comments Tab */}
        <TabsContent value="blog-comments">
          <Card>
            <CardHeader>
              <CardTitle>Blog Comments ({blogComments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Blog Post</TableHead>
                    <TableHead>Commenter</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogComments.map((comment) => (
                    <TableRow key={comment._id}>
                      <TableCell className="font-medium">
                        {comment.blog?.title || 'Unknown Post'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{comment.name}</div>
                          <div className="text-sm text-muted-foreground">{comment.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={comment.content}>
                          {comment.content}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(comment.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {comment.status !== 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(comment._id, 'approved', 'comment')}
                              className="h-8 px-2"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          )}
                          {comment.status !== 'rejected' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(comment._id, 'rejected', 'comment')}
                              className="h-8 px-2"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(comment._id, 'comment')}
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {bulkImportOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Bulk Import {bulkImportType === 'reviews' ? 'Reviews' : 'Comments'}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setBulkImportOpen(false)
                    setBulkImportFile(null)
                    setBulkImportResults(null)
                    setBulkImportProgress(0)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Import Type Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Import Type</label>
                  <Select value={bulkImportType} onValueChange={(value: 'reviews' | 'comments') => setBulkImportType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reviews">Product Reviews</SelectItem>
                      <SelectItem value="comments">Blog Comments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Template Download */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Download Template</h3>
                      <p className="text-sm text-muted-foreground">
                        Download a CSV template with the correct format
                      </p>
                    </div>
                    <Button onClick={downloadTemplate} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Upload CSV File</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop your CSV file
                      </p>
                      {bulkImportFile && (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {bulkImportFile.name}
                        </p>
                      )}
                    </label>
                  </div>
                </div>

                {/* CSV Format Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
                  <div className="text-sm text-blue-800">
                    {bulkImportType === 'reviews' ? (
                      <div>
                        <p><strong>Required columns:</strong> productId, name, email, rating, title, comment</p>
                        <p><strong>Example:</strong></p>
                        <code className="block bg-blue-100 p-2 rounded mt-1 text-xs">
                          productId,name,email,rating,title,comment<br/>
                          "PRODUCT_ID","John Doe","john@example.com","5","Great product!","This product is amazing!"
                        </code>
                      </div>
                    ) : (
                      <div>
                        <p><strong>Required columns:</strong> blogId, name, email, content</p>
                        <p><strong>Example:</strong></p>
                        <code className="block bg-blue-100 p-2 rounded mt-1 text-xs">
                          blogId,name,email,content<br/>
                          "BLOG_ID","Alice Johnson","alice@example.com","Great article! Very informative."
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress */}
                {bulkImportLoading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Importing...</span>
                      <span>{bulkImportProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${bulkImportProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Results */}
                {bulkImportResults && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Import Results:</h4>
                    <div className="text-sm text-green-800 space-y-1">
                      <p>✅ Successfully imported: {bulkImportResults.successCount}</p>
                      {bulkImportResults.errorCount > 0 && (
                        <p>❌ Failed to import: {bulkImportResults.errorCount}</p>
                      )}
                      {bulkImportResults.errors && bulkImportResults.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Errors:</p>
                          <ul className="list-disc list-inside text-xs">
                            {bulkImportResults.errors.slice(0, 5).map((error: string, index: number) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBulkImportOpen(false)
                      setBulkImportFile(null)
                      setBulkImportResults(null)
                      setBulkImportProgress(0)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkImport}
                    disabled={!bulkImportFile || bulkImportLoading}
                    className="luxury-gradient text-black"
                  >
                    {bulkImportLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
