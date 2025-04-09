import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Coupon from "@/models/Coupon"
import { authMiddleware } from "@/lib/auth-middleware"

// GET - Get all coupons with pagination and filtering
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
      query.code = { $regex: search, $options: "i" }
    }

    const now = new Date()

    if (status === "active") {
      query.isActive = true
      query.startDate = { $lte: now }
      query.endDate = { $gte: now }
    } else if (status === "inactive") {
      query.isActive = false
    } else if (status === "expired") {
      query.endDate = { $lt: now }
    } else if (status === "scheduled") {
      query.isActive = true
      query.startDate = { $gt: now }
    }

    // Build sort
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Execute query
    const coupons = await Coupon.find(query).sort(sort).skip(skip).limit(limit)

    const total = await Coupon.countDocuments(query)

    return NextResponse.json({
      coupons,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ message: "Error fetching coupons" }, { status: 500 })
  }
}

// POST - Create a new coupon
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const couponData = await req.json()

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: couponData.code })
    if (existingCoupon) {
      return NextResponse.json({ message: "Coupon with this code already exists" }, { status: 400 })
    }

    // Validate percentage value
    if (couponData.type === "percentage" && (couponData.value < 0 || couponData.value > 100)) {
      return NextResponse.json({ message: "Percentage discount must be between 0 and 100" }, { status: 400 })
    }

    // Create coupon
    const coupon = await Coupon.create({
      ...couponData,
      usageCount: 0,
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ message: "Error creating coupon" }, { status: 500 })
  }
}
