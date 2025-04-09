import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import { authMiddleware } from "@/lib/auth-middleware"

// PATCH - Update order status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const { status } = await req.json()

    // Validate status
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    // Find existing order
    const order = await Order.findById(params.id)
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(params.id, { status }, { new: true })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ message: "Error updating order status" }, { status: 500 })
  }
}
