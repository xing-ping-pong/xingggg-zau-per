"use client"

import { useState, useRef } from 'react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { optimizedSrc } from '@/lib/utils/image'
import { fetchWithAuth } from '@/lib/auth-utils'

interface ImageUploadProps {
  onImageUpload: (urls: string[]) => void
  existingImages?: string[]
  maxImages?: number
  className?: string
}

export function ImageUpload({ 
  onImageUpload, 
  existingImages = [], 
  maxImages = 5,
  className = ""
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>(existingImages)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`)
        return false
      }
      
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`)
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    if (images.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetchWithAuth('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Upload failed')
        }

        const data = await response.json()
        return data.data.imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newImages = [...images, ...uploadedUrls]
      
      setImages(newImages)
      console.log('🖼️ ImageUpload: Calling onImageUpload with:', newImages)
      onImageUpload(newImages)
      
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`)
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload images'
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImageUpload(newImages)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Upload Product Images</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop images here, or click to select files
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WebP up to 10MB each. Max {maxImages} images.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || images.length >= maxImages}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Select Images'}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Images ({images.length}/{maxImages})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-border relative">
                  <Image src={optimizedSrc(url || '/placeholder.svg', 800)} alt={`Product image ${index + 1}`} fill className="object-cover" />
                </div>
                
                {/* Remove Button */}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>

                {/* Primary Image Badge */}
                {index === 0 && (
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Primary
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
