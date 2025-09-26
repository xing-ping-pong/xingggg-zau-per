'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, Sparkles } from 'lucide-react'

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated Perfume Bottle */}
        <div className="relative mb-8">
          <div className="w-32 h-48 mx-auto relative">
            {/* Bottle Container */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-200/20 to-amber-800/30 rounded-t-3xl rounded-b-lg border-2 border-amber-300/30 shadow-2xl">
              {/* Liquid Animation */}
              <div className="absolute bottom-4 left-2 right-2 h-32 bg-gradient-to-t from-amber-600/40 to-amber-400/60 rounded-lg animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-amber-200/20 rounded-lg animate-bounce"></div>
              </div>
              
              {/* Cap */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg border-2 border-amber-700"></div>
              
              {/* Sparkles */}
              <div className="absolute -top-2 -right-2 w-2 h-2 bg-amber-300 rounded-full animate-ping"></div>
              <div className="absolute top-8 -left-3 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-16 -right-4 w-1 h-1 bg-amber-500 rounded-full animate-ping delay-700"></div>
            </div>
            
            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-1 h-1 bg-amber-300/60 rounded-full animate-bounce delay-100"></div>
              <div className="absolute top-12 right-6 w-0.5 h-0.5 bg-amber-400/80 rounded-full animate-bounce delay-500"></div>
              <div className="absolute bottom-20 left-6 w-1.5 h-1.5 bg-amber-200/40 rounded-full animate-bounce delay-1000"></div>
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mb-4 animate-pulse">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-4">
            Fragrance Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            The scent you're looking for seems to have evaporated into the digital ether. 
            Let's help you find your way back to our collection of luxury fragrances.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
              <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Return Home
            </Button>
          </Link>
          
          <Link href="/products">
            <Button variant="outline" size="lg" className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 transition-all duration-300 group">
              <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Browse Fragrances
            </Button>
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-8 opacity-30">
          <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse delay-300" />
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse delay-700" />
        </div>

        {/* Bottom Message */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p>Every great fragrance tells a story. Let's find yours.</p>
        </div>
      </div>
    </div>
  )
}
