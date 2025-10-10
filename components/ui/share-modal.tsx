"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Badge } from './badge'
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Twitter, 
  Mail,
  ExternalLink,
  Heart,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { optimizedSrc } from '@/lib/utils/image'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  productPrice: number
  productImage?: string
  productUrl: string
  discount?: number
}

export function ShareModal({ 
  isOpen, 
  onClose, 
  productName, 
  productPrice, 
  productImage,
  productUrl,
  discount = 0
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    if (isOpen) {
      setCurrentUrl(window.location.href)
      // Auto-copy link when modal opens
      copyToClipboard()
    }
  }, [isOpen])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!', {
        description: 'Share this amazing product with your friends! ✨'
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
      toast.error('Failed to copy link')
    }
  }

  const formatPrice = (price: number) => {
    return price % 1 === 0 ? price.toString() : price.toFixed(2)
  }

  const discountedPrice = discount > 0 
    ? productPrice - (productPrice * discount / 100)
    : productPrice

  const shareMessages = {
    whatsapp: `🌟 Discover this amazing perfume: ${productName}!\n\n💰 Only PKR ${formatPrice(discountedPrice)}${discount > 0 ? ` (${discount}% OFF!)` : ''}\n\n✨ Shop luxury fragrances at the best prices!\n\n🔗 ${currentUrl}`,
    
    instagram: `✨ Just discovered this stunning perfume: ${productName}! 💎\n\n💰 PKR ${formatPrice(discountedPrice)}${discount > 0 ? ` (${discount}% OFF!)` : ''}\n\n🌸 Perfect for any occasion - elegant, sophisticated, and absolutely divine! ✨\n\n#LuxuryPerfume #Fragrance #Elegance #Beauty #PerfumeLover #Luxury #Style #Fashion #Glamour #Sophisticated`,
    
    facebook: `Check out this beautiful perfume: ${productName}! Only PKR ${formatPrice(discountedPrice)}${discount > 0 ? ` (${discount}% OFF!)` : ''}. Perfect for any occasion! ✨`,
    
    twitter: `✨ Discover ${productName} - PKR ${formatPrice(discountedPrice)}${discount > 0 ? ` (${discount}% OFF!)` : ''} 💎\n\nLuxury fragrances at amazing prices! 🌸\n\n#LuxuryPerfume #Fragrance #Elegance`,
    
    email: `Hi!\n\nI wanted to share this amazing perfume I found: ${productName}!\n\nIt's only PKR ${formatPrice(discountedPrice)}${discount > 0 ? ` (${discount}% OFF!)` : ''} and looks absolutely stunning.\n\nCheck it out: ${currentUrl}\n\nBest regards!`
  }

  const shareToWhatsApp = () => {
    const message = shareMessages.whatsapp
    
    // Use the WhatsApp API URL format that works better
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    let whatsappUrl
    if (isMobile) {
      // For mobile devices, use the direct WhatsApp app URL
      whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`
    } else {
      // For desktop, use the WhatsApp API URL
      whatsappUrl = `https://api.whatsapp.com/send/?text=${encodeURIComponent(message)}&type=custom_url&app_absent=0`
    }
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank')
    
    toast.success('Opening WhatsApp...', {
      description: 'Share the luxury with your friends! 💬'
    })
  }

  const shareToInstagram = () => {
    // Instagram doesn't support direct text sharing, so we'll copy the message
    navigator.clipboard.writeText(shareMessages.instagram)
    toast.success('Instagram message copied!', {
      description: 'Paste it in your Instagram story or post! 📸'
    })
  }

  const shareToFacebook = () => {
    const message = shareMessages.facebook
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(message)}`
    window.open(facebookUrl, '_blank')
    toast.success('Opening Facebook...', {
      description: 'Share the elegance! 📘'
    })
  }

  const shareToTwitter = () => {
    const message = shareMessages.twitter
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
    window.open(twitterUrl, '_blank')
    toast.success('Opening Twitter...', {
      description: 'Tweet about this beauty! 🐦'
    })
  }

  const shareToEmail = () => {
    const subject = `Check out this amazing perfume: ${productName}!`
    const body = shareMessages.email
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(emailUrl, '_blank')
    toast.success('Opening email...', {
      description: 'Share via email! 📧'
    })
  }

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: shareToWhatsApp,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Share with friends'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      action: shareToInstagram,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      description: 'Copy for story/post'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: shareToFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Share on timeline'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: shareToTwitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      description: 'Tweet about it'
    },
    {
      name: 'Email',
      icon: Mail,
      action: shareToEmail,
      color: 'bg-gray-600 hover:bg-gray-700',
      description: 'Send via email'
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-purple-500/20 text-white">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Share This Beauty
            <Sparkles className="w-5 h-5 text-pink-400" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Preview */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {productImage && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-700 relative">
                    <Image src={optimizedSrc(productImage || '/logo.png', 160)} alt={productName} fill className="object-cover" sizes="64px" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-white line-clamp-2">{productName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-purple-400">
                      PKR {formatPrice(discountedPrice)}
                    </span>
                    {discount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs">
                        -{discount}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Copy Link Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <ExternalLink className="w-4 h-4" />
              <span>Link automatically copied!</span>
            </div>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="w-full bg-slate-800/50 border-purple-500/30 text-white hover:bg-purple-500/20 hover:border-purple-400"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link Again
                </>
              )}
            </Button>
          </div>

          {/* Social Media Options */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center text-slate-200 flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              Share on Social Media
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => {
                const Icon = option.icon
                return (
                  <Button
                    key={option.name}
                    onClick={option.action}
                    className={`${option.color} text-white font-medium h-12 flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-105`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{option.name}</span>
                  </Button>
                )
              })}
            </div>
          </div>


          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full bg-transparent border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400"
          >
            Done Sharing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
