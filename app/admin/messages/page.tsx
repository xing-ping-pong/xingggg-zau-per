"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Search, Mail, Eye, Reply, Trash2, Clock, AlertCircle, CheckCircle, Archive } from "lucide-react"
import { useToast } from "@/lib/contexts/toast-context"

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: { _id: string; name: string; email: string };
  reply?: string;
  repliedAt?: string;
  repliedBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  })
  const { showToast } = useToast()

  // Fetch messages
  const fetchMessages = async (page = pagination.page) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter }),
        ...(priorityFilter && priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/messages?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.data.messages)
        setPagination(data.data.pagination)
      } else {
        showToast(data.message || "Failed to fetch messages.", "error")
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      showToast("Network error. Failed to fetch messages.", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages(1) // Always start from page 1 when filters change
  }, [statusFilter, categoryFilter, priorityFilter, searchTerm])

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle filter changes
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePriorityFilter = (value: string) => {
    setPriorityFilter(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    fetchMessages(page)
  }

  // Handle replying to a message
  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      showToast("Reply cannot be empty.", "error")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/messages/${selectedMessage._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          reply: replyText, 
          status: 'replied' 
        }),
      })
      const data = await response.json()

      if (data.success) {
        showToast("Reply sent successfully.", "success")
        setSelectedMessage(null)
        setReplyText("")
        fetchMessages(pagination.page) // Refresh current page
      } else {
        showToast(data.message || "Failed to send reply.", "error")
      }
    } catch (error) {
      console.error("Error sending reply:", error)
      showToast("Network error. Failed to send reply.", "error")
    } finally {
      setSubmitting(false)
    }
  }

  // Handle changing message status
  const handleChangeStatus = async (messageId: string, newStatus: 'new' | 'read' | 'replied' | 'archived') => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await response.json()

      if (data.success) {
        showToast(`Message status updated to ${newStatus}.`, "success")
        fetchMessages(pagination.page) // Refresh current page
      } else {
        showToast(data.message || "Failed to update status.", "error")
      }
    } catch (error) {
      console.error("Error changing status:", error)
      showToast("Network error. Failed to update status.", "error")
    } finally {
      setSubmitting(false)
    }
  }

  // Handle deleting a message
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (data.success) {
        showToast("Message deleted successfully.", "success")
        fetchMessages(pagination.page) // Refresh current page
      } else {
        showToast(data.message || "Failed to delete message.", "error")
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      showToast("Network error. Failed to delete message.", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="w-4 h-4" />
      case 'read':
        return <Eye className="w-4 h-4" />
      case 'replied':
        return <Reply className="w-4 h-4" />
      case 'archived':
        return <Archive className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-500'
      case 'read':
        return 'bg-blue-500'
      case 'replied':
        return 'bg-green-500'
      case 'archived':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 p-6">
        <Card className="mb-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-serif">Contact Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, subject, or message..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-background text-foreground border-border"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-32 bg-background text-foreground border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-foreground border-border">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
                  <SelectTrigger className="w-40 bg-background text-foreground border-border">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-foreground border-border">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="order">Order</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={handlePriorityFilter}>
                  <SelectTrigger className="w-32 bg-background text-foreground border-border">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-foreground border-border">
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <div key={`${statusFilter}-${categoryFilter}-${priorityFilter}-${searchTerm}`} className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages found.
            </div>
          ) : (
            <Card className="bg-card border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[200px]">Customer</TableHead>
                    <TableHead className="w-[150px]">Subject</TableHead>
                    <TableHead className="w-[100px]">Category</TableHead>
                    <TableHead className="w-[80px]">Priority</TableHead>
                    <TableHead className="w-[100px] text-center">Status</TableHead>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="w-[150px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message._id} className="hover:bg-muted/20">
                      <TableCell>
                        <div>
                          <p className="font-medium">{message.name}</p>
                          <p className="text-sm text-muted-foreground">{message.email}</p>
                          {message.phone && (
                            <p className="text-xs text-muted-foreground">{message.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">{message.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {message.category.charAt(0).toUpperCase() + message.category.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(message.priority)}`}
                        >
                          {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline"
                          className={`${getStatusColor(message.status)} text-white border-0`}
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon(message.status)}
                            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => {
                              setSelectedMessage(message)
                              setReplyText(message.reply || "")
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            onClick={() => handleDeleteMessage(message._id)}
                            disabled={submitting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(pagination.page - 1)} 
                    disabled={!pagination.hasPrev || loading} 
                  />
                </PaginationItem>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      onClick={() => handlePageChange(i + 1)} 
                      isActive={pagination.page === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(pagination.page + 1)} 
                    disabled={!pagination.hasNext || loading} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>

      {/* View/Reply Message Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-[600px] bg-card text-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              {selectedMessage?.status === 'replied' ? 'View Message' : 'Reply to Message'}
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">From:</p>
                  <p className="font-semibold">{selectedMessage.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                  {selectedMessage.phone && (
                    <p className="text-sm text-muted-foreground">{selectedMessage.phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category:</p>
                  <Badge variant="outline" className="text-xs">
                    {selectedMessage.category.charAt(0).toUpperCase() + selectedMessage.category.slice(1)}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Priority: {selectedMessage.priority.charAt(0).toUpperCase() + selectedMessage.priority.slice(1)}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Subject:</p>
                <p className="font-semibold">{selectedMessage.subject}</p>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-md border border-border">
                <p className="font-semibold text-foreground mb-1">Message:</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{selectedMessage.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Received: {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedMessage.reply && (
                <div className="bg-primary/10 p-3 rounded-md border border-primary/20">
                  <p className="font-semibold text-primary mb-1">Your Reply:</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedMessage.reply}</p>
                  {selectedMessage.repliedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Replied: {new Date(selectedMessage.repliedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {selectedMessage.status !== 'replied' && (
                <>
                  <div className="grid gap-2">
                    <label htmlFor="reply" className="font-semibold text-foreground">Your Reply</label>
                    <Textarea
                      id="reply"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      className="min-h-[120px] bg-background text-foreground border-border"
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => handleChangeStatus(selectedMessage._id, 'read')}
                      disabled={submitting}
                    >
                      Mark as Read
                    </Button>
                    <Button 
                      onClick={handleReply} 
                      disabled={submitting || !replyText.trim()}
                      className="luxury-gradient text-black font-semibold"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          Send Reply <Reply className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
