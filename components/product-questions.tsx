"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, X, Send, User, Calendar } from "lucide-react"
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
  createdAt: string;
}

interface ProductQuestionsProps {
  productId: string;
}

export default function ProductQuestions({ productId }: ProductQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    question: "",
    firstName: "",
    lastName: "",
    email: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}/questions?status=answered`)
      const data = await response.json()
      
      if (data.success) {
        setQuestions(data.data.questions)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      showToast('Failed to load questions', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [productId])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.question.trim() || !formData.firstName.trim() || 
        !formData.lastName.trim() || !formData.email.trim()) {
      showToast('Please fill in all fields', 'error')
      return
    }

    if (formData.question.length > 500) {
      showToast('Question must be 500 characters or less', 'error')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/products/${productId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (data.success) {
        showToast('Question submitted successfully! We\'ll get back to you soon.', 'success')
        setFormData({
          question: "",
          firstName: "",
          lastName: "",
          email: ""
        })
        setShowForm(false)
        // Refresh questions to show the new one (if admin has answered)
        fetchQuestions()
      } else {
        showToast(data.message || 'Failed to submit question', 'error')
      }
    } catch (error) {
      console.error('Error submitting question:', error)
      showToast('Failed to submit question', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter questions based on search term
  const filteredQuestions = questions.filter(question =>
    question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
    return `${Math.ceil(diffDays / 365)} years ago`
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Ask Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or question..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-black text-white hover:bg-gray-800"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Ask a Question
        </Button>
      </div>

      {/* Question Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Write your question here *</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Textarea
                    placeholder="What do you want to ask?"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="min-h-[120px]"
                    maxLength={500}
                  />
                  <div className="text-right text-sm text-muted-foreground mt-1">
                    {formData.question.length}/500
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Add your details *</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="question-first-name" className="sr-only">First name</label>
                      <Input
                        id="question-first-name"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="question-last-name" className="sr-only">Last name</label>
                      <Input
                        id="question-last-name"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="question-email" className="sr-only">Email address</label>
                    <Input
                      id="question-email"
                      placeholder="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-black text-white hover:bg-gray-800"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Question
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Your email address won't be published with your question.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No questions match your search.' : 'No questions yet. Be the first to ask!'}
            </p>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <Card key={question._id} className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Question */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {question.firstName} {question.lastName}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Customer
                      </Badge>
                    </div>
                    <p className="text-foreground">{question.question}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(question.createdAt)}</span>
                    </div>
                  </div>

                  {/* Answer */}
                  {question.answer && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-medium text-primary">
                          {question.answeredBy?.name || 'Admin'}
                        </span>
                        <Badge variant="default" className="text-xs">
                          Admin
                        </Badge>
                      </div>
                      <p className="text-foreground">{question.answer}</p>
                      {question.answeredAt && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Answered {formatDate(question.answeredAt)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
