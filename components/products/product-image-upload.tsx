"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { ImagePlus, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface ProductImageUploadProps {
  images: File[]
  setImages: React.Dispatch<React.SetStateAction<File[]>>
  maxImages?: number
  existingImages?: string[]
  onRemoveExistingImage?: (url: string) => void
}

export function ProductImageUpload({
  images,
  setImages,
  maxImages = 5,
  existingImages = [],
  onRemoveExistingImage,
}: ProductImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    // Filter for image files only
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    // Check if adding these files would exceed the max
    if (images.length + imageFiles.length + existingImages.length > maxImages) {
      toast({
        variant: "destructive",
        title: "Too many images",
        description: `You can only upload a maximum of ${maxImages} images`,
      })
      return
    }

    // Add the new images
    setImages((prev) => [...prev, ...imageFiles])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingImage = (url: string) => {
    if (onRemoveExistingImage) {
      onRemoveExistingImage(url)
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Drag & drop images here</h3>
          <p className="text-sm text-muted-foreground">or click to browse (max {maxImages} images)</p>
          <p className="text-xs text-muted-foreground">Supports JPG, PNG and GIF up to 5MB</p>
        </div>
      </div>

      {(images.length > 0 || existingImages.length > 0) && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
          {existingImages.map((url, index) => (
            <div key={`existing-${index}`} className="group relative aspect-square rounded-lg border">
              <Image
                src={url || "/placeholder.svg"}
                alt={`Product image ${index + 1}`}
                fill
                className="rounded-lg object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveExistingImage(url)
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          ))}

          {images.map((file, index) => (
            <div key={index} className="group relative aspect-square rounded-lg border">
              <Image
                src={URL.createObjectURL(file) || "/placeholder.svg"}
                alt={`Product image ${existingImages.length + index + 1}`}
                fill
                className="rounded-lg object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          ))}

          {images.length + existingImages.length < maxImages && (
            <button
              className="flex aspect-square items-center justify-center rounded-lg border border-dashed"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <span className="sr-only">Add image</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
