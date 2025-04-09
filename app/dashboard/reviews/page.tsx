"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Star, Search, Check, XIcon, ChevronLeft, ChevronRight, Loader2, Filter, X, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface Review {
  _id: string
  product: {
    _id: string
    name: string
  }
  customer: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  rating: number
  title: string
  comment: string
  isApproved: boolean
  createdAt: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [approvalFilter, setApprovalFilter] = useState<string>("all")
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      let url = `/api/reviews?page=${currentPage}&limit=10&search=${searchQuery}`

      if (approvalFilter !== "all") {
        url += `&isApproved=${approvalFilter === "approved"}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch reviews")
      }

      const data = await response.json()
      setReviews(data.reviews)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load reviews",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [currentPage, searchQuery, approvalFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchReviews()
  }

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/reviews/${reviewToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete review")
      }

      toast({
        title: "Review deleted",
        description: "The review has been deleted successfully",
      })

      // Refresh reviews list
      fetchReviews()
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete review",
      })
    } finally {
      setDeleteDialogOpen(false)
      setReviewToDelete(null)
    }
  }

  const handleViewDetails = (review: Review) => {
    setSelectedReview(review)
    setDetailsDialogOpen(true)
  }

  const handleReplyClick = (review: Review) => {
    setSelectedReview(review)
    setReplyText("")
    setReplyDialogOpen(true)
  }

  const handleApprovalToggle = async (reviewId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/reviews/${reviewId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isApproved: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update review approval status")
      }

      toast({
        title: `Review ${!currentStatus ? "approved" : "unapproved"}`,
        description: `The review has been ${!currentStatus ? "approved" : "unapproved"} successfully`,
      })

      // Refresh reviews list
      fetchReviews()
    } catch (error) {
      console.error("Error updating review approval status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update review approval status",
      })
    }
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReview || !replyText.trim()) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/reviews/${selectedReview._id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply: replyText }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit reply")
      }

      toast({
        title: "Reply submitted",
        description: "Your reply has been submitted successfully",
      })

      setReplyDialogOpen(false)
      fetchReviews()
    } catch (error) {
      console.error("Error submitting reply:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit reply",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
      ))
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center">
          <div className="flex-1">
            <CardTitle>Product Reviews</CardTitle>
            <CardDescription>Manage and moderate customer reviews</CardDescription>
          </div>
          <form onSubmit={handleSearch} className="flex w-full items-center sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reviews..."
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
          <Tabs defaultValue="all" className="mb-6" onValueChange={setApprovalFilter}>
            <TabsList className="grid w-full grid-cols-3 md:w-auto">
              <TabsTrigger value="all">All Reviews</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No reviews found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Reviews will appear here when customers submit them"}
              </p>
              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                  <X className="mr-2 h-4 w-4" />
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.customer.avatar} alt={review.customer.name} />
                              <AvatarFallback>{review.customer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{review.customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{review.product.name}</TableCell>
                        <TableCell>
                          <div className="flex">{renderStars(review.rating)}</div>
                        </TableCell>
                        <TableCell>
                          <span className="line-clamp-1">{review.title}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={review.isApproved ? "success" : "secondary"}>
                            {review.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprovalToggle(review._id, review.isApproved)}
                              title={review.isApproved ? "Unapprove" : "Approve"}
                            >
                              {review.isApproved ? <XIcon className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              <span className="sr-only">{review.isApproved ? "Unapprove" : "Approve"}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(review)}
                              title="View Details"
                            >
                              <Search className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleReplyClick(review)} title="Reply">
                              <MessageSquare className="h-4 w-4" />
                              <span className="sr-only">Reply</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(review._id)}
                              title="Delete"
                            >
                              <XIcon className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

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
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
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

      {/* Review Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              {selectedReview && `Submitted on ${new Date(selectedReview.createdAt).toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={selectedReview.customer.avatar} alt={selectedReview.customer.name} />
                    <AvatarFallback>{selectedReview.customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedReview.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedReview.customer.email}</p>
                  </div>
                </div>
                <Badge variant={selectedReview.isApproved ? "success" : "secondary"}>
                  {selectedReview.isApproved ? "Approved" : "Pending"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product</p>
                <p>{selectedReview.product.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rating</p>
                <div className="flex">{renderStars(selectedReview.rating)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="font-medium">{selectedReview.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comment</p>
                <p>{selectedReview.comment}</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant={selectedReview?.isApproved ? "outline" : "default"}
              onClick={() => {
                if (selectedReview) {
                  handleApprovalToggle(selectedReview._id, selectedReview.isApproved)
                  setDetailsDialogOpen(false)
                }
              }}
            >
              {selectedReview?.isApproved ? "Unapprove" : "Approve"}
            </Button>
            <Button
              onClick={() => {
                setDetailsDialogOpen(false)
                if (selectedReview) {
                  handleReplyClick(selectedReview)
                }
              }}
            >
              Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              {selectedReview && `Reply to ${selectedReview.customer.name}'s review`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReplySubmit}>
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="Write your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReplyDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !replyText.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reply"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
