import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Review from "@/models/Review"

// GET - Get all reviews with pagination and filtering
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const isApproved = searchParams.get("isApproved")
    const productId = searchParams.get("productId") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { comment: { $regex: search, $options: "i" } }]
    }

    if (isApproved !== null) {
      query.isApproved = isApproved === "true"
    }

    if (productId) {
      query.product = productId
    }

    // Build sort
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Execute query
    const reviews = await Review.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("customer", "name email avatar")
      .populate("product", "name")

    const total = await Review.countDocuments(query)

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ message: "Error fetching reviews" }, { status: 500 })
  }
}

// POST - Create a new review (this would typically be called from the customer-facing site)
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const reviewData = await req.json()

    // Create the review
    const review = await Review.create({
      ...reviewData,
      isApproved: false, // New reviews are not approved by default
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ message: "Error creating review" }, { status: 500 })
  }
}
