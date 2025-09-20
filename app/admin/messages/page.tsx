"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageSquare, Reply, Search, Mail, MailOpen, CheckCircle } from "lucide-react"

// Mock data - replace with actual data fetching
const mockMessages = [
  {
    id: 11,
    name: "Lays",
    email: "lays@gmail.com",
    message: "Lays",
    date: "July 27, 2025, 2:18 pm",
    status: "unread",
    reply: null,
  },
  {
    id: 10,
    name: "Ali Jan",
    email: "ali.mahesar04@gmail.com",
    message: "Testing.",
    date: "July 27, 2025, 1:55 pm",
    status: "replied",
    reply: {
      content: "testing.!!!!",
      date: "July 27, 2025, 1:55 pm",
    },
  },
  {
    id: 9,
    name: "jjaannn",
    email: "ali.jan.startitup@gmail.com",
    message: "hello world",
    date: "July 26, 2025, 4:30 pm",
    status: "read",
    reply: null,
  },
  {
    id: 8,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    message: "I'm interested in your luxury perfume collection. Do you have any recommendations for evening wear?",
    date: "July 25, 2025, 11:20 am",
    status: "unread",
    reply: null,
  },
]

const statusOptions = [
  { value: "unread", label: "Unread", icon: Mail, color: "bg-red-900 text-red-300" },
  { value: "read", label: "Read", icon: MailOpen, color: "bg-gray-700 text-gray-300" },
  { value: "replied", label: "Replied", icon: CheckCircle, color: "bg-green-900 text-green-300" },
]

export default function MessagesPage() {
  const [messages, setMessages] = useState(mockMessages)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [replyContent, setReplyContent] = useState("")

  const handleStatusChange = (messageId: number, newStatus: string) => {
    setMessages(messages.map((message) => (message.id === messageId ? { ...message, status: newStatus } : message)))
  }

  const handleReply = (message: any) => {
    setSelectedMessage(message)
    setReplyContent(message.reply?.content || "")
    setIsReplyDialogOpen(true)
  }

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMessage || !replyContent.trim()) return

    // Update the message with the reply
    setMessages(
      messages.map((message) =>
        message.id === selectedMessage.id
          ? {
              ...message,
              status: "replied",
              reply: {
                content: replyContent,
                date: new Date().toLocaleString(),
              },
            }
          : message,
      ),
    )

    setIsReplyDialogOpen(false)
    setReplyContent("")
    setSelectedMessage(null)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status)
    if (!statusConfig) return null

    const Icon = statusConfig.icon
    return (
      <Badge className={`${statusConfig.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    )
  }

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || message.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-amber-400">Message Management</h1>
          <p className="text-gray-400 mt-1">Manage customer inquiries and support requests</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or message content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Messages</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Modal */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-amber-400">
              {selectedMessage?.reply ? "Update Reply" : "Reply to Message"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Responding to {selectedMessage?.name} ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Original Message:</h4>
                <p className="text-gray-300">{selectedMessage.message}</p>
                <p className="text-gray-500 text-sm mt-2">{selectedMessage.date}</p>
              </div>

              <form onSubmit={handleSubmitReply} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reply" className="text-gray-300">
                    Your Reply
                  </Label>
                  <Textarea
                    id="reply"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white min-h-32"
                    placeholder="Type your reply here..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsReplyDialogOpen(false)
                      setReplyContent("")
                      setSelectedMessage(null)
                    }}
                    className="border-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-amber-400 hover:bg-amber-500 text-black">
                    {selectedMessage?.reply ? "Update Reply" : "Send Reply"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-amber-400 flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Messages
          </CardTitle>
          <CardDescription className="text-gray-400">Customer inquiries and support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Customer</TableHead>
                <TableHead className="text-gray-300">Message</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id} className="border-gray-800">
                  <TableCell className="text-white font-medium">{message.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-white font-medium">{message.name}</p>
                      <p className="text-gray-400 text-sm">{message.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="space-y-2">
                      <p className="text-gray-300 truncate">{message.message}</p>
                      {message.reply && (
                        <div className="bg-gray-800 rounded p-2 border-l-2 border-amber-400">
                          <p className="text-xs text-amber-400 font-semibold mb-1">Admin's Reply:</p>
                          <p className="text-gray-300 text-sm">{message.reply.content}</p>
                          <p className="text-gray-500 text-xs mt-1">Replied on: {message.reply.date}</p>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{message.date}</TableCell>
                  <TableCell>
                    <Select value={message.status} onValueChange={(value) => handleStatusChange(message.id, value)}>
                      <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReply(message)}
                      className={`border-gray-700 hover:bg-gray-800 ${
                        message.reply ? "text-amber-400 border-amber-400/50" : ""
                      }`}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      {message.reply ? "Update" : "Reply"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMessages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No messages found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
