"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface CartItem {
  productId: string;
  quantity: number;
}

interface WishlistContextType {
  cartItems: CartItem[];
  wishlistItems: string[];
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  toggleWishlist: (productId: string) => Promise<void>;
  isInCart: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  getCartQuantity: (productId: string) => number;
  cartCount: number;
  wishlistCount: number;
}

const CartContext = createContext<WishlistContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [userId, setUserId] = useState('guest-user') // In a real app, this would come from auth
  const [isGuest, setIsGuest] = useState(true)

  // Update userId when user logs in/out
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserId(user.id || user._id || 'guest-user')
      setIsGuest(false)
    } else {
      setUserId('guest-user')
      setIsGuest(true)
    }
  }, [])

  // Load cart and wishlist from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart-items')
    const savedWishlist = localStorage.getItem('wishlist-items')
    
    if (savedCart) {
      try {
      const cartData = JSON.parse(savedCart)
        // Handle migration from old format (string[]) to new format (CartItem[])
        if (Array.isArray(cartData) && cartData.length > 0) {
          if (typeof cartData[0] === 'string') {
            // Old format: convert to new format
            const newCartData: CartItem[] = cartData.map((productId: string) => ({
              productId,
              quantity: 1
            }))
            setCartItems(newCartData)
          } else {
            // New format: use as is
      setCartItems(cartData)
          }
        }
      } catch (error) {
        console.error('Error parsing cart data:', error)
        setCartItems([])
      }
    }
    if (savedWishlist) {
      const wishlistData = JSON.parse(savedWishlist)
      setWishlistItems(wishlistData)
    }
  }, [])

  // Sync cart and wishlist with database for both registered and guest users
  useEffect(() => {
    const syncData = async () => {
      try {
        // Sync cart
        const cartResponse = await fetch(`/api/cart?userId=${isGuest ? 'guest' : userId}&isGuest=${isGuest}`)
        const cartData = await cartResponse.json()
        if (cartData.success && cartData.data.cart) {
          const dbCart = cartData.data.cart.items || []
          const cartItems = dbCart.map((item: any) => ({
            productId: item.product._id || item.product,
            quantity: item.quantity
          }))
          setCartItems(cartItems)
          localStorage.setItem('cart-items', JSON.stringify(cartItems))
        }

        // Sync wishlist
        const wishlistResponse = await fetch(`/api/wishlist?userId=${isGuest ? 'guest' : userId}&isGuest=${isGuest}`)
        const wishlistData = await wishlistResponse.json()
        if (wishlistData.success && wishlistData.data.wishlist) {
          const dbWishlist = wishlistData.data.wishlist.products || []
          setWishlistItems(dbWishlist)
          localStorage.setItem('wishlist-items', JSON.stringify(dbWishlist))
        }
      } catch (error) {
        console.error('Error syncing data:', error)
      }
    }

    syncData()
  }, [userId, isGuest])

  // Save to localStorage whenever cart or wishlist changes
  useEffect(() => {
    localStorage.setItem('cart-items', JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    localStorage.setItem('wishlist-items', JSON.stringify(wishlistItems))
  }, [wishlistItems])

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      // First, check product stock availability
      const productResponse = await fetch(`/api/products/${productId}`)
      const productData = await productResponse.json()
      
      if (!productData.success) {
        throw new Error('Product not found')
      }

      const product = productData.data
      const currentQuantity = cartItems.find(item => item.productId === productId)?.quantity || 0
      const newTotalQuantity = currentQuantity + quantity

      if (newTotalQuantity > product.stockQuantity) {
        throw new Error(`Only ${product.stockQuantity} items available in stock`)
      }

      // Update local state immediately for better UX
      setCartItems(prev => {
        const existingItem = prev.find(item => item.productId === productId)
        if (existingItem) {
          // Increment quantity if product already exists
          return prev.map(item => 
            item.productId === productId 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        } else {
          // Add new item if product doesn't exist
          return [...prev, { productId, quantity }]
        }
      })
      
      // Make API call for both registered and guest users
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
          userId: isGuest ? 'guest' : userId,
            productId,
          quantity,
          isGuest
          }),
        })

        if (!response.ok) {
          // Revert local state if API call fails
        setCartItems(prev => {
          const existingItem = prev.find(item => item.productId === productId)
          if (existingItem && existingItem.quantity > quantity) {
            // Decrement quantity
            return prev.map(item => 
              item.productId === productId 
                ? { ...item, quantity: item.quantity - quantity }
                : item
            )
          } else {
            // Remove item completely
            return prev.filter(item => item.productId !== productId)
          }
        })
          throw new Error('Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      // Show user-friendly error message
      if (error instanceof Error) {
        alert(error.message)
      }
    }
  }

  const removeFromCart = async (productId: string, quantity: number = 1) => {
    try {
      console.log('removeFromCart called:', { productId, quantity, currentCartItems: cartItems });
      
      // Get current quantity before updating
      const currentItem = cartItems.find(item => item.productId === productId)
      const currentQuantity = currentItem?.quantity || 0
      
      // Calculate new quantity
      const newQuantity = Math.max(0, currentQuantity - quantity)
      
      console.log('Removal calculation:', { currentQuantity, quantity, newQuantity });
      
      // Update local state immediately
      setCartItems(prev => {
        const existingItem = prev.find(item => item.productId === productId)
        if (existingItem) {
          if (existingItem.quantity <= quantity) {
            // Remove item completely if quantity to remove >= current quantity
            const newItems = prev.filter(item => item.productId !== productId)
            console.log('Item completely removed, new cart:', newItems);
            return newItems
          } else {
            // Decrement quantity
            const newItems = prev.map(item => 
              item.productId === productId 
                ? { ...item, quantity: item.quantity - quantity }
                : item
            )
            console.log('Item quantity decremented, new cart:', newItems);
            return newItems
          }
        }
        console.log('Item not found in cart');
        return prev
      })
      
      // Make API call for both registered and guest users
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: isGuest ? 'guest' : userId,
          productId,
          quantity: newQuantity,
          isGuest
        }),
      })

      if (!response.ok) {
        // Revert local state if API call fails
        setCartItems(prev => {
          const existingItem = prev.find(item => item.productId === productId)
          if (existingItem) {
            return prev.map(item => 
              item.productId === productId 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          } else {
            return [...prev, { productId, quantity }]
          }
        })
        throw new Error('Failed to remove from cart')
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
    }
  }

  const updateCartQuantity = async (productId: string, quantity: number) => {
    try {
      // Update local state immediately
      setCartItems(prev => {
        if (quantity <= 0) {
          return prev.filter(item => item.productId !== productId)
        }
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity }
            : item
        )
      })
      
      // Make API call for both registered and guest users
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: isGuest ? 'guest' : userId,
          productId,
          quantity,
          isGuest
        }),
      })

      if (!response.ok) {
        // Revert local state if API call fails
        const originalQuantity = cartItems.find(item => item.productId === productId)?.quantity || 0
        setCartItems(prev => 
          prev.map(item => 
            item.productId === productId 
              ? { ...item, quantity: originalQuantity }
              : item
          )
        )
        throw new Error('Failed to update cart quantity')
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error)
    }
  }

  const toggleWishlist = async (productId: string) => {
    try {
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
            userId: isGuest ? 'guest' : userId,
            productId,
            isGuest
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
            userId: isGuest ? 'guest' : userId,
            productId,
            isGuest
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

  const isInCart = (productId: string) => cartItems.some(item => item.productId === productId)
  const isInWishlist = (productId: string) => wishlistItems.includes(productId)
  const getCartQuantity = (productId: string) => {
    const item = cartItems.find(item => item.productId === productId)
    return item ? item.quantity : 0
  }

  const value = {
    cartItems,
    wishlistItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleWishlist,
    isInCart,
    isInWishlist,
    getCartQuantity,
    cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
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
