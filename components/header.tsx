"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, User, Menu, X, LogOut } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/contexts/cart-context"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { cartCount, wishlistCount } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/95 backdrop-blur-md border-b border-primary/20" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 luxury-gradient rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-xs sm:text-sm">R</span>
            </div>
            <span className="font-serif text-xl sm:text-2xl font-bold text-foreground">ROSIA</span>
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
            <Link href="/#contact" className="text-foreground hover:text-primary transition-colors text-sm lg:text-base">
              Contact
            </Link>
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/20 bg-black/95 backdrop-blur-md">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link href="/" className="text-left text-foreground hover:text-primary transition-colors py-2">
                Home
              </Link>
              <Link href="/#collections" className="text-left text-foreground hover:text-primary transition-colors py-2">
                Shop
              </Link>
              <Link href="/#featured" className="text-left text-foreground hover:text-primary transition-colors py-2">
                Featured
              </Link>
              <Link href="/blog" className="text-left text-foreground hover:text-primary transition-colors py-2">
                Blog
              </Link>
              <Link href="/#contact" className="text-left text-foreground hover:text-primary transition-colors py-2">
                Contact
              </Link>
              <div className="flex items-center justify-start space-x-4 pt-4 border-t border-border/20">
                {user ? (
                  <>
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm text-foreground">Welcome, {user.username}</span>
                      {user.isAdmin && (
                        <Link href="/admin">
                          <Button variant="outline" size="sm" className="text-xs">
                            Admin Panel
                          </Button>
                        </Link>
                      )}
                      <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Login
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
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
