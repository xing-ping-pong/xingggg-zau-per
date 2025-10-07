"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, User, Menu, X, LogOut, ChevronDown, Instagram, Facebook, Youtube } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/contexts/cart-context"
import { useSettings } from "@/lib/contexts/settings-context"

export function Header() {
  const settings = useSettings()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false)
  const [isMobileContactDropdownOpen, setIsMobileContactDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { cartCount, wishlistCount } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      // Auto-close mobile menu when scrolling
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isMobileMenuOpen])

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isContactDropdownOpen) {
        const target = event.target as HTMLElement
        if (!target.closest('.contact-dropdown')) {
          setIsContactDropdownOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isContactDropdownOpen])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    window.location.href = "/logout"
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-black/95 backdrop-blur-md border-b border-primary/20" : 
          isMobileMenuOpen ? "bg-black border-b border-primary/20" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt={settings.siteName || "ZAU Perfumes"} 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link href="/" className="text-foreground hover:text-primary transition-colors text-sm lg:text-base">
                Home
              </Link>
              <Link href="/#collections" className="text-foreground hover:text-primary transition-colors text-sm lg:text-base">
                Shop
              </Link>
              <Link href="/#featured" className="text-foreground hover:text-primary transition-colors text-sm lg:text-base">
                Featured
              </Link>
              <Link href="/blog" className="text-foreground hover:text-primary transition-colors text-sm lg:text-base">
                Blog
              </Link>
              
              {/* Contact Dropdown */}
              <div className="relative contact-dropdown">
                <button
                  onClick={() => setIsContactDropdownOpen(!isContactDropdownOpen)}
                  className="flex items-center text-foreground hover:text-primary transition-colors text-sm lg:text-base"
                >
                  Contact
                  <ChevronDown className="w-3 h-3 ml-1" />
                </button>
                
                {isContactDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/contact"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsContactDropdownOpen(false)}
                    >
                      Contact Us
                    </Link>
                    <Link
                      href="/faq"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsContactDropdownOpen(false)}
                    >
                      FAQs
                    </Link>
                    <Link
                      href="/track-order"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsContactDropdownOpen(false)}
                    >
                      Track Your Order
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <User className="w-4 h-4 mr-1" />
                        {user.username}
                      </Button>
                    </Link>
                    {user.isAdmin && (
                      <Link href="/admin">
                        <Button variant="outline" size="sm" className="text-xs">
                          Admin
                        </Button>
                      </Link>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs lg:text-sm">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline ml-1">Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-xs lg:text-sm">
                      <User className="w-4 h-4" />
                      <span className="hidden lg:inline ml-1">Login</span>
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" size="sm" className="text-xs">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/wishlist">
                <Button variant="ghost" size="sm" className="relative">
                  <Heart className="w-4 h-4" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                  <span className="ml-1 text-xs text-muted-foreground">{settings.currency}</span>
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Outside header to avoid transparency inheritance */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 h-full w-80 max-w-[80vw] bg-black transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <img 
                src="/logo.png" 
                alt="ZAU Perfumes" 
                className="w-12 h-12 object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col py-6">
              <Link 
                href="/" 
                className="flex items-center justify-between px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="font-medium">HOME</span>
              </Link>
              
              <Link 
                href="/#collections" 
                className="flex items-center justify-between px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="font-medium">SHOP</span>
              </Link>
              
              <Link 
                href="/#featured" 
                className="flex items-center justify-between px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="font-medium">FEATURED</span>
              </Link>
              
              <Link 
                href="/blog" 
                className="flex items-center justify-between px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="font-medium">BLOG</span>
              </Link>
              
              {/* Contact with Dropdown */}
              <div className="border-b border-gray-700">
                <button
                  onClick={() => setIsMobileContactDropdownOpen(!isMobileContactDropdownOpen)}
                  className="flex items-center justify-between w-full px-6 py-4 text-white hover:bg-gray-800 transition-colors"
                >
                  <span className="font-medium">CONTACT</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isMobileContactDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileContactDropdownOpen && (
                  <div className="bg-black/80 backdrop-blur-sm">
                    <Link 
                      href="/contact" 
                      className="block px-6 py-3 text-gray-300 hover:text-white hover:bg-black/60 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact Us
                    </Link>
                    <Link 
                      href="/faq" 
                      className="block px-6 py-3 text-gray-300 hover:text-white hover:bg-black/60 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      FAQs
                    </Link>
                    <Link 
                      href="/track-order" 
                      className="block px-6 py-3 text-gray-300 hover:text-white hover:bg-black/60 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Track Your Order
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Cart and Wishlist Section */}
            <div className="px-6 py-4 border-t border-gray-700">
              <div className="space-y-3">
                <Link 
                  href="/wishlist" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full px-4 py-3 text-white hover:bg-gray-800 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 mr-3" />
                    <span className="font-medium">Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                
                <Link 
                  href="/cart" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full px-4 py-3 text-white hover:bg-gray-800 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-3" />
                    <span className="font-medium">Shopping Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* User Section */}
            <div className="px-6 py-4 border-t border-gray-700">
              {user ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-300">Welcome, {user.username}</div>
                  {user.isAdmin && (
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full border-gray-600 text-white hover:bg-gray-800">
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout} 
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
                      <User className="w-4 h-4 mr-2" />
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full border-gray-600 text-white hover:bg-gray-800">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Social Media */}
            <div className="px-6 py-4 border-t border-gray-700">
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Instagram className="w-5 h-5 text-gray-300" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Facebook className="w-5 h-5 text-gray-300" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Youtube className="w-5 h-5 text-gray-300" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
