"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown, ChevronUp, HelpCircle } from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "What is your return policy?",
  answer: "We offer a 7-day exchange policy for all unused, unopened products in their original packaging. Items must be exchanged within 7 days of delivery. Custom or personalized items are not eligible for exchange.",
    category: "Returns & Exchanges"
  },
  {
    id: "2",
    question: "How long does shipping take?",
    answer: "Standard shipping takes 3-5 business days within the US. Express shipping takes 1-2 business days. International shipping varies by location but typically takes 7-14 business days.",
    category: "Shipping & Delivery"
  },
  {
    id: "3",
    question: "Do you ship internationally?",
    answer: "Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination. Please check our shipping calculator during checkout for specific rates to your location.",
    category: "Shipping & Delivery"
  },
  {
    id: "4",
    question: "How do I track my order?",
    answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order by visiting our Track Your Order page and entering your order number and email address.",
    category: "Orders"
  },
  {
    id: "5",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and Shop Pay. All payments are processed securely through our encrypted checkout system.",
    category: "Payment"
  },
  {
    id: "6",
    question: "Are your perfumes authentic?",
    answer: "Absolutely! We are an authorized retailer for all the brands we carry. Every product is 100% authentic and comes directly from the manufacturer or authorized distributors.",
    category: "Products"
  },
  {
    id: "7",
    question: "How should I store my perfume?",
    answer: "Store your perfume in a cool, dry place away from direct sunlight and heat. Keep the bottle upright and avoid extreme temperature changes. This will help preserve the fragrance for years to come.",
    category: "Products"
  },
  {
    id: "8",
    question: "Can I get a sample before purchasing?",
    answer: "We offer sample sets for many of our fragrances. Look for 'Sample Available' on product pages. Samples are typically 1-2ml and allow you to test the fragrance before committing to a full-size bottle.",
    category: "Products"
  },
  {
    id: "9",
    question: "What if I'm not satisfied with my purchase?",
  answer: "If you're not completely satisfied with your purchase, you can exchange it within 7 days. We want you to love your fragrance, so we make exchanges easy and hassle-free.",
    category: "Returns & Exchanges"
  },
  {
    id: "10",
    question: "Do you offer gift wrapping?",
    answer: "Yes! We offer complimentary gift wrapping for all orders. You can add a personal message and we'll wrap your purchase beautifully. Gift wrapping is available at checkout.",
    category: "Orders"
  },
  {
    id: "11",
    question: "How do I choose the right fragrance?",
    answer: "Consider your personal preferences, the occasion, and the season. Read our fragrance notes and descriptions, check customer reviews, and consider our sample program. Our customer service team is also happy to help with recommendations.",
    category: "Products"
  },
  {
    id: "12",
    question: "What's your customer service hours?",
    answer: "Our customer service team is available Monday through Friday, 9 AM to 6 PM EST, and Saturday through Sunday, 10 AM to 4 PM EST. You can reach us via email, phone, or live chat.",
    category: "Customer Service"
  }
]

const categories = [
  "All",
  "Products",
  "Orders",
  "Shipping & Delivery",
  "Returns & Exchanges",
  "Payment",
  "Customer Service"
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, returns, and more.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No FAQs found matching your search.</p>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((faq) => (
              <Card key={faq.id} className="border-l-4 border-l-primary">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground">{faq.question}</h3>
                    </div>
                    {openItems.includes(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  {openItems.includes(faq.id) && (
                    <div className="px-6 pb-4 border-t border-border">
                      <p className="text-muted-foreground leading-relaxed pt-4">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Contact CTA */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
                Still have questions?
              </h3>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Our customer service team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Contact Us
                </a>
                <a
                  href="/track-order"
                  className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
                >
                  Track Your Order
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
