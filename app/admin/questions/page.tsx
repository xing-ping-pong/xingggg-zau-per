"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  MessageCircle, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Eye,
  Trash2,
  Send
} from "lucide-react"
import { useToast } from "@/lib/contexts/toast-context"

interface Question {
  _id: string;
  question: string;
  firstName: string;
  lastName: string;
  email: string;
  answer?: string;
  answeredBy?: {
    _id: string;
    name: string;
    email: string;
  };
  answeredAt?: string;
  status: 'pending' | 'answered' | 'rejected';
  isPublic: boolean;
  product: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [answerText, setAnswerText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const { showToast } = useToast()

  // Fetch questions
  const fetchQuestions = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/questions?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setQuestions(data.data.questions)
        setPagination(data.data.pagination)
      } else {
        showToast('Failed to load questions', 'error')
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      showToast('Failed to load questions', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions(1) // Always start from page 1 when filters change
  }, [statusFilter, searchTerm])

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle answer submission
  const handleAnswerSubmit = async () => {
    if (!selectedQuestion || !answerText.trim()) {
      showToast('Please enter an answer', 'error')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/admin/questions/${selectedQuestion._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: answerText.trim(),
          status: 'answered'
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        showToast('Answer submitted successfully', 'success')
        setSelectedQuestion(null)
        setAnswerText("")
        fetchQuestions(pagination.page)
      } else {
        showToast(data.message || 'Failed to submit answer', 'error')
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      showToast('Failed to submit answer', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle status change
  const handleStatusChange = async (questionId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()
      
      if (data.success) {
        showToast('Status updated successfully', 'success')
        fetchQuestions(pagination.page)
      } else {
        showToast(data.message || 'Failed to update status', 'error')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      showToast('Failed to update status', 'error')
    }
  }

  // Handle delete
  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (data.success) {
        showToast('Question deleted successfully', 'success')
        fetchQuestions(pagination.page)
      } else {
        showToast(data.message || 'Failed to delete question', 'error')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      showToast('Failed to delete question', 'error')
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'answered':
        return <Badge variant="default" className="bg-green-500">Answered</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Questions & Answers</h1>
          <p className="text-muted-foreground">Manage customer questions and provide answers</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search questions, names, or emails..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div key={`${statusFilter}-${searchTerm}`} className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No questions found</p>
            </CardContent>
          </Card>
        ) : (
          questions.map((question) => (
            <Card key={question._id} className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Question Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {question.firstName} {question.lastName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({question.email})
                        </span>
                        {getStatusBadge(question.status)}
                      </div>
                      <p className="text-foreground mb-2">{question.question}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(question.createdAt)}</span>
                        </div>
                        <span>Product: {question.product.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedQuestion(question)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {question.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(question._id, 'answered')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Answered
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(question._id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(question._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Answer */}
                  {question.answer && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-medium text-primary">Admin Answer</span>
                        {question.answeredAt && (
                          <span className="text-sm text-muted-foreground">
                            {formatDate(question.answeredAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground">{question.answer}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Answer Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Answer Question</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedQuestion(null)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Question:</h4>
                <p className="text-muted-foreground">{selectedQuestion.question}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Your Answer:</h4>
                <Textarea
                  placeholder="Enter your answer here..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={submitting || !answerText.trim()}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Answer
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedQuestion(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchQuestions(pagination.page - 1)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchQuestions(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
