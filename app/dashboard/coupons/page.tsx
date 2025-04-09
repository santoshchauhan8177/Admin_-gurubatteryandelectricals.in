"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  TicketPercent,
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  X,
  AlertTriangle,
  Calendar,
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

interface Coupon {
  _id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  minPurchase?: number
  maxDiscount?: number
  startDate: string
  endDate: string
  isActive: boolean
  usageLimit?: number
  usageCount: number
  applicableProducts?: string[]
  applicableCategories?: string[]
  createdAt: string
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    isActive: true,
    usageLimit: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  const fetchCoupons = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      let url = `/api/coupons?page=${currentPage}&limit=10&search=${searchQuery}`

      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch coupons")
      }

      const data = await response.json()
      setCoupons(data.coupons)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Error fetching coupons:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load coupons",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [currentPage, searchQuery, statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCoupons()
  }

  const handleDeleteClick = (couponId: string) => {
    setCouponToDelete(couponId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/coupons/${couponToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete coupon")
      }

      toast({
        title: "Coupon deleted",
        description: "The coupon has been deleted successfully",
      })

      // Refresh coupons list
      fetchCoupons()
    } catch (error) {
      console.error("Error deleting coupon:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete coupon",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCouponToDelete(null)
    }
  }

  const handleAddClick = () => {
    setEditingCoupon(null)
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      minPurchase: "",
      maxDiscount: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: true,
      usageLimit: "",
    })
    setFormDialogOpen(true)
  }

  const handleEditClick = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minPurchase: coupon.minPurchase?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      startDate: new Date(coupon.startDate),
      endDate: new Date(coupon.endDate),
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit?.toString() || "",
    })
    setFormDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as "percentage" | "fixed" }))
  }

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, startDate: date }))
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, endDate: date }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")

      // Prepare data for API
      const couponData = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: Number.parseFloat(formData.value),
        minPurchase: formData.minPurchase ? Number.parseFloat(formData.minPurchase) : undefined,
        maxDiscount: formData.maxDiscount ? Number.parseFloat(formData.maxDiscount) : undefined,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        isActive: formData.isActive,
        usageLimit: formData.usageLimit ? Number.parseInt(formData.usageLimit) : undefined,
      }

      const url = editingCoupon ? `/api/coupons/${editingCoupon._id}` : "/api/coupons"
      const method = editingCoupon ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(couponData),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${editingCoupon ? "update" : "create"} coupon`)
      }

      toast({
        title: `Coupon ${editingCoupon ? "updated" : "created"}`,
        description: `The coupon has been ${editingCoupon ? "updated" : "created"} successfully`,
      })

      setFormDialogOpen(false)
      fetchCoupons()
    } catch (error) {
      console.error(`Error ${editingCoupon ? "updating" : "creating"} coupon:`, error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editingCoupon ? "update" : "create"} coupon`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isCouponActive = (coupon: Coupon) => {
    const now = new Date()
    const startDate = new Date(coupon.startDate)
    const endDate = new Date(coupon.endDate)
    return coupon.isActive && now >= startDate && now <= endDate
  }

  const isCouponExpired = (coupon: Coupon) => {
    const now = new Date()
    const endDate = new Date(coupon.endDate)
    return now > endDate
  }

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return "inactive"
    if (isCouponExpired(coupon)) return "expired"
    const now = new Date()
    const startDate = new Date(coupon.startDate)
    if (now < startDate) return "scheduled"
    return "active"
  }

  const getCouponStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center">
          <div className="flex-1">
            <CardTitle>All Coupons</CardTitle>
            <CardDescription>Manage discount coupons for your store</CardDescription>
          </div>
          <form onSubmit={handleSearch} className="flex w-full items-center sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search coupons..."
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
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
              <TicketPercent className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No coupons found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Get started by adding your first coupon"}
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
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon._id}>
                        <TableCell className="font-medium">{coupon.code}</TableCell>
                        <TableCell>
                          {coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                          {coupon.minPurchase && (
                            <div className="text-xs text-muted-foreground">
                              Min. purchase: ${coupon.minPurchase.toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(coupon.startDate).toLocaleDateString()} -{" "}
                            {new Date(coupon.endDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{getCouponStatusBadge(getCouponStatus(coupon))}</TableCell>
                        <TableCell>
                          {coupon.usageCount} / {coupon.usageLimit || "∞"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(coupon)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(coupon._id)}>
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
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coupon? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="text-sm">Deleting this coupon will prevent customers from using it in future orders.</p>
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

      {/* Add/Edit Coupon Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
            <DialogDescription>
              {editingCoupon ? "Update the coupon details below." : "Fill in the details below to create a new coupon."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="SUMMER2023"
                  className="uppercase"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Customers will enter this code at checkout to apply the discount.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select value={formData.type} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">
                    {formData.type === "percentage" ? "Discount Percentage" : "Discount Amount"}
                  </Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      {formData.type === "percentage" ? "%" : "$"}
                    </span>
                    <Input
                      id="value"
                      name="value"
                      type="number"
                      step={formData.type === "percentage" ? "1" : "0.01"}
                      min="0"
                      max={formData.type === "percentage" ? "100" : undefined}
                      value={formData.value}
                      onChange={handleInputChange}
                      className="pl-7"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="minPurchase">Minimum Purchase (Optional)</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                    <Input
                      id="minPurchase"
                      name="minPurchase"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minPurchase}
                      onChange={handleInputChange}
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxDiscount">Maximum Discount (Optional)</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                    <Input
                      id="maxDiscount"
                      name="maxDiscount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.maxDiscount}
                      onChange={handleInputChange}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.startDate}
                        onSelect={handleStartDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.endDate}
                        onSelect={handleEndDateChange}
                        initialFocus
                        disabled={(date) => date < formData.startDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                <Input
                  id="usageLimit"
                  name="usageLimit"
                  type="number"
                  min="0"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  placeholder="Leave empty for unlimited usage"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of times this coupon can be used. Leave empty for unlimited usage.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="isActive">Active</Label>
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
                    {editingCoupon ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{editingCoupon ? "Update" : "Create"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
