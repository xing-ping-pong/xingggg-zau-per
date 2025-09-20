"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, User, Menu, X } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-effect border-b border-border/20" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 luxury-gradient rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">R</span>
            </div>
            <span className="font-serif text-2xl font-bold text-foreground">ROSIA</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("collections")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Shop
            </button>
            <button
              onClick={() => scrollToSection("featured")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Featured
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
              Login
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <Heart className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                2
              </span>
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/20">
            <nav className="flex flex-col space-y-4 mt-4">
              <button
                onClick={() => scrollToSection("hero")}
                className="text-left text-foreground hover:text-primary transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("collections")}
                className="text-left text-foreground hover:text-primary transition-colors"
              >
                Shop
              </button>
              <button
                onClick={() => scrollToSection("featured")}
                className="text-left text-foreground hover:text-primary transition-colors"
              >
                Featured
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-left text-foreground hover:text-primary transition-colors"
              >
                Contact
              </button>
              <div className="flex items-center space-x-4 pt-4 border-t border-border/20">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button variant="ghost" size="sm" className="relative">
                  <Heart className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    2
                  </span>
                </Button>
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    1
                  </span>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
