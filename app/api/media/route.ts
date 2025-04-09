import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Media from "@/models/Media"

// GET - Get all media with pagination and filtering
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.filename = { $regex: search, $options: "i" }
    }

    if (type === "image") {
      query.type = { $regex: "^image/", $options: "i" }
    } else if (type === "document") {
      query.type = { $in: [/^application\/pdf/, /^application\/msword/, /^application\/vnd.openxmlformats/] }
    } else if (type === "other") {
      query.type = { $not: { $regex: "^image/", $options: "i" } }
    }

    // Build sort
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Execute query
    const media = await Media.find(query).sort(sort).skip(skip).limit(limit)

    const total = await Media.countDocuments(query)

    return NextResponse.json({
      media,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching media:", error)
    return NextResponse.json({ message: "Error fetching media" }, { status: 500 })
  }
}
