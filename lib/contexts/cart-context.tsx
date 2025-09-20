"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface CartItem {
  product: string;
  quantity: number;
}

interface WishlistContextType {
  cartItems: string[];
  wishlistItems: string[];
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  toggleWishlist: (productId: string) => Promise<void>;
  isInCart: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  cartCount: number;
  wishlistCount: number;
}

const CartContext = createContext<WishlistContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<string[]>([])
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [userId, setUserId] = useState('guest-user') // In a real app, this would come from auth

  // Update userId when user logs in/out
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserId(user.id || user._id || 'guest-user')
    } else {
      setUserId('guest-user')
    }
  }, [])

  // Load cart and wishlist from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart-items')
    const savedWishlist = localStorage.getItem('wishlist-items')
    
    if (savedCart) {
      const cartData = JSON.parse(savedCart)
      setCartItems(cartData)
    }
    if (savedWishlist) {
      const wishlistData = JSON.parse(savedWishlist)
      setWishlistItems(wishlistData)
    }
  }, [])

  // Sync wishlist with database for logged-in users
  useEffect(() => {
    const syncWishlist = async () => {
      if (userId !== 'guest-user') {
        try {
          // Clear localStorage first to force fresh sync
          localStorage.removeItem('wishlist-items')
          
          const response = await fetch(`/api/wishlist?userId=${userId}`)
          const data = await response.json()
          if (data.success && data.data.wishlist) {
            const dbWishlist = data.data.wishlist.products || []
            setWishlistItems(dbWishlist)
            localStorage.setItem('wishlist-items', JSON.stringify(dbWishlist))
          }
        } catch (error) {
          console.error('Error syncing wishlist:', error)
        }
      }
    }

    if (userId !== 'guest-user') {
      syncWishlist()
    }
  }, [userId])

  // Save to localStorage whenever cart or wishlist changes
  useEffect(() => {
    localStorage.setItem('cart-items', JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    localStorage.setItem('wishlist-items', JSON.stringify(wishlistItems))
  }, [wishlistItems])

  const addToCart = async (productId: string) => {
    try {
      // Add to local state immediately for better UX
      setCartItems(prev => [...prev, productId])
      
      // Only make API call for logged-in users
      if (userId !== 'guest-user') {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            productId,
            quantity: 1
          }),
        })

        if (!response.ok) {
          // Revert local state if API call fails
          setCartItems(prev => prev.filter(id => id !== productId))
          throw new Error('Failed to add to cart')
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      // Remove from local state immediately
      setCartItems(prev => prev.filter(id => id !== productId))
      
      // Only make API call for logged-in users
      if (userId !== 'guest-user') {
        const response = await fetch('/api/cart', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            productId
          }),
        })

        if (!response.ok) {
          // Revert local state if API call fails
          setCartItems(prev => [...prev, productId])
          throw new Error('Failed to remove from cart')
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
    }
  }

  const toggleWishlist = async (productId: string) => {
    try {
      // Check if user is logged in
      if (userId === 'guest-user') {
        // For guest users, just show a message to login
        alert('Please login to add items to wishlist')
        return
      }

      const isInWishlist = wishlistItems.includes(productId)
      
      if (isInWishlist) {
        // Remove from wishlist - update local state first for better UX
        setWishlistItems(prev => prev.filter(id => id !== productId))
        
        const response = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            productId
          }),
        })

        if (!response.ok) {
          // Revert local state if API call fails
          setWishlistItems(prev => [...prev, productId])
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to remove from wishlist')
        }
      } else {
        // Add to wishlist - update local state first for better UX
        setWishlistItems(prev => [...prev, productId])
        
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            productId
          }),
        })

        if (!response.ok) {
          // Revert local state if API call fails
          setWishlistItems(prev => prev.filter(id => id !== productId))
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to add to wishlist')
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    }
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart-items')
  }

  const isInCart = (productId: string) => cartItems.includes(productId)
  const isInWishlist = (productId: string) => wishlistItems.includes(productId)

  const value = {
    cartItems,
    wishlistItems,
    addToCart,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isInCart,
    isInWishlist,
    cartCount: cartItems.length,
    wishlistCount: wishlistItems.length,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
