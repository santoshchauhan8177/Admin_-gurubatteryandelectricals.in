import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Category from "@/models/Category"
import { authMiddleware } from "@/lib/auth-middleware"
import { uploadImage } from "@/lib/cloudinary"

// GET - Get all categories with pagination and filtering
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const parentOnly = searchParams.get("parentOnly") === "true"
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    if (parentOnly) {
      query.parent = { $exists: false }
    }

    // Build sort
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Execute query
    const categories = await Category.find(query).sort(sort).skip(skip).limit(limit).populate("parent", "name")

    const total = await Category.countDocuments(query)

    return NextResponse.json({
      categories,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ message: "Error fetching categories" }, { status: 500 })
  }
}

// POST - Create a new category
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const formData = await req.formData()

    // Extract category data
    const name = formData.get("name") as string
    const description = formData.get("description") as string | null
    const parent = formData.get("parent") as string | null
    const isActive = formData.get("isActive") === "true"

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug })
    if (existingCategory) {
      return NextResponse.json({ message: "A category with this name already exists" }, { status: 400 })
    }

    // Handle image upload
    let imageUrl = null
    const imageFile = formData.get("image") as File | null
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = `data:${imageFile.type};base64,${buffer.toString("base64")}`

      imageUrl = await uploadImage(base64)
    }

    // Create category
    const categoryData: any = {
      name,
      slug,
      isActive,
    }

    if (description) categoryData.description = description
    if (parent) categoryData.parent = parent
    if (imageUrl) categoryData.image = imageUrl

    const category = await Category.create(categoryData)

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ message: "Error creating category" }, { status: 500 })
  }
}
