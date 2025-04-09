"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  X,
  Mail,
  Trash2,
  Reply,
  AlertTriangle,
  Star,
} from "lucide-react"

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Contact {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  status: "new" | "read" | "replied" | "archived"
  isImportant: boolean
  createdAt: string
  reply?: string
  replyDate?: string
}

export default function ContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<string | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchContacts = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      let url = `/api/contacts?page=${currentPage}&limit=10&search=${searchQuery}`

      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch contacts")
      }

      const data = await response.json()
      setContacts(data.contacts)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load contacts",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [currentPage, searchQuery, statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchContacts()
  }

  const handleDeleteClick = (contactId: string) => {
    setContactToDelete(contactId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/contacts/${contactToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete contact")
      }

      toast({
        title: "Contact deleted",
        description: "The contact message has been deleted successfully",
      })

      // Refresh contacts list
      fetchContacts()
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete contact",
      })
    } finally {
      setDeleteDialogOpen(false)
      setContactToDelete(null)
    }
  }

  const handleViewDetails = async (contact: Contact) => {
    setSelectedContact(contact)
    setDetailsDialogOpen(true)

    // If the contact is new, mark it as read
    if (contact.status === "new") {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/contacts/${contact._id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "read" }),
        })

        if (response.ok) {
          // Update the contact status locally
          setContacts((prev) => prev.map((c) => (c._id === contact._id ? { ...c, status: "read" } : c)))
        }
      } catch (error) {
        console.error("Error updating contact status:", error)
      }
    }
  }

  const handleReplyClick = (contact: Contact) => {
    setSelectedContact(contact)
    setReplyText(contact.reply || "")
    setReplyDialogOpen(true)
  }

  const handleToggleImportant = async (contactId: string, isImportant: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/contacts/${contactId}/important`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isImportant: !isImportant }),
      })

      if (!response.ok) {
        throw new Error("Failed to update contact importance")
      }

      // Update the contact importance locally
      setContacts((prev) => prev.map((c) => (c._id === contactId ? { ...c, isImportant: !isImportant } : c)))
    } catch (error) {
      console.error("Error updating contact importance:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update contact importance",
      })
    }
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContact || !replyText.trim()) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/contacts/${selectedContact._id}/reply`, {
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
        title: "Reply sent",
        description: "Your reply has been sent successfully",
      })

      setReplyDialogOpen(false)
      fetchContacts()
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="default">New</Badge>
      case "read":
        return <Badge variant="secondary">Read</Badge>
      case "replied":
        return <Badge variant="success">Replied</Badge>
      case "archived":
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center">
          <div className="flex-1">
            <CardTitle>Customer Inquiries</CardTitle>
            <CardDescription>Manage and respond to customer messages</CardDescription>
          </div>
          <form onSubmit={handleSearch} className="flex w-full items-center sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search messages..."
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
          <Tabs defaultValue="all" className="mb-6" onValueChange={setStatusFilter}>
            <TabsList className="grid w-full grid-cols-4 md:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="replied">Replied</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No messages found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Messages will appear here when customers contact you"}
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
                      <TableHead className="w-[30px]"></TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact._id} className={contact.status === "new" ? "font-medium" : ""}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleImportant(contact._id, contact.isImportant)}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                contact.isImportant ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                              }`}
                            />
                            <span className="sr-only">
                              {contact.isImportant ? "Remove importance" : "Mark as important"}
                            </span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-sm text-muted-foreground">{contact.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="line-clamp-1">{contact.subject}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(contact.status)}</TableCell>
                        <TableCell>{new Date(contact.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEmailClick(contact.email)}
                            >
                              <Mail className="h-4 w-4" />
                              <span className="sr-only">Email</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewDetails(contact)}
                            >
                              <Search className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleReplyClick(contact)}
                            >
                              <Reply className="h-4 w-4" />
                              <span className="sr-only">Reply</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteClick(contact._id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="text-sm">Deleting this message will permanently remove it from your inbox.</p>
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

      {/* Message Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedContact?.subject}</DialogTitle>
            <DialogDescription>
              From {selectedContact?.name} ({selectedContact?.email}) on{" "}
              {selectedContact && new Date(selectedContact.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="whitespace-pre-wrap">{selectedContact?.message}</p>
            </div>

            {selectedContact?.reply && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Your Reply:</h4>
                <div className="rounded-lg border bg-muted p-4">
                  <p className="whitespace-pre-wrap">{selectedContact?.reply}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Sent on {selectedContact?.replyDate && new Date(selectedContact.replyDate).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setDetailsDialogOpen(false)
                handleReplyClick(selectedContact!)
              }}
            >
              Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reply to {selectedContact?.name}</DialogTitle>
            <DialogDescription>Responding to: {selectedContact?.subject}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReplySubmit}>
            <div className="grid gap-4 py-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="line-clamp-3 text-sm text-muted-foreground">{selectedContact?.message}</p>
              </div>
              <Textarea
                placeholder="Write your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={8}
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
