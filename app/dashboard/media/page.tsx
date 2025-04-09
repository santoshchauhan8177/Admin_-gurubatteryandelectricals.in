"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ImageIcon,
  Search,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  X,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

interface MediaItem {
  _id: string
  url: string
  filename: string
  type: string
  size: number
  createdAt: string
  width?: number
  height?: number
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([])
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<string>("grid")
  const [mediaType, setMediaType] = useState<string>("all")
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchMedia = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      let url = `/api/media?page=${currentPage}&limit=20&search=${searchQuery}`

      if (mediaType !== "all") {
        url += `&type=${mediaType}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch media")
      }

      const data = await response.json()
      setMedia(data.media)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Error fetching media:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load media",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [currentPage, searchQuery, mediaType])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchMedia()
  }

  const handleDeleteClick = (mediaId: string) => {
    setMediaToDelete([mediaId])
    setDeleteDialogOpen(true)
  }

  const handleBulkDeleteClick = () => {
    if (selectedMedia.length === 0) return
    setMediaToDelete(selectedMedia)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (mediaToDelete.length === 0) return

    try {
      const token = localStorage.getItem("token")

      // Delete each media item
      for (const id of mediaToDelete) {
        await fetch(`/api/media/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }

      toast({
        title: `${mediaToDelete.length > 1 ? "Media items" : "Media item"} deleted`,
        description: `Successfully deleted ${mediaToDelete.length} ${mediaToDelete.length > 1 ? "items" : "item"}`,
      })

      // Clear selection
      setSelectedMedia([])

      // Refresh media list
      fetchMedia()
    } catch (error) {
      console.error("Error deleting media:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete media",
      })
    } finally {
      setDeleteDialogOpen(false)
      setMediaToDelete([])
    }
  }

  const handleUploadClick = () => {
    setUploadDialogOpen(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(Array.from(e.target.files))
    }
  }

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const token = localStorage.getItem("token")

      // Filter for image files only
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))

      if (imageFiles.length === 0) {
        toast({
          variant: "destructive",
          title: "Invalid files",
          description: "Please upload image files only",
        })
        setIsUploading(false)
        return
      }

      // Create FormData
      const formData = new FormData()
      imageFiles.forEach((file) => {
        formData.append("files", file)
      })

      // Upload files
      const response = await fetch("/api/media/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload files")
      }

      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${imageFiles.length} ${imageFiles.length > 1 ? "files" : "file"}`,
      })

      // Refresh media list
      fetchMedia()
      setUploadDialogOpen(false)
    } catch (error) {
      console.error("Error uploading files:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload files",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMedia((prev) => {
      if (prev.includes(mediaId)) {
        return prev.filter((id) => id !== mediaId)
      } else {
        return [...prev, mediaId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedMedia.length === media.length) {
      setSelectedMedia([])
    } else {
      setSelectedMedia(media.map((item) => item._id))
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
        <div className="flex gap-2">
          {selectedMedia.length > 0 && (
            <Button variant="outline" onClick={handleBulkDeleteClick}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedMedia.length})
            </Button>
          )}
          <Button onClick={handleUploadClick}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center">
          <div className="flex-1">
            <CardTitle>Media Files</CardTitle>
            <CardDescription>Manage your images and other media files</CardDescription>
          </div>
          <form onSubmit={handleSearch} className="flex w-full items-center sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search media..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="ghost" size="icon" className="ml-2">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs defaultValue="all" onValueChange={setMediaType}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="image">Images</TabsTrigger>
                <TabsTrigger value="document">Documents</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs defaultValue="grid" onValueChange={setViewMode}>
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : media.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No media found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Upload your first media file"}
              </p>
              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                  <X className="mr-2 h-4 w-4" />
                  Clear search
                </Button>
              )}
              <Button className="mt-4" onClick={handleUploadClick}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {media.map((item) => (
                    <div
                      key={item._id}
                      className={`group relative aspect-square overflow-hidden rounded-md border ${
                        selectedMedia.includes(item._id) ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="absolute left-2 top-2 z-10">
                        <Checkbox
                          checked={selectedMedia.includes(item._id)}
                          onCheckedChange={() => toggleMediaSelection(item._id)}
                          className="h-5 w-5 rounded-sm bg-background/80 backdrop-blur-sm"
                        />
                      </div>
                      {item.type.startsWith("image/") ? (
                        <Image
                          src={item.url || "/placeholder.svg"}
                          alt={item.filename}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-background/80 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(item.url)}
                        >
                          {copiedUrl === item.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteClick(item._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">
                          <Checkbox
                            checked={selectedMedia.length === media.length && media.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="px-4 py-2 text-left">Preview</th>
                        <th className="px-4 py-2 text-left">Filename</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Size</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {media.map((item) => (
                        <tr key={item._id} className="border-b">
                          <td className="px-4 py-2">
                            <Checkbox
                              checked={selectedMedia.includes(item._id)}
                              onCheckedChange={() => toggleMediaSelection(item._id)}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="relative h-10 w-10 overflow-hidden rounded-md">
                              {item.type.startsWith("image/") ? (
                                <Image
                                  src={item.url || "/placeholder.svg"}
                                  alt={item.filename}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2 font-medium">{item.filename}</td>
                          <td className="px-4 py-2">{item.type.split("/")[1]?.toUpperCase()}</td>
                          <td className="px-4 py-2">{formatFileSize(item.size)}</td>
                          <td className="px-4 py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => copyToClipboard(item.url)}
                              >
                                {copiedUrl === item.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteClick(item._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {mediaToDelete.length > 1 ? "these media items" : "this media item"}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="text-sm">Deleting media may break links in your content if these files are being used.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>Upload images and other media files to your library.</DialogDescription>
          </DialogHeader>
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
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2 text-center">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Drag & drop files here</h3>
              <p className="text-sm text-muted-foreground">or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports JPG, PNG, GIF, and SVG</p>
            </div>
          </div>
          {isUploading && (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
