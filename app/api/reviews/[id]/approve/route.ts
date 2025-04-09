import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Review from "@/models/Review"
import { authMiddleware } from "@/lib/auth-middleware"

// PATCH - Update review approval status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const { isApproved } = await req.json()

    // Find existing review
    const review = await Review.findById(params.id)
    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 })
    }

    // Update review approval status
    const updatedReview = await Review.findByIdAndUpdate(params.id, { isApproved }, { new: true })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error("Error updating review approval status:", error)
    return NextResponse.json({ message: "Error updating review approval status" }, { status: 500 })
  }
}
