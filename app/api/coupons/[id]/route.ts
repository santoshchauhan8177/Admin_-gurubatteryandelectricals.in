import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Coupon from "@/models/Coupon"
import { authMiddleware } from "@/lib/auth-middleware"

// GET - Get a single coupon by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const coupon = await Coupon.findById(params.id)

    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return NextResponse.json({ message: "Error fetching coupon" }, { status: 500 })
  }
}

// PUT - Update a coupon
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const couponData = await req.json()

    // Check if code already exists (excluding this coupon)
    if (couponData.code) {
      const existingCoupon = await Coupon.findOne({ code: couponData.code, _id: { $ne: params.id } })
      if (existingCoupon) {
        return NextResponse.json({ message: "Coupon with this code already exists" }, { status: 400 })
      }
    }

    // Validate percentage value
    if (couponData.type === "percentage" && (couponData.value < 0 || couponData.value > 100)) {
      return NextResponse.json({ message: "Percentage discount must be between 0 and 100" }, { status: 400 })
    }

    // Find existing coupon
    const coupon = await Coupon.findById(params.id)
    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 })
    }

    // Update coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(params.id, couponData, { new: true })

    return NextResponse.json(updatedCoupon)
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ message: "Error updating coupon" }, { status: 500 })
  }
}

// DELETE - Delete a coupon
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    // Check if coupon exists
    const coupon = await Coupon.findById(params.id)
    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 })
    }

    // Delete the coupon
    await Coupon.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Coupon deleted successfully" })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ message: "Error deleting coupon" }, { status: 500 })
  }
}
