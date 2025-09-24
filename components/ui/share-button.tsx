"use client"

import { useState } from 'react'
import { Button } from './button'
import { ShareModal } from './share-modal'
import { Share2, Heart } from 'lucide-react'

interface ShareButtonProps {
  productName: string
  productPrice: number
  productImage?: string
  productUrl?: string
  discount?: number
  variant?: 'default' | 'icon' | 'fancy'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ShareButton({
  productName,
  productPrice,
  productImage,
  productUrl,
  discount = 0,
  variant = 'default',
  size = 'md',
  className = ''
}: ShareButtonProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const currentUrl = productUrl || (typeof window !== 'undefined' ? window.location.href : '')

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  if (variant === 'icon') {
    return (
      <>
        <Button
          onClick={() => setIsShareModalOpen(true)}
          variant="outline"
          size="icon"
          className={`bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 hover:scale-110 ${className}`}
        >
          <Share2 className={iconSizes[size]} />
        </Button>
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          productName={productName}
          productPrice={productPrice}
          productImage={productImage}
          productUrl={currentUrl}
          discount={discount}
        />
      </>
    )
  }

  if (variant === 'fancy') {
    return (
      <>
        <Button
          onClick={() => setIsShareModalOpen(true)}
          className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${sizeClasses[size]} ${className}`}
        >
          <Share2 className={`${iconSizes[size]} mr-2`} />
          Share This Beauty
        </Button>
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          productName={productName}
          productPrice={productPrice}
          productImage={productImage}
          productUrl={currentUrl}
          discount={discount}
        />
      </>
    )
  }

  return (
    <>
      <Button
        onClick={() => setIsShareModalOpen(true)}
        variant="outline"
        className={`bg-slate-800/50 border-purple-500/30 text-white hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-200 ${sizeClasses[size]} ${className}`}
      >
        <Share2 className={`${iconSizes[size]} mr-2`} />
        Share
      </Button>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        productName={productName}
        productPrice={productPrice}
        productImage={productImage}
        productUrl={currentUrl}
        discount={discount}
      />
    </>
  )
}
