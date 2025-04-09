import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Order from "@/models/Order"

// GET - Get all orders with pagination and filtering
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
      ]
    }

    if (status) {
      query.status = status
    }

    // Build sort
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Execute query
    const orders = await Order.find(query).sort(sort).skip(skip).limit(limit).populate("customer", "name email")

    const total = await Order.countDocuments(query)

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ message: "Error fetching orders" }, { status: 500 })
  }
}

// POST - Create a new order (this would typically be called from the customer-facing site)
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const orderData = await req.json()

    // Generate a unique order number
    const orderCount = await Order.countDocuments()
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, "0")}`

    // Create the order
    const order = await Order.create({
      ...orderData,
      orderNumber,
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ message: "Error creating order" }, { status: 500 })
  }
}
