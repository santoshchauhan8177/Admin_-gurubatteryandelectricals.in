import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Review from "@/models/Review"
import { authMiddleware } from "@/lib/auth-middleware"

// POST - Add a reply to a review
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const { reply } = await req.json()

    // Find existing review
    const review = await Review.findById(params.id)
    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 })
    }

    // Update review with reply
    const updatedReview = await Review.findByIdAndUpdate(
      params.id,
      {
        reply,
        replyDate: new Date(),
        isReplied: true,
      },
      { new: true },
    )

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error("Error adding reply to review:", error)
    return NextResponse.json({ message: "Error adding reply to review" }, { status: 500 })
  }
}
