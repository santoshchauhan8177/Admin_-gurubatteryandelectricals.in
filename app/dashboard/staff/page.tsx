"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  UserCog,
  Search,
  UserPlus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  X,
  AlertTriangle,
  Mail,
  CheckSquare,
  Square,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

interface User {
  _id: string
  name: string
  email: string
  role: "admin" | "staff"
  isActive: boolean
  createdAt: string
  lastLogin?: string
  avatar?: string
  permissions?: string[]
}

export default function StaffPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
    isActive: true,
    permissions: {
      products: false,
      orders: false,
      customers: false,
      analytics: false,
      settings: false,
    },
  })
  const router = useRouter()
  const { toast } = useToast()

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users?page=${currentPage}&limit=10&search=${searchQuery}&role=staff,admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch staff members")
      }

      const data = await response.json()
      setUsers(data.users)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Error fetching staff members:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load staff members",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users/${userToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete staff member")
      }

      toast({
        title: "Staff member deleted",
        description: "The staff member has been deleted successfully",
      })

      // Refresh users list
      fetchUsers()
    } catch (error) {
      console.error("Error deleting staff member:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete staff member",
      })
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleAddClick = () => {
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "staff",
      isActive: true,
      permissions: {
        products: false,
        orders: false,
        customers: false,
        analytics: false,
        settings: false,
      },
    })
    setFormDialogOpen(true)
  }

  const handleEditClick = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
      permissions: {
        products: user.permissions?.includes("products") || false,
        orders: user.permissions?.includes("orders") || false,
        customers: user.permissions?.includes("customers") || false,
        analytics: user.permissions?.includes("analytics") || false,
        settings: user.permissions?.includes("settings") || false,
      },
    })
    setFormDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked,
      },
    }))
  }

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({ ...prev, role: role as "admin" | "staff" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")

      // Convert permissions object to array
      const permissionsArray = Object.entries(formData.permissions)
        .filter(([_, value]) => value)
        .map(([key]) => key)

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
        role: formData.role,
        isActive: formData.isActive,
        permissions: permissionsArray,
      }

      const url = editingUser ? `/api/users/${editingUser._id}` : "/api/users"
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${editingUser ? "update" : "create"} staff member`)
      }

      toast({
        title: `Staff member ${editingUser ? "updated" : "created"}`,
        description: `The staff member has been ${editingUser ? "updated" : "created"} successfully`,
      })

      setFormDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error(`Error ${editingUser ? "updating" : "creating"} staff member:`, error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editingUser ? "update" : "create"} staff member`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContactUser = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
        <Button onClick={handleAddClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center">
          <div className="flex-1">
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>Manage your store administrators and staff</CardDescription>
          </div>
          <form onSubmit={handleSearch} className="flex w-full items-center sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search staff..."
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
          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
              <UserCog className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No staff members found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Get started by adding your first staff member"}
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
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role === "admin" ? "Administrator" : "Staff"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "success" : "destructive"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleContactUser(user.email)}
                              title="Contact"
                            >
                              <Mail className="h-4 w-4" />
                              <span className="sr-only">Contact</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)} title="Edit">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(user._id)}
                              title="Delete"
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
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this staff member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="text-sm">Deleting this staff member will revoke their access to the admin dashboard.</p>
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

      {/* Add/Edit Staff Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update the staff member details below."
                : "Fill in the details below to create a new staff member."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{editingUser ? "Password (leave blank to keep current)" : "Password"}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="roleStaff"
                      name="role"
                      value="staff"
                      checked={formData.role === "staff"}
                      onChange={() => handleRoleChange("staff")}
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor="roleStaff" className="font-normal">
                      Staff
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="roleAdmin"
                      name="role"
                      value="admin"
                      checked={formData.role === "admin"}
                      onChange={() => handleRoleChange("admin")}
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor="roleAdmin" className="font-normal">
                      Administrator
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-5 w-5 items-center justify-center"
                      onClick={() => handlePermissionChange("products", !formData.permissions.products)}
                    >
                      {formData.permissions.products ? (
                        <CheckSquare className="h-5 w-5 cursor-pointer text-primary" />
                      ) : (
                        <Square className="h-5 w-5 cursor-pointer text-muted-foreground" />
                      )}
                    </div>
                    <Label
                      htmlFor="permProducts"
                      className="cursor-pointer font-normal"
                      onClick={() => handlePermissionChange("products", !formData.permissions.products)}
                    >
                      Manage Products
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-5 w-5 items-center justify-center"
                      onClick={() => handlePermissionChange("orders", !formData.permissions.orders)}
                    >
                      {formData.permissions.orders ? (
                        <CheckSquare className="h-5 w-5 cursor-pointer text-primary" />
                      ) : (
                        <Square className="h-5 w-5 cursor-pointer text-muted-foreground" />
                      )}
                    </div>
                    <Label
                      htmlFor="permOrders"
                      className="cursor-pointer font-normal"
                      onClick={() => handlePermissionChange("orders", !formData.permissions.orders)}
                    >
                      Manage Orders
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-5 w-5 items-center justify-center"
                      onClick={() => handlePermissionChange("customers", !formData.permissions.customers)}
                    >
                      {formData.permissions.customers ? (
                        <CheckSquare className="h-5 w-5 cursor-pointer text-primary" />
                      ) : (
                        <Square className="h-5 w-5 cursor-pointer text-muted-foreground" />
                      )}
                    </div>
                    <Label
                      htmlFor="permCustomers"
                      className="cursor-pointer font-normal"
                      onClick={() => handlePermissionChange("customers", !formData.permissions.customers)}
                    >
                      Manage Customers
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-5 w-5 items-center justify-center"
                      onClick={() => handlePermissionChange("analytics", !formData.permissions.analytics)}
                    >
                      {formData.permissions.analytics ? (
                        <CheckSquare className="h-5 w-5 cursor-pointer text-primary" />
                      ) : (
                        <Square className="h-5 w-5 cursor-pointer text-muted-foreground" />
                      )}
                    </div>
                    <Label
                      htmlFor="permAnalytics"
                      className="cursor-pointer font-normal"
                      onClick={() => handlePermissionChange("analytics", !formData.permissions.analytics)}
                    >
                      View Analytics
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-5 w-5 items-center justify-center"
                      onClick={() => handlePermissionChange("settings", !formData.permissions.settings)}
                    >
                      {formData.permissions.settings ? (
                        <CheckSquare className="h-5 w-5 cursor-pointer text-primary" />
                      ) : (
                        <Square className="h-5 w-5 cursor-pointer text-muted-foreground" />
                      )}
                    </div>
                    <Label
                      htmlFor="permSettings"
                      className="cursor-pointer font-normal"
                      onClick={() => handlePermissionChange("settings", !formData.permissions.settings)}
                    >
                      Manage Settings
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                />
                <Label htmlFor="isActive">Active Account</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingUser ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{editingUser ? "Update" : "Create"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
