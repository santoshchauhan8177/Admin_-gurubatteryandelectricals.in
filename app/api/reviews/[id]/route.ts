import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Review from "@/models/Review"
import { authMiddleware } from "@/lib/auth-middleware"

// GET - Get a single review by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const review = await Review.findById(params.id)
      .populate("customer", "name email avatar")
      .populate("product", "name")

    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error fetching review:", error)
    return NextResponse.json({ message: "Error fetching review" }, { status: 500 })
  }
}

// DELETE - Delete a review
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    // Check if review exists
    const review = await Review.findById(params.id)
    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 })
    }

    // Delete the review
    await Review.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ message: "Error deleting review" }, { status: 500 })
  }
}
