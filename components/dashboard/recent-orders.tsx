"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EyeIcon } from "lucide-react"
import clsx from "clsx"

const orders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    status: "Processing",
    date: "2023-04-01",
    total: "$129.99",
    productImg: "https://via.placeholder.com/150x100.png?text=Product+1",
  },
  {
    id: "ORD-002",
    customer: "Alice Smith",
    status: "Shipped",
    date: "2023-04-02",
    total: "$79.99",
    productImg: "https://via.placeholder.com/150x100.png?text=Product+2",
  },
  {
    id: "ORD-003",
    customer: "Robert Johnson",
    status: "Delivered",
    date: "2023-04-03",
    total: "$249.99",
    productImg: "https://via.placeholder.com/150x100.png?text=Product+3",
  },
  {
    id: "ORD-004",
    customer: "Emily Brown",
    status: "Processing",
    date: "2023-04-04",
    total: "$189.99",
    productImg: "https://via.placeholder.com/150x100.png?text=Product+4",
  },
  {
    id: "ORD-005",
    customer: "William Davis",
    status: "Cancelled",
    date: "2023-04-05",
    total: "$99.99",
    productImg: "https://via.placeholder.com/150x100.png?text=Product+5",
  },
]

const statusColors = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
}

export function RecentOrders() {
  const [selectedOrder, setSelectedOrder] = useState(null)

  return (
    <div className="rounded-xl border border-muted bg-background p-4 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>

      <div className="overflow-auto rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="hover:bg-muted/20 transition-all rounded-md"
              >
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>
                  <span
                    className={clsx(
                      "px-2 py-1 text-xs font-semibold rounded-full",
                      statusColors[order.status as keyof typeof statusColors]
                    )}
                  >
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell className="text-right">{order.total}</TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-primary/10 transition"
                      >
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-md rounded-xl p-0 overflow-hidden">
                      {selectedOrder && (
                        <div className="w-full">
                          {/* Header Strip */}
                          <div className="bg-primary h-2 w-full" />

                          {/* Content */}
                          <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                              <EyeIcon className="h-5 w-5 text-primary" />
                              <DialogTitle className="text-lg font-semibold text-foreground">
                                Order Summary
                              </DialogTitle>
                            </div>

                            {/* Product Image */}
                            <img
                              src={selectedOrder.productImg}
                              alt="Product"
                              className="w-full h-40 object-cover rounded-lg shadow"
                            />

                            {/* Details */}
                            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              <div>
                                <p className="text-xs font-semibold text-foreground">Order ID</p>
                                <p>{selectedOrder.id}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground">Customer</p>
                                <p>{selectedOrder.customer}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground">Status</p>
                                <span
                                  className={clsx(
                                    "inline-block px-2 py-1 text-xs font-medium rounded-full mt-1",
                                    statusColors[selectedOrder.status as keyof typeof statusColors]
                                  )}
                                >
                                  {selectedOrder.status}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground">Date</p>
                                <p>{selectedOrder.date}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs font-semibold text-foreground">Total Amount</p>
                                <p className="text-lg font-bold text-foreground">{selectedOrder.total}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>

                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
