"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Badge } from './badge'
import { Dialog, DialogContent, DialogTrigger } from './dialog'
import { 
  ZoomIn, 
  ZoomOut, 
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react'
import Image from 'next/image'

interface ProductImageGalleryProps {
  images: string[]
  productName: string
  discount?: number
  className?: string
}

export function ProductImageGallery({ 
  images, 
  productName, 
  discount = 0,
  className = ""
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  
  const imageRef = useRef<HTMLDivElement>(null)
  const modalImageRef = useRef<HTMLDivElement>(null)

  // Filter out empty images
  const validImages = images.filter(Boolean)
  
  if (validImages.length === 0) {
    return (
      <div className={`aspect-square rounded-lg bg-muted flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5))
  }

  const resetImage = () => {
    setZoom(1)
    setImagePosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  const openModal = (index: number) => {
    setModalImageIndex(index)
    setIsModalOpen(true)
  }

  const nextImage = () => {
    setSelectedImage(prev => (prev + 1) % validImages.length)
  }

  const prevImage = () => {
    setSelectedImage(prev => (prev - 1 + validImages.length) % validImages.length)
  }

  const nextModalImage = () => {
    setModalImageIndex(prev => (prev + 1) % validImages.length)
  }

  const prevModalImage = () => {
    setModalImageIndex(prev => (prev - 1 + validImages.length) % validImages.length)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) {
        switch (e.key) {
          case 'ArrowLeft':
            prevModalImage()
            break
          case 'ArrowRight':
            nextModalImage()
            break
          case 'Escape':
            setIsModalOpen(false)
            break
        }
      } else {
        switch (e.key) {
          case 'ArrowLeft':
            prevImage()
            break
          case 'ArrowRight':
            nextImage()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className="relative group">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div 
              ref={imageRef}
              className="relative aspect-square overflow-hidden cursor-zoom-in"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onClick={() => openModal(selectedImage)}
            >
              <Image
                src={validImages[selectedImage]}
                alt={`${productName} - Image ${selectedImage + 1}`}
                fill
                className="object-cover transition-transform duration-300"
                style={{
                  transform: `scale(${zoom}) translate(${imagePosition.x / zoom}px, ${imagePosition.y / zoom}px)`,
                  cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              
              {/* Discount Badge */}
              {discount > 0 && (
                <Badge className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-primary text-primary-foreground text-xs sm:text-sm">
                  -{discount}%
                </Badge>
              )}

              {/* Zoom Indicator */}
              {zoom > 1 && (
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 text-white px-1 sm:px-2 py-1 rounded text-xs sm:text-sm">
                  {Math.round(zoom * 100)}%
                </div>
              )}

              {/* Navigation Arrows */}
              {validImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      prevImage()
                    }}
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      nextImage()
                    }}
                  >
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </>
              )}

              {/* Fullscreen Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  openModal(selectedImage)
                }}
              >
                <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Controls */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mt-2 sm:mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetImage}
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>

      {/* Thumbnail Images */}
      {validImages.length > 1 && (
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative flex-shrink-0 aspect-square w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 64px, 80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-7xl w-full h-full max-h-[90vh] p-0 sm:max-w-[95vw] sm:max-h-[95vh]">
          <div className="relative w-full h-full flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-2 sm:p-4 border-b">
              <h3 className="text-sm sm:text-lg font-semibold truncate">
                {productName} - Image {modalImageIndex + 1} of {validImages.length}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Image */}
            <div className="flex-1 relative overflow-hidden">
              <div 
                ref={modalImageRef}
                className="w-full h-full flex items-center justify-center p-2 sm:p-4"
              >
                <Image
                  src={validImages[modalImageIndex]}
                  alt={`${productName} - Full view ${modalImageIndex + 1}`}
                  width={800}
                  height={800}
                  className="max-w-full max-h-full object-contain"
                  priority
                />
              </div>

              {/* Modal Navigation */}
              {validImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={prevModalImage}
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={nextModalImage}
                  >
                    <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Modal Thumbnails */}
            {validImages.length > 1 && (
              <div className="flex gap-1 sm:gap-2 p-2 sm:p-4 border-t overflow-x-auto scrollbar-hide">
                {validImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setModalImageIndex(index)}
                    className={`relative flex-shrink-0 aspect-square w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      modalImageIndex === index 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${productName} modal thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 48px, 64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
